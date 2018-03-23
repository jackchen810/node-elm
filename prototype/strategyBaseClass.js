'use strict';
const WorkerRxTx = require("../trader/worker/worker_rxtx.js");
const talib = require('talib/build/Release/talib');

module.exports = class BaseStrategy {
    constructor(){
        //记录任务id
        this.task_id = '';
        this.emitter = '';
        this.symbol = '';
        this.ktype = '';
        this.history_bar = [];   // 历史数据，初次启动需要同步一次历史数据，防止指标计算错误
        this.main_strategy = false;

        //绑定，this
        this.on_tick = this.on_tick.bind(this);
        this.on_bar = this.on_bar.bind(this);
        this.on_buy_point = this.on_buy_point.bind(this);
        this.on_sell_point = this.on_sell_point.bind(this);
        this.decimal = this.decimal.bind(this);
    }

    //onInit  ----不需要用户修改
    async onInit(emitter, task_id, task_type, symbol, ktype){
        this.task_id = task_id;
        this.task_type = task_type;
        this.emitter = emitter;
        this.symbol = symbol;
        this.ktype = ktype;

        //监听事件some_event，  主策略产生的 买卖事件
        this.emitter.on('on_tick', this.on_tick);
        this.emitter.on('on_bar', this.on_bar);
        this.emitter.on('on_buy_point', this.on_buy_point);
        this.emitter.on('on_sell_point', this.on_sell_point);

        if (task_type == 'order'){
            this.main_strategy = true;
        }
        //console.log('111111', ktype);
        return;
    }

    //onInit  ----不需要用户修改
    async onInitBar(bar) {
        this.history_bar = bar;
        console.log('history_bar', this.history_bar[0]);
    }

    //on_tick 收到tick行情数据时回调
    async log(log_type, log_level, msgstr){
        //console.log('tardeLog:', log_type);
        WorkerRxTx.send(msgstr, log_type, log_level, 'website');
        return;
    }

    //on_tick 收到tick行情数据时回调
    async on_tick(msgObj){
        throw new Error('strategy on_tick 需要用户实现');
        return;
    }

    //on_bar   收到分钟线数据的时回调
    async on_bar(ktype, msgObj){
        throw new Error('strategy on_bar 需要用户实现');
        return;
    }

    //on_buy_point   收到买点事回调
    async on_buy_point(ktype, msgObj){
        throw new Error('strategy on_buy_point 需要用户实现');
        return;
    }

    //on_sell_point   收到卖点事回调
    async on_sell_point(ktype, msgObj){
        throw new Error('strategy on_sell_point 需要用户实现');
        return;
    }



    //to_buy  发送买单
    async to_buy(ktype, msgObj){
        console.log('to_buy');
        //1. 发送event:on_buy 事件， riskctrl使用
        if (this.main_strategy) {
            this.emitter.emit('on_buy', ktype, msgObj);
        }
        else {
            this.emitter.emit('on_buy_point', ktype, msgObj);
        }

        //记录到买卖点数据库
        WorkerRxTx.send(msgObj, 'buy_point', 'db', 'website');
        WorkerRxTx.send(msgObj, 'buy_point', 'log', 'website');
        return;
    }

    //to_sell  发送卖单
    async to_sell(ktype, msgObj){
        console.log('to_sell');
        //1. 发送event:on_sell 事件， riskctrl使用
        if (this.main_strategy) {
            this.emitter.emit('on_sell', ktype, msgObj);
        }
        else {
            this.emitter.emit('on_sell_point', ktype, msgObj);
        }

        //记录到买卖点数据库
        WorkerRxTx.send(msgObj, 'sell_point', 'db', 'website');
        WorkerRxTx.send(msgObj, 'buy_point', 'log', 'website');
        return;
    }

    //num表示要四舍五入的数,v表示要保留的小数位数。
    decimal(num,v){
        var vv = Math.pow(10,v);
        return Math.round(num*vv)/vv;
    }

    //talib 同步代码
    async talibSync(talibObj) {
        //console.log('talibSync:', talibObj);
        var pms =  new Promise((resolve, reject) => {
            talib.execute(talibObj, function (err, result) {
                //console.log("result Function err:", err);
                //console.log("Results, result:", result);
                resolve(result);
            });
        });

        return pms;
    }
}


