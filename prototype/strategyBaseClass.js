'use strict';
const TraderTx = require("../process-trade/trader_tx.js");
const dtime = require('time-formater');
//const talib = require('talib/build/Release/talib');

module.exports = class BaseStrategy {
    constructor(){
        //记录任务id
        this.strategy_name = '';
        this.barObj = {'date':''};
        this.task_id = '';
        this.task_type = '';  //trade, order_point,
        this.symbol = '';
        this.symbol_name = '';
        this.ktype = '';
        this.buysell_point = 'none';  //buy, sell, node
        this.remove_count = 3;//买卖点恢复周期

        this.record_log = true;
        this.record_db = true;
        this.history_bar = [];   // 历史数据，初次启动需要同步一次历史数据，防止指标计算错误

        //绑定，this
        this.on_init = this.on_init.bind(this);
        this.on_deinit = this.on_deinit.bind(this);
        this.on_tick = this.on_tick.bind(this);
        this.on_bar = this.on_bar.bind(this);

        this.to_buy_point = this.to_buy_point.bind(this);
        this.to_sell_point = this.to_sell_point.bind(this);

        this.get_trade_obj = this.get_trade_obj.bind(this);
        this.decimal = this.decimal.bind(this);
        this.talibSync = this.talibSync.bind(this);
    }

    //__init  ----不需要用户修改
    //task_type:
    async on_init(task_id, task_type, symbol, symbol_name, ktype, strategy_name){
        this.task_id = task_id;
        this.task_type = task_type;
        this.symbol = symbol;
        this.symbol_name = symbol_name;
        this.ktype = ktype;
        this.strategy_name = strategy_name;

        //console.log('111111', ktype);
        return;
    }
    //销毁函数
    async on_deinit(task_id){

        //console.log('111111', ktype);
        return;
    }



    //on_tick 收到tick行情数据时回调
    //tick级别的可以为高频交易做准备， tick 只更新价格
    async on_tick(stock, pirce){
        throw new Error('strategy on_tick 需要用户实现');
        return;
    }

    //on_bar   收到分钟线数据的时回调
    /*code, name, open, close, high, low, volume, date, time*/
    async on_bar(ktype, msgObj){
        throw new Error('strategy on_bar 需要用户实现');
        return;
    }

    //to_buy_point  生成买点
    async to_buy_point(stock, ktype, msgObj){
        //console.log('to_buy', msgObj);
        //防止重复发送, 发送一次
        if (this.buysell_point != 'buy'){
            TraderTx.send(msgObj, 'buysell.point', 'buy', ['backtest', 'gateway']);
            this.buysell_point = 'buy';
        }


        if (this.record_db == true){
            //记录到买卖点数据库
            //msgObj['order_position'] = event
            //TraderTx.send(msgObj, 'trade_record', 'buy', 'httper');
        }

        if (this.record_log == true) {
            //记录到log数据库
            //TraderTx.send(msgObj, 'log_record', event, 'http');
        }
        return;
    }


    //生成卖点
    ///任何买卖点的恢复，3个周期后恢复
    async to_sell_point(stock, ktype, msgObj){
        //console.log('to_sell');
        //防止重复发送, 发送一次
        if (this.buysell_point != 'sell') {
            TraderTx.send(msgObj, 'buysell.point', "sell", ['backtest', 'gateway']);
            this.buysell_point = 'sell';
        }

        if (this.record_db == true){
            //记录到买卖点数据库
            //msgObj['order_position'] = event
            //TraderTx.send(msgObj, 'trade_record', "sell", 'httper');
        }

        if (this.record_log == true) {
            //记录到log数据库
            //TraderTx.send(msgObj, 'log_record', event, 'http');
        }
        return;
    }

    ///买卖点的恢复，默认remove_count 次数后恢复
    ///on_bar 函数中调用
    ///按照次数进行更新
    async update_buysell_point(ktype, msgObj){
        this.remove_count--;

        //防止重复发送, 发送一次
        if (this.buysell_point != 'none' && this.remove_count <= 0) {
            TraderTx.send(msgObj, 'buysell.point', "none", ['backtest', 'gateway']);
            this.buysell_point = 'none';
        }

    }

    async get_buysell_point(){
        return this.buysell_point;
    }


    //get_trade_obj  获取交易对象
    //order_position:'sell','buy'
    get_trade_obj(order_position, price, amount){
        var trade_obj = {
            'task_id': this.task_id,
            'task_type': this.task_type,
            'trade_symbol': this.symbol,
            'trade_symbol_name': this.symbol_name,
            'trade_amount': amount,
            'trade_ktype': this.ktype,
            'order_position': order_position,
            'strategy_name': this.strategy_name,
            'price': price,
            'order_point_at': dtime().format('YYYY-MM-DD HH:mm:ss'),   //时间
        };
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


};
