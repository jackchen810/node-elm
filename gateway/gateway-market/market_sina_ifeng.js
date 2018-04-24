'use strict';
const GatewayTx = require("../gateway_tx");
const BaseMarket = require("../../prototype/marketBaseClass");
const BaseObj = require("../../prototype/objectBaseClass");

const http = require('http');
const iconv = require('iconv-lite');
const schedule = require('node-schedule');
const dtime = require("time-formater");

//策略要继承基类
class IfengMarketClass extends BaseMarket {
    constructor(){
        super();

        this.K_TYPE = {
            day: 'akdaily',
            week: 'akweekly',
            month: 'akmonthly',
            minute: 'akmin',
        };

        console.log(('5' in this.K_TYPE) ? this.K_TYPE['5'] : this.K_TYPE.minute)

        //绑定，this
        this.price_url = this.price_url.bind(this);
        this.to_download = this.to_download.bind(this);

        this.on_start = this.on_start.bind(this);
        this.timer_callback = this.timer_callback.bind(this);


        this.tick_url_list = '';
        this.tick_url = 'http://hq.sinajs.cn/list=';
        this.timer_job_handle = null;

        this.current_minute = '';
        var bar_data = BaseObj.get_bar_object();



        //初始化行情接口，连接行情接口
        this.onInit();

        //this.on_start('002500', '5');
        //this.on_start('002501', '5');
    }


    async onInit() {
        console.log('[market] market onInit:');

    }
    async onDestory() {
        console.log('[market] market onDestory:');

    }

