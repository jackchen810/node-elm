
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
//const response = require("./gateway_rxtx");

class GatewayClass {
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

    async addTask(request, response) {
        console.log('[gateway] add task');

        var task_group = [];

        // 3. 发送已有的bar数据，启动定时器发送
        // 启动任务，行情
        for (var i = 0; i < request.length; i++){

            var task_id = request[i]['task_id'];
            var task_type = request[i]['task_type'];
            var trade_symbol = request[i]['trade_symbol'];
            var trade_ktype = request[i]['trade_ktype'];
            var market_gateway = request[i]['market_gateway'];

            ///导入strategy_list
            console.log('[gateway] trade_symbol:', trade_symbol);
            console.log('[gateway] market_gateway:', market_gateway);
            //tradeLog('system', 'start timer', task_id);

            //触发者是交易点，不需要器定时器， 只有ktype才需要起定时器
            if (trade_ktype == 'order_point'){
                continue;
            }

            // 路径有效性检查 riskctrl
            var market_gateway_fullname = path.join(__dirname, '../../', config.market_gateway_dir, market_gateway);
            if (fs.existsSync(market_gateway_fullname) == false) {
                var msgObj = {ret_code: -1, ret_msg: 'FAIL', extra: task_id};
                response.send(msgObj);
                console.log('[gateway] market_gateway path not exist:', market_gateway_fullname);
                return -1;
            }


            //console.log('[gateway] to_download', market_gateway_fullname);
            //3. 下载数据，进行同步, 根据策略中的标的和ktype 进行同步
            var market_gateway = require(market_gateway_fullname);
            var barList = await market_gateway.to_download(trade_ktype, 'fq', trade_symbol);

            // 发送已有bar数据
            if (barList.length > 0) {
                console.log('to_download data:', barList[0]);
                response.send(barList, 'on_bar_sync', trade_ktype, 'worker');
            }

            //4. 加载market，启动定时器， 发出on_bar 数据
            market_gateway.on_start(trade_symbol, trade_ktype);
            //console.log(__filename, 'add task on_start');

            var task = {
                'task_id': task_id,
                'task_type': task_type,
                'trade_symbol': trade_symbol,
                'trade_ktype': trade_ktype,
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


    async delTask(request, response){
        console.log('[gateway] del task');

        // 启动任务，行情
        for (var i = 0; i < request.length; i++){
            var task_id = request[i]['task_id'];
            var trade_symbol = request[i]['trade_symbol'];
            var trade_ktype = request[i]['trade_ktype'];
            var market_gateway = request[i]['market_gateway'];

            ///导入strategy_list
            console.log('[gateway] trade_symbol:', trade_symbol);
            //tradeLog('system', 'stop timer', task_id);

            //触发者是交易点，不需要器定时器， 只有ktype才需要起定时器
            if (trade_ktype == 'order_point'){
                continue;
            }

            // 路径有效性检查 riskctrl
            //添加行情定时获取接口
            var market_gateway_fullname = path.join(__dirname, '../../', config.market_gateway_dir, market_gateway);
            if (fs.existsSync(market_gateway_fullname) == false) {
                var msgObj = {ret_code: -1, ret_msg: 'FAIL', extra: task_id};
                response.send(msgObj);
                console.log('[gateway] market_gateway path not exist:', market_gateway_fullname);
                return -1;
            }

            //1. 加载market
            var market_gateway_class = require(market_gateway_fullname);
            market_gateway_class.on_stop(trade_symbol, trade_ktype);
            //console.log(__filename, 'del task on_stop');
        }


        console.log('[gateway] delete taskMap');

        //删除实例
        this.taskMap.delete(task_id);
        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        console.log('[gateway] del task ok');
    }


}

//导出模块
module.exports = new GatewayClass();


