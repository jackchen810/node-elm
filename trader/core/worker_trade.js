
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const events = require("events");
const WorkerTx = require('../worker/worker_tx.js');

class WorkerClass {
    constructor(){
        this.task_id = '';
        this.strategyList = new Array();
        this.strategyList[0] = ['obj1', 'obj2'];

        //key:task_id    [task]}
        /*
        * var task = [{
                'task_id': task_id,
                'task_type': task_type,
                'trade_symbol': trade_symbol,
                'trade_ktype': trade_ktype,
                'emitter': emitter,
                'strategy': instance,
                'riskctrl': riskctrl,
                'gateway': gateway,
            }]
        *
        * */
        this.taskMap = new Map(); // 空Map

        //this.on_tick = this.on_tick.bind(this);
        //this.on_bar = this.on_bar.bind(this);
    }

    async on_tick_sync(tickObj){
        console.log('[worker] on_tick_sync', tickObj['code'], tickObj['date']);

    }

    async on_tick(tickObj){
        console.log('[worker] on_tick', tickObj['code']);
        //emitter.emit(msgObj[''], msgObj['code'], msgObj['ktype'], msgObj);
        console.log('taskMap.size:', this.taskMap.size);
        console.log('this:', this);

        //收到tick数据， 循环调用对应的策略模块进行处理
        this.taskMap.forEach(function (value, key, map) {
            //console.log('taskMap task_id:', key);
            var taskList = value;

            //查找匹配的标的，发送bar数据
            for (var i = 0; i < taskList.length; i++) {
                if (tickObj['code'] == taskList[i]['trade_symbol']) {
                    //console.log('strategy instance:', taskList[i]['strategy']);
                    taskList[i]['strategy'].on_tick(tickObj);
                }
            }
        });
    }



    async on_bar_sync(ktype, barObj){
        console.log('[worker] on_bar_sync', ktype, barObj['code'], barObj['date']);

    }

    //接收到外部bar事件，进行调度处理
    async on_bar(ktype, barObj){
        console.log('[worker] on_bar', ktype, barObj['code'], barObj['date']);
        //console.log('taskMap.size:', this.taskMap.size);

        //收到bar数据， 循环调用对应的策略模块进行处理
        this.taskMap.forEach(function (value, key, map) {
            //console.log('taskMap key value:', key, value);
            var taskList = value;

            //查找匹配的标的，发送bar数据
            for (var i = 0; i < taskList.length; i++) {
                if (barObj['code'] == taskList[i]['trade_symbol'] &&
                    ktype == taskList[i]['trade_ktype']) {
                    console.log('strategy instance:', taskList[i]['strategy']);
                    taskList[i]['strategy'].on_bar(ktype, barObj);
                }
            }
        });
    }



    async task_add(request, response) {
        console.log('[worker] add task');


        //添加策略实例, 线创建emitter实例
        var emitter = new events.EventEmitter();
        var task_group = [];

        ///路径有效性检查
        for (var i = 0; i < request.length; i++) {
            var task_id = request[i]['task_id'];
            var task_group = request[i]['task_group'];
            var task_type = request[i]['task_type'];
            var trade_symbol = request[i]['trade_symbol'];
            var trade_ktype = request[i]['trade_ktype'];
            var symbol_name = request[i]['symbol_name'];

            var strategy_name = request[i]['strategy_name'];
            var riskctrl_name = request[i]['riskctrl_name'];
            var order_gateway = request[i]['order_gateway'];


            var strategy_fullname = path.join(__dirname, '../../', config.strategy_dir, strategy_name);
            console.log('[worker] strategy_fullname:', strategy_fullname);
            if (fs.existsSync(strategy_fullname) == false) {
                console.log('strategy path not exist:', strategy_name);
                response.send({ret_code: -1, ret_msg: 'FAILED', extra: 'strategy path not exist'});
                return;
            }

            // 创建实例
            var strategy_class = require(strategy_fullname);
            var instance = new strategy_class(strategy_name);
            instance.on_init(emitter, task_id, task_type, trade_symbol, trade_ktype);

            ///路径有效性检查 riskctrl
            if (task_type == 'trade'){
                var riskctrl_fullname = path.join(__dirname, '../../', config.riskctrl_dir, riskctrl_name);
                if (fs.existsSync(riskctrl_fullname) == false) {
                    console.log('[worker] riskctrl path not exist:', riskctrl_fullname);
                    response.send({ret_code: -1, ret_msg: 'FAILED', extra: 'riskctrl path not exist'});
                    return;
                }


                // 创建实例
                console.log('[worker] riskctrl_fullname:', riskctrl_fullname);
                var riskctrl_class = require(riskctrl_fullname);
                var riskctrl = new riskctrl_class();
                riskctrl.on_init(emitter, task_id, trade_symbol, trade_ktype);



                ///路径有效性检查 gateway
                var gateway_fullname = path.join(__dirname, '../../', config.order_gateway_dir, order_gateway);
                if (fs.existsSync(gateway_fullname) == false) {
                    console.log('[worker] gateway path not exist:', gateway_fullname);
                    response.send({ret_code: -1, ret_msg: 'FAILED', extra: 'gateway path not exist'});
                    return;
                }

                // 创建实例
                console.log('[worker] gateway_fullname:', gateway_fullname);
                //只允许单实例运行
                var gateway = require(gateway_fullname);
                gateway.on_init(emitter, task_id, trade_symbol, trade_ktype);
            }

            // 数组添加任务
            var task = {
                'task_id': task_id,
                'task_type': task_type,
                'trade_symbol': trade_symbol,
                'symbol_name': symbol_name,
                'trade_ktype': trade_ktype,
                'emitter': emitter,
                'strategy': instance,
                'riskctrl': riskctrl,
                'gateway': gateway,
            }

            task_group.push(task);
        }

        //同一个emitter 可以event通信，不同
        this.taskMap.set(task_id, task_group); // 添加新的key-value

        this.task_id = task_id;
        //console.log('[worker] this:', this);
        console.log('[worker] add taskMap', this.taskMap.size);

        //console.log('add task ok:', task);
        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        //response.send(msgObj, 'log_record', 'log', 'website');
        console.log('[worker] add task ok');
    }

    async task_del(request, response){
        console.log('[worker] del task');
        var task_id = request[0]['task_id'];

        console.log('[worker] delete taskMap');

        //删除实例
        this.taskMap.delete(task_id);
        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        //response.send(msgObj, 'log_record', 'log', 'website');
    }




    async process(code, ktype, next){
        var list = this.strategyList[code];
        for (var i = 0; i < list.length(); i++){

            //1. 发送event:task_id 事件， 任务更新使用
            //emitter.emit(code, ktype, msgObj);

        }
        console.log('task list');
    }
}

//导出模块
module.exports = new WorkerClass();


