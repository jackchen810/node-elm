'use strict';
const BaseProcessTx = require("../prototype/baseProcessTx");
/*
* request 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* response 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* */

//策略要继承基类
class FatherRx{
    constructor(){

        //记录任务id
        this.type = null;
        this.action = null;
        this.head = null;
        this.send_function = null;

    }

    async onMessage(msg){

        if (typeof msg != 'object'){
            console.log('msg is error');
            this.send({ret_code: 1002, ret_msg: 'FAILED', extra:'type error'});
            return;
        }

        console.log('[father entry] recv request:', JSON.stringify(msg));
        //tradeLog('system', '1', msg);

        //type, action, data
        var head = msg['head'];
        var body = msg['body'];
        GatewayTxHandle.init(head);

        //接收主进程发送过来的消息
        if(head.type == 'trade.task') {
            //var response = new FatherRx(head.type, head.action, head.source);
            if (head.action == 'add') {
                //GatewayTradeHandle.task_add(body, GatewayTxHandle);
            }
            else if (head.action == 'del') {
                //GatewayTradeHandle.task_del(body, GatewayTxHandle);
            }
        }
        else if(head.type == 'backtest.task'){
            //var response = new FatherRx(head.type, head.action, head.source);
            if (head.action == 'add') {
                //GatewayBacktestHandle.backtest_task_add(body, GatewayTxHandle);
            }
            else if(head.action == 'del') {
                //GatewayBacktestHandle.backtest_task_del(body, GatewayTxHandle);
            }
        }
    }

}


module.exports = new FatherRx();

//console.log('create gateway process, pid:', process.pid);