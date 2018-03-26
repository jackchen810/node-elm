
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const DB = require('../../models/models');

class GatewayBacktestClass {
    constructor(){

        this.taskMap = new Map(); // 空Map
    }



    /*
    *            'task_id': task_id,
                'trade_symbol': trade_symbol,
                'strategy_list': strategy_list,   //策略名称
                'riskctrl_name': riskctrl_name,   //风控名称
                'gateway_name': gateway_name,   //交易网关名称
    *
    * */

    async backtest_task_add(request, response) {
        console.log('[gateway backtest] add task');

        var task_group = [];

        // 3. 发送已有的bar数据，启动定时器发送
        // 启动任务，行情
        for (var i = 0; i < request.length; i++){

            var task_id = request[i]['task_id'];
            var task_type = request[i]['task_type'];
            var trade_symbol = request[i]['trade_symbol'];
            var trade_ktype = request[i]['trade_ktype'];
            var start_time = request[i]['start_time'];
            var end_time = request[i]['end_time'];

            ///导入strategy_list
            console.log('[gateway] trade_symbol:', trade_symbol);
            console.log('[gateway] trade_ktype:', trade_ktype);
            console.log('[gateway] start_time:', start_time);
            console.log('[gateway] end_time:', end_time);
            //tradeLog('system', 'start timer', task_id);

            //触发者是交易点，不需要器定时器， 只有ktype才需要起定时器
            if (trade_ktype == 'order_point'){
                continue;
            }

            var wherestr = {
                'code': trade_symbol,
                'date': { $gt: start_time, $lte: end_time},
            };
            var queryList = await DB.KHistory(trade_ktype, trade_symbol).find(wherestr).exec();
            console.log('[gateway backtest]  DB.KHistory list', queryList.length);

            // 发送已有bar数据
            if (queryList.length > 0) {
                response.send(queryList, 'backtest_bar', trade_ktype, 'worker');
            }


            var task = {
                'task_id': task_id,
                'task_type': task_type,
                'trade_symbol': trade_symbol,
                'trade_ktype': trade_ktype,
            }

            task_group.push(task);
        }

        //同一个emitter 可以event通信，不同
        this.taskMap.set(task_id, task_group); // 添加新的key-value

        //console.log('add task ok:', task);
        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        console.log('[gateway backtest] add task ok');
    }


    async backtest_task_del(request, response){
        console.log('[gateway backtest] del task');

        var task_id = request[0]['task_id'];
        console.log('[gateway backtest] delete taskMap');

        //删除实例
        this.taskMap.delete(task_id);
        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        console.log('[gateway backtest] del task ok');
    }


}

//导出模块
module.exports = new GatewayBacktestClass();


