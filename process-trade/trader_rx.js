'use strict';
const config = require("config-lite");
const  TradeTaskHandle = require("./core/trader_task");
//const  TraderBacktestHandle = require("./core/worker_backtest");
const  TraderTxHandle = require("./trader_tx");

/*
* request 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* response 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* */


class TraderRx{
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
            TraderTxHandle.send(response, 'system', 'error', 'httper');
            return;
        }

        console.log('[onMessage][trader] recv request:', JSON.stringify(msg));
        //tradeLog('system', '1', msg);

        //type, action, data
        var head = msg['head'];
        var body = msg['body'];
        TraderTxHandle.init(head);

        //接收主进程发送过来的消息
        if(head.type == 'trade' || head.type == 'simulate'){
            if (head.action == 'addTask') {
                TradeTaskHandle.trade_task_add(body, TraderTxHandle);
            }
            else if(head.action == 'delTask') {
                TradeTaskHandle.trade_task_del(body, TraderTxHandle);
            }
        }
        ///策略程序运行入口
        //tick级的实时交易数据
        else if (head.type == 'on_tick'){
            TradeTaskHandle.on_tick(body);
        }
        //k 线数据
        else if (head.type == 'on_bar'){
            await TradeTaskHandle.on_bar(head.action, body);
            //回应信息
            TraderTxHandle.send(body);
        }
        /*
        else if (head.type == 'on_tick_sync'){
            //数组处理， 多个标的的数据以数组方式传递
            for (var i = 0; i < body.length; i++) {
                TradeTaskHandle.on_tick(body[i]);
            }
        }
        else if (head.type == 'on_bar_sync'){
            //数组处理， 多个标的的数据以数组方式传递
            TradeTaskHandle.on_bar_sync(head.action, body);

            //var response = new TraderRx(head.type, head.action);
            //TradeTaskHandle.dataSync(msg['body'], msg['data'], response);
        }
        */
        /*
        else if(head.type == 'backtest.task' && body.length > 0) {
            if (head.action == 'add') {
                TraderBacktestHandle.backtest_task_add(body, TraderTxHandle);
            }
            else if (head.action == 'del') {
                TraderBacktestHandle.backtest_task_del(body, TraderTxHandle);
            }
        }

        else if(head.type == 'backtest.bar'){
            //数组处理， 多个标的的数据以数组方式传递
            for (var i = 0; i < body.length; i++) {
                console.log(i);
                await TraderBacktestHandle.backtest_bar(head.action, body[i]);
            }

            // finish
            await TraderBacktestHandle.backtest_finish(head.action, body[0])
        }
        else if(head.type == 'backtest.finish'){
            // finish, 对应没有查到数据，直接结束的场景
            await TraderBacktestHandle.backtest_finish(head.action, body)
        }
        */
    }
}

module.exports = new TraderRx();

