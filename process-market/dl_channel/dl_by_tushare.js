'use strict';
const DB = require('../../models/models.js');
const http = require('http');

//策略要继承基类
module.exports = class TushareDlDataClass{
    constructor(ktype) {
        //tushare pro 网站要求 token
        this.host = 'api.tushare.pro';
        this.token = '537480ccc632aad14a862d29f8a7d86ba4e2849911e602c2d335d5c7';
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
    async timer_callback() {
        console.log('timer_callback, ktype:', this.ktype);
        if (this.ktype == '' || this.ktype == 'undefined' ){
            var queryList = await DB.BasicsTable.find().exec();
            for (var i = 0; i < queryList.length; i++) {
                await this.updateDatabase(queryList[i]['code'], 'day');
                await this.updateDatabase(queryList[i]['code'], '5');
                await this.updateDatabase(queryList[i]['code'], '15');
                await this.updateDatabase(queryList[i]['code'], '30');
                await this.updateDatabase(queryList[i]['code'], '60');
            }
        }
        else {
            var queryList = await DB.BasicsTable.find().exec();
            for (var i = 0; i < queryList.length; i++) {
                await this.updateDatabase(queryList[i]['code'], this.ktype);
            }
        }

        //完成后，直接进行选股操作
        var msgObj = {
            'task_id':  DB.guid(),
            'task_type': 'pickstock',  //任务结果
            'strategy_name': 'pick_strategy_base_3.js',   // 策略名称

        };

        //完成后选股
        //DownloaderTxHandle.send([msgObj], 'pickstock.task', 'add', 'picker');
    }

};