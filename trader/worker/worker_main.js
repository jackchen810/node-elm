var cp = require('child_process');
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const events = require("events");



class WorkerClass {
    constructor(){
        this.strategyList = new Array();
        this.strategyList[0] = ['obj1', 'obj2'];

        //key:task_id      value: {strategy[], riskctrl, gateway}
        /*
        * var task = {
                'task_id': task_id,
                'trade_symbol': trade_symbol,
                'trade_ktype': trade_ktype,
                'emitter': emitter,
                'strategy_list': strategy_list,
                'riskctrl': riskctrl,
                'gateway': gateway,
            }
        *
        * */
        this.taskMap = new Map(); // 空Map



        //监听事件some_event
        //emitter.on('onTick', this.onTickTest);
    }


    async on_tick(ktype, msgObj){
        console.log('WorkerClass on_tick', msgObj['symbol']);
        //emitter.emit(msgObj[''], msgObj['symbol'], msgObj['ktype'], msgObj);

        //收到tick数据， 循环调用对应的策略模块进行处理
        this.taskMap.forEach(function (value, key, map) {
            //console.log('taskMap task_id:', key);
            if (msgObj['symbol'] == value['trade_symbol']) {
                var strategy_list = value['strategy'];
                for (i = 0; i < strategy_list.length; i++) {
                    strategy_list[i].on_tick(msgObj);
                }
            }
        });
    }



    async on_bar(ktype, msgObj){
        console.log('WorkerClass on_bar', ktype, msgObj['symbol']);
        //emitter.emit(msgObj[''], msgObj['symbol'], msgObj['ktype'], msgObj);

        //收到bar数据， 循环调用对应的策略模块进行处理
        this.taskMap.forEach(function (value, key, map) {
            //console.log('taskMap task_id:', key, value);
            if (msgObj['symbol'] == value['trade_symbol']) {
                var strategy_list = value['strategy_list'];
                //console.log (__filename,"strategy_list", strategy_list);
                for (var i = 0; i < strategy_list.length; i++) {
                    value['strategy_list'][i].on_bar(ktype, msgObj);
                }
            }
        });
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
        console.log('[worker] add task');
        var task_id = request['task_id'];
        var trade_symbol = request['trade_symbol'];
        var trade_ktype = request['trade_ktype'];
        var strategy_list = request['strategy_list'];
        var riskctrl_name = request['riskctrl_name'];
        var order_gateway = request['order_gateway'];

        ///导入strategy_list
        console.log('[worker] strategy_list:', strategy_list);

        ///路径有效性检查
        var strategy_fullname = [];
        for (var i = 0; i < strategy_list.length; i++) {
            strategy_fullname[i] = path.join(__dirname, '../../', config.strategy_dir, strategy_list[i]['strategy_name']);
            console.log('[worker] strategy_fullname:', strategy_fullname[i]);
            if (fs.existsSync(strategy_fullname[i]) == false) {
                console.log('strategy path not exist:', strategy_list[i]['strategy_name']);
                response.send({ret_code: -1, ret_msg: 'FAILED', extra: 'strategy path not exist'});
                return;
            }

        }

        ///路径有效性检查 riskctrl
        var riskctrl_fullname = path.join(__dirname, '../../', config.riskctrl_dir, riskctrl_name);
        if (fs.existsSync(riskctrl_fullname) == false) {
            console.log('[worker] riskctrl path not exist:', riskctrl_fullname);
            response.send({ret_code: -1, ret_msg: 'FAILED', extra: 'riskctrl path not exist'});
            return;
        }

        ///路径有效性检查 gateway
        var gateway_fullname = path.join(__dirname, '../../', config.order_gateway_dir, order_gateway);
        if (fs.existsSync(gateway_fullname) == false) {
            console.log('[worker] gateway path not exist:', gateway_fullname);
            response.send({ret_code: -1, ret_msg: 'FAILED', extra: 'gateway path not exist'});
            return;
        }

        //添加策略实例, 线创建emitter实例
        var emitter = new events.EventEmitter();
        try {
            var strategy = [];
            for (var i = 0; i < strategy_list.length; i++) {
                var stock_symbol = strategy_list[i]['stock_symbol'];
                var k_type = strategy_list[i]['stock_ktype'];
                //var strategy_name = strategy_list[i]['strategy_name'];
                strategy[i] = require(strategy_fullname[i]);
                strategy[i].onInit(emitter, task_id, stock_symbol, k_type, trade_symbol);
            }


            console.log('[worker] riskctrl_fullname:', riskctrl_fullname);
            var riskctrl = require(riskctrl_fullname);
            riskctrl.onInit(emitter, task_id, trade_symbol, trade_ktype);



            console.log('[worker] gateway_fullname:', gateway_fullname);
            var gateway = require(gateway_fullname);
            gateway.onInit(emitter, task_id, trade_symbol, trade_ktype);

             var task = {
                'task_id': task_id,
                'trade_symbol': trade_symbol,
                'trade_ktype': trade_ktype,
                'emitter': emitter,
                'strategy_list': strategy,    //数组形式
                'riskctrl': riskctrl,
                'gateway': gateway,
            }

            //同一个emitter 可以event通信，不同
            this.taskMap.set(task_id, task); // 添加新的key-value
        } catch (err) {
            console.log('[worker] add task fail:', err);
            response.send({ret_code: -1, ret_msg: 'FAILED', extra: err});
            return;
        }

        //console.log('add task ok:', task);
        response.send({ret_code: 0, ret_msg: 'SUCCESS', extra: {'task_id': task_id}});
        console.log('[worker] add task ok:');
    }


    async delTask(request, response){
        console.log('[worker] del task');
        var task_id = request['task_id'];

        //删除实例
        this.taskMap.delete(task_id);
        response.send({ret_code: 0, ret_msg: 'SUCCESS', extra: request});
    }




    async process(symbol, ktype, next){
        var list = this.strategyList[symbol];
        for (var i = 0; i < list.length(); i++){

            //1. 发送event:task_id 事件， 任务更新使用
            //emitter.emit(symbol, ktype, msgObj);

        }
        console.log('task list');
    }
}

//导出模块
module.exports = new WorkerClass();


