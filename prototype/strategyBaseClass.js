'use strict';
const WorkerTx = require("../trader/worker/worker_tx.js");
const dtime = require('time-formater');
const talib = require('talib/build/Release/talib');

module.exports = class BaseStrategy {
    constructor(){
        //记录任务id
        this.strategy_name = '';
        this.barObj = {'date':''};
        this.task_id = '';
        this.task_type = '';  //trade, order_point,
        this.emitter = '';
        this.symbol = '';
        this.ktype = '';
        this.record_log = true;
        this.record_db = true;
        this.history_bar = [];   // 历史数据，初次启动需要同步一次历史数据，防止指标计算错误

        //绑定，this
        this.on_tick = this.on_tick.bind(this);
        this.on_bar = this.on_bar.bind(this);

        this.on_buy_point = this.on_buy_point.bind(this);
        this.on_sell_point = this.on_sell_point.bind(this);

        this.get_trade_obj = this.get_trade_obj.bind(this);
        this.decimal = this.decimal.bind(this);
        this.talibSync = this.talibSync.bind(this);
    }

    //__init  ----不需要用户修改
    //task_type:
    async on_init(emitter, task_id, task_type, symbol, ktype){
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

        //console.log('111111', ktype);
        return;
    }

    async set_name(strategy_name){
        this.strategy_name = strategy_name;
        return;
    }

    async set_bar(barObj){
        this.barObj = barObj;
        return;
    }

    async set_record_flag(db_flag, log_flag){
        this.record_log = log_flag;
        this.record_db = db_flag;
        return;
    }

    //on_tick 收到tick行情数据时回调
    async log(log_type, log_level, msgstr){
        //console.log('tardeLog:', log_type);
        WorkerTx.send(msgstr, 'log', log_type, 'website');
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
        //console.log('to_buy', this.task_type);
        //1. 发送event:on_buy 事件， riskctrl使用
        if (this.task_type == 'trade') {
            var event = 'on_buy';
            this.emitter.emit(event, ktype, msgObj);
        }
        else if (this.task_type == 'order_point') {
            var event = 'on_buy_point';
            this.emitter.emit(event, ktype, msgObj);
        }

        if (this.record_db == true){
            //记录到买卖点数据库
            //msgObj['order_position'] = event
            WorkerTx.send(msgObj, 'trade_record', event, 'website');
        }

        if (this.record_log == true) {
            //记录到log数据库
            //WorkerTx.send(msgObj, 'log_record', event, 'website');
        }
        return;
    }

    //to_sell  发送卖单
    async to_sell(ktype, msgObj){
        //console.log('to_sell');
        //1. 发送event:on_sell 事件， riskctrl使用
        if (this.task_type == 'trade') {
            var event = 'on_sell';
            this.emitter.emit(event, ktype, msgObj);
        }
        else if (this.task_type == 'order_point') {
            var event = 'on_sell_point';
            this.emitter.emit(event, ktype, msgObj);
        }

        if (this.record_db == true){
            //记录到买卖点数据库
            //msgObj['order_position'] = event
            WorkerTx.send(msgObj, 'trade_record', event, 'website');
        }

        if (this.record_log == true) {
            //记录到log数据库
            //WorkerTx.send(msgObj, 'log_record', event, 'website');
        }
        return;
    }

    //get_trade_obj  获取交易对象
    //order_position:'sell','buy'
    get_trade_obj(order_position, price, amount){
        var trade_obj = {
            'task_id': this.task_id,
            'trade_symbol': this.symbol,
            'trade_ktype': this.ktype,
            'strategy_name': this.strategy_name,
            'order_position': order_position,
            'price': price,
            'amount': amount,
            'order_point_at': dtime().format('YYYY-MM-DD HH:mm:ss'),   //时间
            'bar_date': this.barObj['date'],   //时间
        }
        return trade_obj;
    }

    //num表示要四舍五入的数,v表示要保留的小数位数。
    decimal(num,v){
        var vv = Math.pow(10,v);
        return Math.round(num*vv)/vv;
    }

    //talib 同步代码
    async talibSync(talibObj) {
        //console.log('talibSync:', talibObj);
        var promise =  new Promise((resolve, reject) => {
            talib.execute(talibObj, function (err, result) {
                //console.log("result Function err:", err);
                //console.log("Results, result:", result);
                resolve(result);
            });
        });
        return promise;
    }


}
