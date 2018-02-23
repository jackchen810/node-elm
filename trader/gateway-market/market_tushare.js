'use strict';
import WorkerHnd from "../worker/worker_agent";
import { stock } from 'tushare';

const BaseMarket = require("../../prototype/marketBaseClass");
const BaseObj = require("../../prototype/objectBaseClass");

var http = require('http');
var schedule = require('node-schedule');

//策略要继承基类
class TushareMarketClass extends BaseMarket {
    constructor(){
        super();

        this.timer_callback = this.timer_callback.bind(this);
        this.timer_callback_min1 = this.timer_callback_min1.bind(this);
        this.timer_callback_min5 = this.timer_callback_min5.bind(this);
        this.timer_callback_min15 = this.timer_callback_min15.bind(this);
        //this.timer_callback_min30 = this.timer_callback_min30.bind(this);
        //this.timer_callback_min60 = this.timer_callback_min60.bind(this);

        this.onStart = this.onStart.bind(this);

        this.url = 'http://hq.sinajs.cn/list=';
        this.baseUrl = 'http://hq.sinajs.cn/list=';

        //console.log('timerMap----:', this.timerMap);
        // 注册各个级别定时器
        this.timer_register_callback(this.timerMap, '1', '0 * * * * *', this.timer_callback_min1);
        this.timer_register_callback(this.timerMap, '5', '*/5 * * * * *', this.timer_callback_min5);
        this.timer_register_callback(this.timerMap, '15', '* */15 * * * *', this.timer_callback_min15);


        //初始化行情接口，连接行情接口
        this.onInit();

        //this.onStart('002500', '5');
        //this.onStart('002501', '5');
        stock.getAllStocks().then(({ data }) => {
            console.log('tushare', data);
        });
    }


    async onInit() {
        console.log('market onInit:');

    }
    async onDestory() {
        console.log('market onDestory:');

    }


    async timer_callback(ktype, url, symbol_set) {
        console.log('get %s, http url:', ktype, url, new Date());

        //get 请求外网
        http.get(url, function(req, res){
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

                var message = new Array();
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

                    message[i] = BaseObj.get_bar_object();
                    message[i]['symbol'] = symobl;
                    message[i]['name'] = fields[0];

                    message[i]['open'] = fields[1];
                    message[i]['close'] = fields[2];
                    message[i]['high'] = fields[4];
                    message[i]['low'] = fields[5];
                    message[i]['price'] = fields[3];

                    // volume: '',             // 成交量
                    message[i]['volume'] = fields[8];

                    message[i]['date'] = fields[30];
                    message[i]['time'] = fields[31];
                    // symbol_array[i];
                }


                WorkerHnd.onBar(message);
            });

            req.on('end',function(){
                console.log('end');
            });
        });
    }



    //启动定时器, 1分钟
    async timer_callback_min1() {
        var ktype = '1';
        var timerDict = this.timerMap.get(ktype);
        this.timer_callback(ktype, timerDict['url'], timerDict['symbol_set']);
    }


    async timer_callback_min5() {
        var ktype = '5';
        var timerDict = this.timerMap.get(ktype);
        this.timer_callback(ktype, timerDict['url'], timerDict['symbol_set']);
    }

    async timer_callback_min15() {
        var ktype = '15';
        var timerDict = this.timerMap.get(ktype);
        this.timer_callback(ktype, timerDict['url'], timerDict['symbol_set']);
    }

    //启动定时器, 行情定时器
    async onStart(stock_symbol, stock_ktype) {
        console.log(__filename, 'onStart:', stock_symbol, stock_ktype);
        //timerMap: ('1', {'symbol_set':new Set(), 'timer': '', 'url':''});

        if (!(this.timerMap.has(stock_ktype))){
            return -1;
        }


        var timerDict = this.timerMap.get(stock_ktype);
        var symbol_set = timerDict['symbol_set'];
        var url = timerDict['url'];
        var timer_job_cron = timerDict['timer_job_cron'];
        var timer_callback = timerDict['timer_callback'];

        //console.log('timerDict:', timerDict);
        console.log('stock_ktype:', stock_ktype);

        //添加标的set集合
        symbol_set.add(stock_symbol);
        if (symbol_set.size > 0 && timerDict['timer_job_handle'] == ''){
            timerDict['timer_job_handle'] = schedule.scheduleJob(timer_job_cron, timer_callback);
        }

        //console.log('timerDict:', timerDict);
        console.log('baseUrl:', this.url);

        //this.url = this.baseUrl;
        var list = '';
        if (stock_symbol[0] == 6) {
            // 循环调用对应的策略模块进行处理
            symbol_set.forEach(function (value, index, array) {
                list += 'sh' + value + ',';
            });
        }
        else {
            // 循环调用对应的策略模块进行处理
            symbol_set.forEach(function (value, index, array) {
                list += 'sz' + value + ',';
            });
        }

        this.url = this.baseUrl + list;
        timerDict['url'] = this.url;
        console.log('symbol_set:', list);
        //console.log('this.timerMap:', this.timerMap);

    }



    //停止定时器, 行情定时器
    async onStop(stock_symbol, stock_ktype) {

        var timerDict = this.timerMap.get(stock_ktype);
        var symbol_set = timerDict['symbol_set'];


        //删除标的set集合
        symbol_set.delete(stock_symbol);
        if (symbol_set.size == 0 && timerDict['timer_job_handle'] != ''){
            timerDict['timer_job_handle'].cancel();
            timerDict['timer_job_handle'] = '';
        }
    }



}
console.log('create worker TushareMarketClass');

//导出模块
module.exports = new TushareMarketClass();
