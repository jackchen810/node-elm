'use strict';
const DB = require('../../models/models.js');
const http = require('http');
const IfengDownloadBaseClass = require("../../prototype/BaseClass_dl_ifeng.js");
const  DownloaderTxHandle = require("../market_tx");
const dtime = require('time-formater');

//策略要继承基类
module.exports = class IfengDownloadDataClass {
    constructor(ktype) {

        this.ktype = ktype;

        this.K_TYPE = {
            day: 'akdaily',
            week: 'akweekly',
            month: 'akmonthly',
            minute: 'akmin',
        };

        //绑定，this
        this.convert_to_url = this.convert_to_url.bind(this);
        this.updateDatabase = this.updateDatabase.bind(this);

        // 需要bind，否则this指向上级对象
        // bind()会创建一个函数，函数体内的this对象的值会被绑定到传入bind()第一个参数的值
        // 将this 绑定到函数内部的this
        // 否则函数内部的this有可能出错
        this.timer_callback = this.timer_callback.bind(this);
        console.log('IfengDownloadDataClass constructor');
    }

    async updateDatabase(symbol, ktype) {

        console.log('[download] ready to download data');
        var record = await this.to_download(ktype, 'fq', symbol);

        var data = record['record'];
        if (typeof(data) === 'undefined') {
            console.log('[download] not return record');
            return;
        }

        console.log('[download] dl k data to %s db', ktype, JSON.stringify(data[0]));
        for (var i = 0; i < data.length; i++) {
            var item = data[i];

            //"2018-04-10 11:20:00" 记录转换为 '2018-04-10 11:20' 和tushare保持一致
            //day 数据也可以兼容
            var date = item[0].substr(0, 16);
            //console.log('to date', date);

            //更新到设备数据库
            var wherestr = {'code': symbol, 'date': date};
            var updatestr = {
                'code': symbol,

                'date': date,
                //'time': time_array[1],

                'open': item[1],
                'high': item[2],
                'close': item[3],
                'low': item[4],
                'volume': item[5],
            };
            await DB.KHistory(ktype, symbol).update(wherestr, updatestr, {upsert: true}).exec();
        }
    }

    /* 实例入口，根据时间调用 */
    /* 实例入口，定时时间是通过页面设置 */
    async timer_callback() {
        console.log('[dl_by_ifeng] timer_callback, ktype:',this.ktype);

        if (this.ktype == '' || this.ktype == undefined){
            var queryList = await DB.BasicsTable.find().exec();
            console.log('download all data:', queryList.length);
            for (var i = 0; i < queryList.length; i++) {
                //console.log('download ', queryList[i]['code']);
                await this.updateDatabase(queryList[i]['code'], 'day');
                await this.updateDatabase(queryList[i]['code'], '5');
                await this.updateDatabase(queryList[i]['code'], '15');
                await this.updateDatabase(queryList[i]['code'], '30');
                await this.updateDatabase(queryList[i]['code'], '60');

            }
        }
        else {
            var queryList = await DB.BasicsTable.find().exec();
            console.log('download ktype:', this.ktype);
            for (var i = 0; i < queryList.length; i++) {
                await this.updateDatabase(queryList[i]['code'], this.ktype);
            }
        }

        //完成后，直接进行选股操作
        /*
        var msgObj = {
            'task_id':  DB.guid(),
            'task_type': 'pickstock',  //任务结果
            'strategy_name': 'pick_strategy_base_3.js',   // 策略名称
        };
        */

        //完成后选股
        //DownloaderTxHandle.send([msgObj], 'pickstock.task', 'add', 'picker');

        console.log('[dl_by_ifeng] timer_callback, ok. ', dtime().format('YYYY-MM-DD HH:mm:ss'));
    }



    /*
    *  ktype支持下面类型：
    *  5， 15， 30， 60，day，week，month
    * */

    convert_to_url(ktype, autype, symbol) {
        var _symbol = ('6' === symbol[0]) ? ('sh'+symbol) : ('sz'+symbol);
        var _ktype = (ktype in this.K_TYPE) ? this.K_TYPE[ktype] : this.K_TYPE.minute;
        var type = (_ktype === this.K_TYPE.minute ? ktype : autype);
        var codeStr = (_ktype === this.K_TYPE.minute ? 'scode' : 'code');
        return `http://api.finance.ifeng.com/${_ktype}/?${codeStr}=${_symbol}&type=${type}`;
    };

    //http://api.finance.ifeng.com/akmin/?scode=sh601989&type=5
    //http://api.finance.ifeng.com/akmin/?scode=sz002500&type=15
    //http://api.finance.ifeng.com/akmin/?scode=sz002500&type=30
    //http://api.finance.ifeng.com/akmin/?scode=sz002500&type=60
    //http://api.finance.ifeng.com/akdaily/?code=sz002500&type=fq
    //http://api.finance.ifeng.com/akdaily/?code=sz002500&type=last
    //day format: {"record":[["2015-04-20","20.800","20.800","19.140"   ...
    //minute format: {"record":[["2018-04-10 11:20:00","5.54","5.55","5.53",   ...
    async to_download(ktype, autype, symbol) {
        var self = this;

        var p = new Promise(function (resolve, reject) {        //做一些异步操作
            var url = self.convert_to_url(ktype, autype, symbol);

            console.log('[ifeng] get %s, http url:', ktype, url, new Date());
            //get 请求外网
            http.get(url, function (req, res) {
                var data_str = '';
                req.on('data', function (chunk) {
                    data_str += chunk
                });

                req.on('end', function () {
                    try{
                        var jsonObj = JSON.parse(data_str);
                    }
                    catch(err) {
                        return resolve([]);
                    }

                    //console.log('http data:', jsonObj);
                    //回调函数
                    return resolve(jsonObj);
                });

                req.on('error', function (e) {
                    console.log('problem with request: ' + e.message);
                    return resolve([]);
                });

            });
        });

        return p;
    }


};