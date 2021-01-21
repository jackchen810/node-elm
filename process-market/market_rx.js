'use strict';
const config = require("config-lite");
const  DownloaderTaskHandle = require("./core/dl_timer_task");
const  BacktestTaskHandle = require("./core/backtest_timer_task");
const  MarketTaskHandle = require("./core/market_timer_task");
const  MarketTxHandle = require("./market_tx");

/*
* request 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* response 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* */


class DownloaderRx{
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
            MarketTxHandle.send(response, 'system', 'error', 'httper');
            return;
        }

        console.log('[onMessage][market] recv request:', JSON.stringify(msg));
        //tradeLog('system', '1', msg);

        //type, action, data
        var head = msg['head'];
        var body = msg['body'];
        MarketTxHandle.init(head);

        //接收主进程发送过来的消息
        if(head.type == 'download'){
            if (head.action == 'addTask') {
                DownloaderTaskHandle.download_task_add(body, MarketTxHandle);
            }
            else if(head.action == 'delTask') {
                DownloaderTaskHandle.download_task_del(body, MarketTxHandle);
            }
        }
        else if(head.type == 'trade' || head.type == 'simulate'){
            if (head.action == 'addTask') {
                MarketTaskHandle.market_task_add(body, MarketTxHandle);
            }
            else if(head.action == 'delTask') {
                MarketTaskHandle.market_task_del(body, MarketTxHandle);
            }
        }
        else if(head.type == 'backtest'){
            if (head.action == 'addTask') {
                BacktestTaskHandle.backtest_task_add(body, MarketTxHandle);
            }
            else if(head.action == 'delTask') {
                BacktestTaskHandle.backtest_task_del(body, MarketTxHandle);
            }
        }
    }
}

module.exports = new DownloaderRx();

