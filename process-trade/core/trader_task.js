'use strict';
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const events = require("events");
const TraderTx = require('../trader_tx.js');

class TraderTaskClass {
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
                'process-gateway': process-gateway,
            }]
        *
        * */
        this.sysTaskMap = new Map(); // 空Map

        //this.on_tick = this.on_tick.bind(this);
        this.on_bar = this.on_bar.bind(this);
        this.trade_task_add = this.trade_task_add.bind(this);
        this.trade_task_del = this.trade_task_del.bind(this);
    }

    async on_tick_sync(tickObj){
        console.log('[trader] on_tick_sync', tickObj['code'], tickObj['date']);

    }

    async on_tick(stock, price){
        console.log('[trader] on_tick', stock);
        //emitter.emit(msgObj[''], msgObj['code'], msgObj['ktype'], msgObj);
        console.log('sysTaskMap.size:', this.sysTaskMap.size);
        console.log('this:', this);

        //收到tick数据， 循环调用对应的策略模块进行处理
        this.sysTaskMap.forEach(function (value, key, map) {
            //console.log('sysTaskMap task_id:', key);
            var taskList = value;

            //查找匹配的标的，发送bar数据
            for (var i = 0; i < taskList.length; i++) {
                if (stock == taskList[i]['trade_symbol']) {
                    //console.log('strategy instance:', taskList[i]['strategy']);
                    taskList[i]['strategy'].on_tick(stock, price);
                }
            }
        });
    }



    async on_bar_sync(ktype, barObjList){
        console.log('[trader] on_bar_sync', ktype, barObjList.length);

    }

    //接收到外部bar事件，进行调度处理
    //消息入口
    async on_bar(ktype, barObj){
        console.log('[trader] on_bar', ktype, barObj['code'], barObj['date']);
        //console.log('sysTaskMap.size:', this.sysTaskMap.size);

        //收到bar数据， 循环调用对应的策略模块进行处理
        for (var [key, taskObj] of this.sysTaskMap) { // 遍历Map
            //遍历task
            console.log('scan task_id:', key);

            //1.0查找匹配的标的，发送bar数据
            var strategy_list = taskObj['strategy_list'];
            var buy_point_count = 0;
            var sell_point_count = 0;
            for (var i = 0; i < strategy_list.length; i++) {

                if (barObj['code'] == strategy_list[i]['stock_symbol'] &&
                    ktype == strategy_list[i]['stock_ktype']) {

                    var strategy_name = strategy_list[i]["strategy_name"];
                    var strategy_obj = strategy_list[i]["strategy_obj"];

                    //1.判断是否恢复买卖点，买卖点持续3个周期
                    ///更新买卖点，有可能恢复
                    await strategy_obj.update_buysell_point(ktype, barObj);

                    ///2.数据处理，消息入口
                    await strategy_obj.on_bar(ktype, barObj);

                    ///3. 交易点的处理
                    if (strategy_obj.get_buysell_point() == 'buy'){
                        buy_point_count++;
                    }
                    else if(strategy_obj.get_buysell_point() == 'sell'){
                        sell_point_count++;
                    }
                }
            }

            ///发出交易信号, 策略的买卖点都符合后发送该信号
            if(buy_point_count >= strategy_list.length){
                var trade_obj = {
                    'task_id': key,
                    'trade_symbol': taskObj['trade_symbol'],
                    'trade_amount': taskObj['trade_amount'],
                    'strategy_name': 'none',
                    'order_position': 'buy',
                    'buysell_point_at': dtime().format('YYYY-MM-DD HH:mm:ss'),   //时间
                };
                TraderTx.send(trade_obj, 'buysell.point', "buy", ['backtest', 'gateway']);
            }
            else if(sell_point_count >= strategy_list.length){
                var trade_obj = {
                    'task_id': key,
                    'trade_symbol': taskObj['trade_symbol'],
                    'trade_amount': taskObj['trade_amount'],
                    'strategy_name': 'none',
                    'order_position': 'buy',
                    'buysell_point_at': dtime().format('YYYY-MM-DD HH:mm:ss'),   //时间
                };
                TraderTx.send(trade_obj, 'buysell.point', "sell", ['backtest', 'gateway']);
            }
        }
    }
    /*strategy_list
    * {
            stock_symbol:'',
            stock_name:'',
            stock_ktype:'',
            strategy_name:'',
     }
    * */


    async trade_task_add(request, response) {
        console.log('[trader] add task');


        //添加策略实例, 线创建emitter实例
        //var emitter = new events.EventEmitter();
        //var task_group = [];

        var task_id = request['task_id'];
        var task_type = request['task_type'];   // 自动交易：'trade'; 机器人模拟交易：'simulate'; 交易回测：'backtest'
        //var trade_symbol = request['trade_symbol'];   //交易标的
        //var trade_amount = request['trade_amount'];   //交易数量
        //var trade_symbol_name = request['trade_symbol_name'];
        var strategy_list = request['strategy_list'];        //获取表单数据，josn


        ///路径有效性检查
        /*strategy_list
        * {
                stock_symbol:'',
                stock_name:'',
                stock_ktype:'',
                strategy_name:'',
         }
        * */
        console.log('[trader] strategy_list.length:', strategy_list.length);
        for (var i = 0; i < strategy_list.length; i++) {
            ///路径有效性检查
            var strategy_name = strategy_list[i]["strategy_name"];
            console.log('[trader] scan strategy_list:', i);
            console.log('[trader] strategy_name:', strategy_name);

            var strategy_fullname = path.join(__dirname, '../../', config.strategy_dir, strategy_name);
            if (fs.existsSync(strategy_fullname) == false) {
                console.log('[trader] strategy path not exist:', strategy_name);
                response.send({ret_code: -1, ret_msg: '脚本文件路径找不到', extra: 'strategy path not exist'});
                return;
            }

            // 创建实例
            var strategy_class = require(strategy_fullname);
            var strategy_obj = new strategy_class(strategy_name);

            // 数组添加任务;
            strategy_list[i]['strategy_obj'] = strategy_obj;

            //task_id, task_type, symbol, symbol_name, ktype, strategy_name
            //策略实例初始化
            strategy_obj.on_init(task_id, task_type, strategy_list[i]["stock_symbol"], strategy_list[i]["stock_name"], strategy_list[i]["stock_ktype"], strategy_name);
            //console.log('[trader] add strategy_obj:', strategy_obj);
        }

        //map映射，push value
        this.sysTaskMap.set(task_id, request); // 添加新的key-value
        //this.sysTaskMap.set(task_id, strategy_obj); // 添加新的key-value
        this.task_id = task_id;

        //console.log('[trader] this:', this);
        //console.log('[trader] add sysTaskMap:', JSON.stringify(request));
        console.log('[trader] add sysTaskMap size', this.sysTaskMap.size);

        //console.log('add task ok:', task);
        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        console.log('[trader] add task ok');


        //var strategy_obj = this.sysTaskMap.get(task_id);
        //console.log('[trader] add strategy_obj:', strategy_obj);
    }

    async trade_task_del(request, response){
        console.log('[trader] del task');
        var task_id = request['task_id'];

        console.log('[trader] delete sysTaskMap', task_id);

        var taskObj = this.sysTaskMap.get(task_id);
        if (typeof(taskObj) !== 'undefined') {
            //console.log('[trader] del task instance', taskObj);

            var strategy_list = taskObj['strategy_list'];

            // 循环释放策略的实例
            for (var i = 0; i < strategy_list.length; i++) {
                ///路径有效性检查
                var strategy_name = strategy_list[i]["strategy_name"];
                var strategy_obj = strategy_list[i]["strategy_obj"];
                console.log('[trader] free strategy_name:', strategy_name);
                // console.log('[trader] free strategy_obj:', strategy_obj);

                //deinit
                strategy_obj.on_deinit();

                console.log('[trader] free strategy_obj:', JSON.stringify(strategy_obj));

                // 释放策略的实例
                strategy_obj = null;
            }

            //删除实例
            this.sysTaskMap.delete(task_id);
        }

        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        //response.send(msgObj, 'log_record', 'log', 'http');
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
module.exports = new TraderTaskClass();


