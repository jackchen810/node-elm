
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const events = require("events");


class WorkerBacktestClass {
    constructor(){
        this.task_id = '';
        this.taskMap = new Map(); // 空Map

        //this.on_tick = this.on_tick.bind(this);
        //this.on_bar = this.on_bar.bind(this);
    }



    async bar_sync(ktype, barObj){
        console.log('[worker backtest] on_bar_sync', ktype, barObj['code'], barObj['date']);

    }

    //接收到外部bar事件，进行调度处理
    async backtest_bar(ktype, barObj){
        console.log('[worker backtest] on_bar', ktype, barObj['code'], barObj['date']);
        //emitter.emit(msgObj[''], msgObj['code'], msgObj['ktype'], msgObj);
        //console.log('taskMap.size:', this.taskMap.size);

        //收到bar数据， 循环调用对应的策略模块进行处理
        this.taskMap.forEach(function (value, key, map) {
            //console.log('taskMap key value:', key, value);
            var taskList = value;

            //查找匹配的标的，发送bar数据
            for (var i = 0; i < taskList.length; i++) {
                if (barObj['code'] == taskList[i]['trade_symbol'] &&
                    ktype == taskList[i]['trade_trigger']) {
                    console.log('[worker backtest] strategy instance:', taskList[i]['strategy']);
                    taskList[i]['strategy'].on_bar(ktype, barObj);
                }
            }
        });
    }




    async backtest_addTask(request, response) {
        console.log('[worker backtest] backtest add task');


        //添加策略实例, 线创建emitter实例
        var emitter = new events.EventEmitter();
        var task_group = [];

        ///路径有效性检查
        for (var i = 0; i < request.length; i++) {
            var task_id = request[i]['task_id'];
            var task_type = request[i]['task_type'];
            var trade_symbol = request[i]['trade_symbol'];
            var trade_trigger = request[i]['trade_trigger'];

            var strategy_name = request[i]['strategy_name'];

            if (task_type == 'order_point'){
                response.send({ret_code: 0, ret_msg: 'SUCCESS', extra: task_id});
                return;
            }


            var strategy_fullname = path.join(__dirname, '../../', config.strategy_dir, strategy_name);
            console.log('[worker backtest] strategy_fullname:', strategy_fullname);
            if (fs.existsSync(strategy_fullname) == false) {
                console.log('[worker backtest] strategy path not exist:', strategy_name);
                response.send({ret_code: -1, ret_msg: 'FAILED', extra: 'strategy path not exist'});
                return;
            }

            // 创建实例
            var strategy_class = require(strategy_fullname);
            var instance = new strategy_class();
            instance.onInit(emitter, task_id, task_type, trade_symbol, trade_trigger);

            // 数组添加任务
            var task = {
                'task_id': task_id,
                'task_type': task_type,
                'trade_symbol': trade_symbol,
                'trade_trigger': trade_trigger,
                'emitter': emitter,
                'strategy': instance,
            }

            task_group.push(task);
        }

        //同一个emitter 可以event通信，不同
        this.taskMap.set(task_id, task_group); // 添加新的key-value

        this.task_id = task_id;
        console.log('[worker backtest] add taskMap', this.taskMap.size);

        //console.log('add task ok:', task);
        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        //response.send(msgObj, 'log', 'log', 'website');
        console.log('[worker backtest] backtest add task ok');
    }

    async backtest_delTask(request, response){
        console.log('[worker backtest] backtest del task');
        var task_id = request[0]['task_id'];

        console.log('[worker backtest] delete taskMap');

        //删除实例
        this.taskMap.delete(task_id);
        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        //response.send(msgObj, 'log', 'log', 'website');
    }


}

//导出模块
module.exports = new WorkerBacktestClass();


