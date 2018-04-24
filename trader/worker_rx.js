'use strict';
const config = require("config-lite");
const  WorkerTradeHandle = require("./core/worker_trade");
const  WorkerBacktestHandle = require("./core/worker_backtest");
const  WorkerTxHandle = require("./worker_tx");

/*
* request 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* response 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* */


class WorkerRx{
    constructor(){
        //记录任务id
        this.type = null;
        this.action = null;
        this.head = null;

        //bind
        this.onMessage = this.onMessage.bind(this);

        //监听进程消息
        process.on('message', this.onMessage);
    }


    //on_init  ----数据接收
    async onMessage(msg) {
        if (typeof msg != 'object'){
            console.log('msg is error');
            var response = {ret_code: 1002, ret_msg: 'FAILED', extra:'type error'};
            WorkerTxHandle.send(response, 'system', 'error', 'website');
            return;
        }

        console.log('[worker entry] recv request:', JSON.stringify(msg));
        //tradeLog('system', '1', msg);

        //type, action, data
        var head = msg['head'];
        var body = msg['body'];
        WorkerTxHandle.init(head);

        //接收主进程发送过来的消息
        if(head.type == 'trade.task'){
            if (head.action == 'add' && body.length > 0) {
                WorkerTradeHandle.task_add(body, WorkerTxHandle);
            }
            else if(head.action == 'del') {
                WorkerTradeHandle.task_del(body, WorkerTxHandle);
            }
        }
        else if (head.type == 'on_tick'){
            WorkerTradeHandle.on_tick(body);
        }
        else if (head.type == 'on_bar'){
            WorkerTradeHandle.on_bar(head.action, body);
        }
        else if (head.type == 'on_tick_sync'){
            //数组处理， 多个标的的数据以数组方式传递
            for (var i = 0; i < body.length; i++) {
                WorkerTradeHandle.on_tick(body[i]);
            }
        }
        else if (head.type == 'on_bar_sync'){
            //数组处理， 多个标的的数据以数组方式传递
            WorkerTradeHandle.on_bar_sync(head.action, body);

            //var response = new WorkerRx(head.type, head.action);
            //WorkerTradeHandle.dataSync(msg['body'], msg['data'], response);
        }
        else if(head.type == 'backtest.task' && body.length > 0) {
            if (head.action == 'add') {
                WorkerBacktestHandle.backtest_task_add(body, WorkerTxHandle);
            }
            else if (head.action == 'del') {
                WorkerBacktestHandle.backtest_task_del(body, WorkerTxHandle);
            }
        }
        else if(head.type == 'backtest.bar'){
            //数组处理， 多个标的的数据以数组方式传递
            for (var i = 0; i < body.length; i++) {
                console.log(i);
                await WorkerBacktestHandle.backtest_bar(head.action, body[i]);
            }

            // finish
            await WorkerBacktestHandle.backtest_finish(head.action, body[0])
        }
        else if(head.type == 'backtest.finish'){
            // finish, 对应没有查到数据，直接结束的场景
            await WorkerBacktestHandle.backtest_finish(head.action, body)
        }

    }
}

module.exports = new WorkerRx();

