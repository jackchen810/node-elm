'use strict';
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const DB = require('../../models/models');

class BacktestResultClass {
    constructor(){
        this.backtestTaskMap = new Map(); // 空Map
    }

/*
        var trade_obj = {
            'task_id': this.task_id,
            'task_type': this.task_type,
            'trade_symbol': this.symbol,
            'trade_amount': amount,
            'trade_ktype': this.ktype,
            'order_position': order_position,
            'strategy_name': this.strategy_name,
            'price': price,
            'buysell_point_at': dtime().format('YYYY-MM-DD HH:mm:ss'),   //时间
        };
* */

    async backtest_buy_point_add(tradeObj){
        console.log('[backtest] buy_point add');

        var task_id = tradeObj['task_id'];
        var task_type = tradeObj['task_type'];


        //更新到设备数据库， 交易的标的不能够重复,
        var wherestr = {'task_type': task_type, 'task_id': task_id};
        console.log('buy_point task:', JSON.stringify(wherestr));

        //参数检查
        var query = await DB.BacktestResultTable.findOne(wherestr).exec();
        if (query != null) {

            return;
        }



        console.log('[backtest] buy_point add end');
    }


    async backtest_sell_point_add(request, response){
        console.log('[backtest] sell_point add');

        var task_id = request[0]['task_id'];


        //更新到设备数据库， 交易的标的不能够重复, index=0 是主策略
        var wherestr = {'task_type': task_type, 'trade_symbol': trade_symbol};
        console.log('task:', JSON.stringify(wherestr));

        //参数检查
        var query = await DB.BacktestResultTable.findOne(wherestr).exec();
        if (query != null) {

            return;
        }



        console.log('[backtest] sell_point add end');
    }
}

//导出模块
module.exports = new BacktestResultClass();


