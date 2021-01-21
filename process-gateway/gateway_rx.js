'use strict';
var cp = require('child_process');
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const events = require("events");
const  GatewayTradeHandle = require("./core/gateway_task");
const  GatewayTxHandle = require("./gateway_tx");
const db = require('../mongodb/db.js');

/*
* request 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* response 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* */


class GatewayRx{
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


    async onMessage(msg){

        if (typeof msg != 'object'){
            console.log('msg is error');
            this.send({ret_code: 1002, ret_msg: 'FAILED', extra:'type error'});
            return;
        }

        console.log('[onMessage][gateway] recv request:', JSON.stringify(msg));
        //tradeLog('system', '1', msg);

        //type, action, data
        var head = msg['head'];
        var body = msg['body'];
        GatewayTxHandle.init(head);

        //接收主进程发送过来的消息
        //交易和仿真类型的放在这里，backtest放在backtest进程
        if(head.type == 'trade' || head.type == 'simulate'){
            //var response = new GatewayRx(head.type, head.action, head.source);
            if (head.action == 'addTask') {
                GatewayTradeHandle.gateway_task_add(body, GatewayTxHandle);
            }
            else if (head.action == 'delTask') {
                GatewayTradeHandle.gateway_task_del(body, GatewayTxHandle);
            }
        }
        else if(head.type == 'buysell.point') {
            //var response = new GatewayRx(head.type, head.action, head.source);
            if (head.action == 'buy') {
                GatewayTradeHandle.gateway_buysell_point(head.action, body, GatewayTxHandle);
            }
            else if (head.action == 'sell') {
                GatewayTradeHandle.gateway_buysell_point(head.action, body, GatewayTxHandle);
            }
        }
    }

}


module.exports = new GatewayRx();

//console.log('create process-gateway process, pid:', process.pid);