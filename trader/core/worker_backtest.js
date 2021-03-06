
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const events = require("events");
const WorkerTx = require('../worker_tx.js');

class WorkerBacktestClass {
    constructor(){
        this.task_id = '';
        this.barObj = {'date': 'default'};
        this.taskMap = new Map(); // 空Map

        //this.on_tick = this.on_tick.bind(this);
        //this.on_bar = this.on_bar.bind(this);
        this.backtest_bar = this.backtest_bar.bind(this);
        this.on_backtest_buy = this.on_backtest_buy.bind(this);
        this.on_backtest_buy_point = this.on_backtest_buy_point.bind(this);
        this.on_backtest_sell = this.on_backtest_sell.bind(this);
        this.on_backtest_sell_point = this.on_backtest_sell_point.bind(this);
    }




    //接收到外部bar事件，进行调度处理
    async backtest_bar(ktype, barObj){
        console.log('[worker backtest] backtest_bar', ktype, barObj['code'], barObj['date']);
        //console.log('taskMap.size:', this.taskMap.size);

        //收到bar数据， 循环调用对应的策略模块进行处理
        for (var [key, taskList] of this.taskMap) { // 遍历Map

            //查找匹配的标的，发送bar数据
            for (var i = 0; i < taskList.length; i++) {
                if (barObj['code'] == taskList[i]['trade_symbol'] &&
                    ktype == taskList[i]['trade_ktype']) {
                    console.log('[worker backtest] strategy instance:', taskList[i]['strategy_name']);
                    await taskList[i]['strategy'].set_bar(barObj);  //缓存
                    await taskList[i]['strategy'].on_bar(ktype, barObj);
                }
            }
        }
        console.log('[worker backtest] backtest_bar end');
    }



    //接收到外部bar事件，进行调度处理
    async backtest_finish(ktype, barObj){
        console.log('[worker backtest] backtest_finish', ktype, barObj['code'], barObj['date']);
        //console.log('taskMap.size:', this.taskMap.size);

        //收到bar数据， 循环调用对应的策略模块进行处理
        for (var [key, taskList] of this.taskMap) { // 遍历Map

            //查找匹配的标的，发送bar数据
            for (var i = 0; i < taskList.length; i++) {
                if (barObj['code'] == taskList[i]['trade_symbol'] &&
                    ktype == taskList[i]['trade_ktype']) {
                    console.log('[worker backtest] finish:', taskList[i]['task_id']);
                    WorkerTx.send({task_id : taskList[i]['task_id']}, 'backtest.status', 'finish', 'website');
                }
            }
        }
        console.log('[worker backtest] backtest_finish end');
    }


    //这个是 on_buy 事件的回调函数
    async on_backtest_buy(ktype, msgObj){
        console.log('[worker backtest], on_backtest_buy:', msgObj);
        var taskObj = this.taskMap.get(msgObj['task_id']);

        // 添加买卖点到回测结果， 发送消息
        var recordObj = {
            'task_id': msgObj['task_id'],
            'trade_symbol': msgObj['trade_symbol'],
            'symbol_name': taskObj['symbol_name'],
            'trade_ktype': msgObj['trade_ktype'],
            'order_position': msgObj['order_position'],
            'price': msgObj['price'],
            'amount': msgObj['amount'],
            'order_point_at': msgObj['bar_date'],
            'strategy_name': msgObj['strategy_name'],
        }

        //console.log('WorkerTx', WorkerTx);
        WorkerTx.send(recordObj, 'backtest.record', 'on_backtest_buy', 'website');
        return;
    }

    //这个是 on_buy 事件的回调函数
    async on_backtest_buy_point(ktype, msgObj){
        console.log('[worker backtest], on_backtest_buy_point:', msgObj);
        var taskObj = this.taskMap.get(msgObj['task_id']);

        // 添加买卖点到回测结果， 发送消息
        var recordObj = {
            'task_id': msgObj['task_id'],
            'trade_symbol': msgObj['trade_symbol'],
            'symbol_name': taskObj['symbol_name'],
            'trade_ktype': msgObj['trade_ktype'],
            'order_position': msgObj['order_position'],
            'price': msgObj['price'],
            'amount': msgObj['amount'],
            'order_point_at': msgObj['bar_date'],
            'strategy_name': msgObj['strategy_name'],
        }

        WorkerTx.send(msgObj, 'backtest.record', 'on_backtest_buy_point', 'website');
        return;
    }

