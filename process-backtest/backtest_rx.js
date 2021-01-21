'use strict';
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const events = require("events");
const  BacktestTaskHandle = require("./core/backtest_task");
const  BacktestResultHandle = require("./core/backtest_result");
const  BacktestTxHandle = require("./backtest_tx");
const db = require('../mongodb/db.js');

/*
* request 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* response 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* */


class BacktestRx{
    constructor(){
        //记录任务id
        this.type = null;
        this.action = null;
        this.head = null;

        //bind
        this.onMessage = this.onMessage.bind(this);
    }


    async onMessage(msg){

        if (typeof msg != 'object'){
            console.log('msg is error');
            this.send({ret_code: 1002, ret_msg: 'FAILED', extra:'type error'});
            return;
        }

        console.log('[onMessage][backtest] recv request:', JSON.stringify(msg));
        //tradeLog('system', '1', msg);

        //type, action, data
        var head = msg['head'];
        var body = msg['body'];
        BacktestTxHandle.init(head);

        //接收主进程发送过来的消息
        if(head.type == 'backtest'){
            //var response = new BacktestRx(head.type, head.action, head.source);
            if (head.action == 'addTask') {
                BacktestTaskHandle.backtest_task_add(body, BacktestTxHandle);
            }
            else if(head.action == 'delTask') {
                BacktestTaskHandle.backtest_task_del(body, BacktestTxHandle);
            }
        }
        else if(head.type == 'buysell.point'){
            //var response = new BacktestRx(head.type, head.action, head.source);
            if (head.action == 'buy') {
                BacktestResultHandle.backtest_buy_point_add(body);
            }
            else if(head.action == 'sell') {
                BacktestResultHandle.backtest_sell_point_add(body);
            }
        }
    }

}


module.exports = new BacktestRx();

