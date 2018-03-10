
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const events = require("events");
const tradeLog = require("../trade-log/log.js");


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

        /*
        var strategy_class = require('../trade-strategy/strategy_macd.js');
        var aaa = new strategy_class();
        aaa.onInit('null', '11', '22', '22', '22');

        var bbb = new strategy_class();
        bbb.onInit('null', '333', '22', '22', '22');

        console.log('111111');
        console.log(aaa);
        console.log('222222');
        console.log(bbb);
*/

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



    async on_bar(ktype, barObj){
        console.log('WorkerClass on_bar', ktype, barObj['code'], barObj['date']);
        //emitter.emit(msgObj[''], msgObj['symbol'], msgObj['ktype'], msgObj);

        //收到bar数据， 循环调用对应的策略模块进行处理
        this.taskMap.forEach(function (value, key, map) {
            //console.log('taskMap task_id:', key, value);
            var strategy_list = value['strategy_list'];
            //console.log (__filename,"strategy_list", strategy_list);

            //查找匹配的标的，发送bar数据
            for (var i = 0; i < strategy_list.length; i++) {
                if (barObj['code'] == strategy_list[i]['stock_symbol'] &&
                    ktype == strategy_list[i]['stock_ktype']) {
                    //console.log('strategy_list instance:', strategy_list[i]['instance']);
                    strategy_list[i]['instance'].on_bar(ktype, barObj);
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
        console.log('[worker] strategy_list:', JSON.stringify(strategy_list));
        tradeLog('system', 'test', task_id);

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
                var stock_ktype = strategy_list[i]['stock_ktype'];
                var strategy_name = strategy_list[i]['strategy_name'];
                var strategy_class = require(strategy_fullname[i]);
                var instance = new strategy_class();
                instance.onInit(emitter, task_id, stock_symbol, stock_ktype, trade_symbol);
                //console.log('[worker] new strategy_class:', strategy[i]);

                var obj = {
                    'stock_symbol': stock_symbol,
                    'stock_ktype': stock_ktype,
                    'strategy_name': strategy_name,
                    'instance': instance,   //策略实例
                };
                strategy.push(obj);
            }


            console.log('[worker] riskctrl_fullname:', riskctrl_fullname);
            var riskctrl_class = require(riskctrl_fullname);
            var riskctrl = new riskctrl_class();
            riskctrl.onInit(emitter, task_id, trade_symbol, trade_ktype);



            console.log('[worker] gateway_fullname:', gateway_fullname);
            //只允许单实例运行
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


    async dataSync(request, bardata, response){
        console.log('[worker] dataSync');
        var task_id = request['task_id'];
        var stock_ktype = request['stock_ktype'];
        var stock_symbol = request['stock_symbol'];

        //获取实例
        var task = this.taskMap.get(task_id);
        if(typeof(task)==="undefined"){
            return;
        }

        //策略实例数组
        var strategy_list = task['strategy_list'];
        //console.log('[worker] dataSync', strategy_list);
        for (var i = 0; i< strategy_list.length; i++){
            if (strategy_list[i]['stock_symbol'] == stock_symbol && strategy_list[i]['stock_ktype'] == stock_ktype){
                strategy_list[i]['instance'].onInitBar(bardata);
            }
        }
        response.send({ret_code: 0, ret_msg: 'SUCCESS', extra: task_id});
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