    //这个是 on_sell 事件的回调函数
    async on_backtest_sell(ktype, msgObj){
        console.log('[worker backtest], on_backtest_sell:', msgObj);
        var taskObj = this.taskMap.get(msgObj['task_id']);

        // 添加买卖点到回测结果， 发送消息
        var recordObj = {
            'task_id': msgObj['task_id'],
            'trade_symbol': msgObj['trade_symbol'],
            'symbol_name': taskObj['symbol_name'],
            'trade_ktype': msgObj['trade_ktype'],
            'order_position': msgObj['order_position'],
            'price': msgObj['price'],
            'amount': msgObj['amount'],
            'order_point_at': msgObj['bar_date'],
            'strategy_name': msgObj['strategy_name'],
        }

        WorkerTx.send(recordObj, 'backtest.record', 'on_backtest_sell', 'website');
        var taskObj = this.taskMap.get(msgObj['task_id']);
        return;
    }


    //这个是 on_sell 事件的回调函数
    async on_backtest_sell_point(ktype, msgObj){
        console.log('[worker backtest], on_backtest_sell_point:', msgObj);
        var taskObj = this.taskMap.get(msgObj['task_id']);

        // 添加买卖点到回测结果， 发送消息
        var recordObj = {
            'task_id': msgObj['task_id'],
            'trade_symbol': msgObj['trade_symbol'],
            'symbol_name': taskObj['symbol_name'],
            'trade_ktype': msgObj['trade_ktype'],
            'order_position': msgObj['order_position'],
            'price': msgObj['price'],
            'amount': msgObj['amount'],
            'order_point_at': msgObj['bar_date'],
            'strategy_name': msgObj['strategy_name'],
        }

        WorkerTx.send(recordObj, 'backtest.record', 'on_backtest_sell_point', 'website');
        return;
    }



    async backtest_task_add(request, response) {
        console.log('[worker backtest] backtest add task');


        //添加策略实例, 线创建emitter实例
        var emitter = new events.EventEmitter();
        var task_group = [];

        ///路径有效性检查
        for (var i = 0; i < request.length; i++) {
            var task_id = request[i]['task_id'];
            var task_type = request[i]['task_type'];
            var trade_symbol = request[i]['trade_symbol'];
            var trade_ktype = request[i]['trade_ktype'];
            var symbol_name = request[i]['symbol_name'];
            var strategy_name = request[i]['strategy_name'];

            //如果任务存在
            if (this.taskMap.get(task_id)){
                continue;
            }


            var strategy_fullname = path.join(__dirname, '../../', config.strategy_dir, strategy_name);
            console.log('[worker backtest] strategy_fullname:', strategy_fullname);
            if (fs.existsSync(strategy_fullname) == false) {
                console.log('[worker backtest] strategy path not exist:', strategy_name);
                response.send({ret_code: -1, ret_msg: 'FAILED', extra: 'strategy path not exist'});
                return;
            }

            // 创建策略实例
            var strategy_class = require(strategy_fullname);
            var instance = new strategy_class(strategy_name);
            instance.on_init(emitter, task_id, task_type, trade_symbol, trade_ktype);
            instance.set_name(strategy_name);
            instance.set_record_flag(false, false);   //不记录交易日志


            // 监听策略发出的事件,
            console.log('[worker backtest] event lister:');
            emitter.on('on_buy', this.on_backtest_buy);
            emitter.on('on_buy_point', this.on_backtest_buy_point);
            emitter.on('on_sell', this.on_backtest_sell);
            emitter.on('on_sell_point', this.on_backtest_sell_point);

            // task map添加任务
            var task = {
                'task_id': task_id,
                'task_type': task_type,
                'trade_symbol': trade_symbol,
                'symbol_name': symbol_name,
                'trade_ktype': trade_ktype,
                'emitter': emitter,
                'strategy_name': strategy_name,
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

    async backtest_task_del(request, response){
        console.log('[worker backtest] backtest del task');
        for (var i = 0; i < request.length; i++) {
            var task_id = request[i]['task_id'];

            console.log('[worker backtest] delete taskMap');

            //删除实例
            this.taskMap.delete(task_id);
            var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
            response.send(msgObj);
        }
        //response.send(msgObj, 'log', 'log', 'website');
    }


}

//导出模块
module.exports = new WorkerBacktestClass();