    async timer_callback() {
        console.log('[market] get tick:', dtime().format('YYYY-MM-DD HH:mm:ss'), ' tick_url_list:',this.tick_url_list);

        //get 请求外网
        var self = this;
        http.get(this.tick_url_list, function(req, res){
            var data_buf = [];
            var bufLength = 0;
            req.on('data', function(chunk) {
                data_buf.push(chunk);
                bufLength += chunk.length;
            });
            req.on('end',function(){
                //console.log('http data:', data.toString());
                var chunkAll = Buffer.concat(data_buf, bufLength);
                var strJson = iconv.decode(chunkAll,'gb2312'); // 汉字不乱码
                //console.log('http data:', strJson);

                //var message = new Array();
                var tick_data= BaseObj.get_tick_object();
                var symbol_array = strJson.split(";");   ///解析多个标的字符串
                for (var i = 0; i< symbol_array.length; i++) {
                    //console.log('symobl:', symbol_array[i]);
                    var data_substr = symbol_array[i].match(/\"(\S*)(?=\")/);
                    if (data_substr == null) {
                        continue;
                    }

                    ///symbol
                    var n = symbol_array[i].search(/[0-9]/) ;
                    if (n == -1) {
                        continue;
                    }


                    var fields = data_substr[1].split(",");
                    var symobl = symbol_array[i].substr(n, 6);

                    //console.log('symobl %s match:', symobl, fields);
                    tick_data['code'] = symobl;
                    tick_data['name'] = fields[0];

                    tick_data['price'] = fields[3];

                    // volume: '',             // 成交量
                    tick_data['volume'] = fields[8];

                    tick_data['date'] = fields[30];
                    tick_data['time'] = fields[31];

                    //////使用当前时间进行测试/////
                    //tick_data['date'] = dtime().format('YYYY-MM-DD');
                    //tick_data['time'] = dtime().format('HH:mm:ss');
                    ////////////////////////
                   // symbol_array[i];

                    //WorkerHnd.onTick(tick_data);
                    //GatewayTx.send(tick_data, 'on_tick', '', 'worker');
                    self.create_bar_min(tick_data, '1', function (barObj) {
                        GatewayTx.send(tick_data, 'on_bar', '1', 'worker');
                        //WorkerHnd.onBar('1', barObj);
                    });
                    self.create_bar_min(tick_data, '5', function (barObj) {
                        GatewayTx.send(tick_data, 'on_bar', '5', 'worker');
                        //WorkerHnd.onBar('5', barObj);
                    });
                }

                //WorkerHnd.onTick(message);
            });

        });
    }




    //启动定时器, 行情定时器
    async on_start(stock_symbol, stock_ktype) {
        console.log('[market] Timer on_start:', stock_symbol, stock_ktype);
        //timerMap: ('1', {'symbol_set':new Set(), 'timer': '', 'url':''});
        //是否有对应的k 线字典，如果没有，直接返回
        if (!(this.ktypeMap.has(stock_ktype))){
            return -1;
        }

        var ktypeDict = this.ktypeMap.get(stock_ktype);
        if(typeof(ktypeDict)==="undefined"){
            console.log('[market] ktypeDict undefined, ktype:', stock_ktype);
            return;
        }

        var symbol_list = ktypeDict['symbol_list'];
        // 如果没有定义symbol_list
        if(typeof(symbol_list)==="undefined"){
            console.log('[market] symbol_list undefined, ktype:', stock_ktype);
            return;
        }

        console.log('[market] stock_ktype:', stock_ktype);

        //添加标的到对应数组
        symbol_list.push(stock_symbol);
        symbol_list = Array.from(new Set(symbol_list));
        if (symbol_list.length > 0 && this.timer_job_handle === null){
            //this.timer_job_handle = schedule.scheduleJob('*/5 * 9,10,11,13,14 * * 1,2,3,4,5', this.timer_callback);
            //工作日：1,2,3,4,5  每隔3秒 获取一次tick
            this.timer_job_handle = schedule.scheduleJob('*/3 * * * * 1,2,3,4,5', this.timer_callback);
        }

        console.log('[market] symbol_list:', symbol_list);

        //this.url = this.baseUrl;
        if (stock_symbol[0] == 6) {
            this.all_symbols.add('sh' + stock_symbol);
        }
        else {
            this.all_symbols.add('sz' + stock_symbol);
        }

        var list = Array.from(this.all_symbols);
        this.tick_url_list = this.tick_url + list.join();

        console.log('this.tick_url_list:', this.tick_url_list);
        //console.log('this.timerMap:', this.timerMap);
    }



    //停止定时器, 行情定时器
    async on_stop(stock_symbol, stock_ktype) {
        console.log('[market] Timer on_stop:', stock_symbol, stock_ktype);

        var ktypeDict = this.ktypeMap.get(stock_ktype);
        if(typeof(ktypeDict)==="undefined"){
            console.log('[market] ktypeDict undefined, ktype:', stock_ktype);
            return;
        }

        var symbol_list = ktypeDict['symbol_list'];
        // 如果没有定义symbol_list
        if(typeof(symbol_list)==="undefined"){
            console.log('[market] symbol_list undefined, ktype:', stock_ktype);
            return;
        }

        //删除标的set集合
        this.all_symbols.delete(stock_symbol);

        //删除标的set集合
        for (var i = 0; i < symbol_list.length; i++) {
            if (symbol_list[i] == stock_symbol) {
                symbol_list.splice(i, 1);
            }
        }

        if (symbol_list.length == 0 && this.timer_job_handle != null){
            this.timer_job_handle.cancel();
        }
    }


    async price_url(ktype, autype, symbol) {
        var _symbol = ('6' === symbol[0]) ? ('sh'+symbol) : ('sz'+symbol);
        var _ktype = (ktype in this.K_TYPE) ? this.K_TYPE[ktype] : this.K_TYPE.minute;
        var type = (_ktype === this.K_TYPE.minute ? ktype : autype);
        var codeStr = (_ktype === this.K_TYPE.minute ? 'scode' : 'code');
        return `http://api.finance.ifeng.com/${_ktype}/?${codeStr}=${_symbol}&type=${type}`;
    };

    async change_bar(symbol, data_str) {

        //字符串转换成对象
        try{
            var jsonObj = JSON.parse(data_str);
        }
        catch(err) {
            console.log(symbol, ' price_url catch error: ' + err, ',data_str:', data_str);
            return [];
        }

        var data = jsonObj['record'];
        //console.log('slice data, length:%d, data0:', data.length, data[0]);

        var barList = [];
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            //var time_array = item[0].split(" ");

            //console.log('to item', item);
            var barObj = {
                'code': symbol,
                'name': '',

                'open': item[1],
                'high': item[2],
                'close': item[3],
                'low': item[4],

                'volume': item[5],

                'date': item[0].slice(0, 16),
                'time': item[0],
            };
            barList.push(barObj);
        }

        //console.log('barList, length:%d, barList0:', barList.length, barList[0])
        return barList;
    };

    //http://api.finance.ifeng.com/akdaily/?code=sh601989&type=last
    //http://api.finance.ifeng.com/akmin/?scode=sh601989&type=5
    //http://api.finance.ifeng.com/akmin/?scode=sz002500&type=5
    async to_download(ktype, autype, symbol) {
        var self = this;
        return new Promise(async function(resovle, reject) {
            var url = await self.price_url(ktype, autype, symbol);
            console.log('[market] get %s, http url:', ktype, url, new Date());

            //get 请求外网
            http.get(url, function (req, res) {
                var data_str = '';
                req.on('data', function (chunk) {
                    data_str += chunk
                });

                req.on('end', function () {
                    //console.log('http data_str:', data_str);
                    var barList = self.change_bar(symbol, data_str);
                    //console.log('http data:', barList[0]);
                    return resovle(barList);
                });

                req.on('error', function (e) {
                    console.log('problem with request: ' + e.message);
                    return resovle([]);
                });
            });
        });
    }


}
console.log('create worker IfengMarketClass');

//导出模块
module.exports = new IfengMarketClass();
