
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
//const response = require("./gateway_rxtx");

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

    async backtest_addTask(request, response) {
        console.log('[gateway] add task');

        var task_group = [];

        // 3. 发送已有的bar数据，启动定时器发送
        // 启动任务，行情
        for (var i = 0; i < request.length; i++){

            var task_id = request[i]['task_id'];
            var task_type = request[i]['task_type'];
            var trade_symbol = request[i]['trade_symbol'];
            var trade_trigger = request[i]['trade_trigger'];
            var market_gateway = request[i]['market_gateway'];

            ///导入strategy_list
            console.log('[gateway] trade_symbol:', trade_symbol);
            console.log('[gateway] market_gateway:', market_gateway);
            //tradeLog('system', 'start timer', task_id);

            //触发者是交易点，不需要器定时器， 只有ktype才需要起定时器
            if (trade_trigger == 'trade'){
                continue;
            }


            var wherestr = {'task_id': task_id};
            var queryList = await DB.KHistory(trade_trigger, trade_symbol).find(wherestr).exec();


            // 发送已有bar数据
            if (queryList.length > 0) {
                console.log('to_download data:', queryList[0]);
                response.send(queryList, 'backtest_bar', trade_trigger, 'worker');
            }


            var task = {
                'task_id': task_id,
                'task_type': task_type,
                'trade_symbol': trade_symbol,
                'trade_trigger': trade_trigger,
                'market_gateway': market_gateway,
            }

            task_group.push(task);
        }

        //同一个emitter 可以event通信，不同
        this.taskMap.set(task_id, task_group); // 添加新的key-value

        //console.log('add task ok:', task);
        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        console.log('[gateway] add task ok');
    }


    async backtest_delTask(request, response){
        console.log('[gateway] del task');

        var task_id = request[0]['task_id'];
        console.log('[gateway] delete taskMap');

        //删除实例
        this.taskMap.delete(task_id);
        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        console.log('[gateway] del task ok');
    }


}

//导出模块
module.exports = new GatewayBacktestClass();


