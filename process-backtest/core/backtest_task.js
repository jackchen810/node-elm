'use strict';
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const DB = require('../../models/models');

class BacktestClass {
    constructor(){
        this.backtestTaskMap = new Map(); // 空Map
    }

    async backtest_task_add(taskObj, response)  {
        console.log('[backtest] add task');


        //添加策略实例,
        var task_id = taskObj['task_id'];
        //var task_type = taskObj['task_type'];   // 自动交易：'trade'; 机器人模拟交易：'simulate'; 交易回测：'backtest'
        //var trade_symbol = taskObj['trade_symbol'];   //交易标的
        var bt_start_time = taskObj['bt_start_time'];
        var bt_end_time = taskObj['bt_end_time'];
        var strategy_list = taskObj['strategy_list'];        //获取表单数据，josn


        ///路径有效性检查
        /*strategy_list
        * {
                stock_symbol:'',
                stock_name:'',
                stock_ktype:'',
                strategy_name:'',
         }
        * */
        console.log('[backtest] strategy_list.length:', strategy_list.length);
        for (var i = 0; i < strategy_list.length; i++) {
            ///路径有效性检查
            var strategy_name = strategy_list[i]["strategy_name"];
            var stock_ktype = strategy_list[i]["stock_ktype"];
            var stock_symbol = strategy_list[i]["stock_symbol"];
            console.log('[backtest] scan strategy_list:', i);
            console.log('[backtest] strategy_name:', strategy_name);
            //console.log('[backtest] add strategy_obj:', JSON.stringify(strategy_obj));
            var wherestr = { "date" : { "$gte" : bt_start_time, "$lt" : bt_end_time}};
            var queryList = await DB.KHistory(stock_ktype, stock_symbol).find(wherestr).exec();
            console.log('[backtest] KHistory queryList:', queryList);

            //增加数据
            strategy_list['kdata'] = queryList;
        }

        //map映射，push value
        this.backtestTaskMap.set(task_id, taskObj); // 添加新的key-value
        this.task_id = task_id;

        //console.log('[backtest] this:', this);
        //console.log('[backtest] add backtestTaskMap:', JSON.stringify(taskObj));
        console.log('[backtest] add backtestTaskMap size', this.backtestTaskMap.size);

        //console.log('add task ok:', task);
        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        //response.send(msgObj, 'log_record', 'log', 'http');
        console.log('[backtest] add task ok');
    }


    async backtest_task_del(taskObj, response){
        console.log('[backtest] del task');

        var task_id = taskObj['task_id'];
        console.log('[backtest] delete backtestTaskMap');

        //删除实例
        this.backtestTaskMap.delete(task_id);
        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        console.log('[backtest] del task ok');
    }


}

//导出模块
module.exports = new BacktestClass();


