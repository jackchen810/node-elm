var cp = require('child_process');
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const events = require("events");
const  GatewayClassHandle = require("./gateway_main");
const db = require('../../mongodb/db.js');

/*
* request 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* response 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* */


class GatewayRxTx{
    constructor(){
        //记录任务id
        this.type = null;
        this.action = null;
        this.head = null;
        this.send_function = null;

        //bind
        this.send = this.send.bind(this);
        this.onMessage = this.onMessage.bind(this);
    }

    //onInit  ----不需要用户修改
    async onInit(send_function){
        this.send_function = send_function;
    }

    //onInit  ----不需要用户修改
    async send(message, type, action, dest){
        //参数为1，使用默认参数
        if (arguments.length == 1){
            var res = {
                'head': {
                    'type': this.head.type,
                    'action': this.head.action,
                    'source': 'gateway',
                    'dest': this.head.source
                },
                'body': message,
            }
        }
        else{
            var res = {
                'head': {'type': type, 'action': action, 'source': 'gateway', 'dest': dest},
                'body': message,
            }
        }

        //console.log('[gateway] send:', JSON.stringify(res));
        //console.log('gateway--->main');
        this.send_function(res);
    }


    async onMessage(msg){

        if (typeof msg != 'object'){
            console.log('msg is error');
            this.send({ret_code: 1002, ret_msg: 'FAILED', extra:'type error'});
            return;
        }

        console.log('[gateway entry] recv request:', JSON.stringify(msg));
        //tradeLog('system', '1', msg);

        //type, action, data
        var head = msg['head'];
        var body = msg['body'];
        this.head = head;

        //接收主进程发送过来的消息
        if(head.type == 'task'){
            //var response = new GatewayRxTx(head.type, head.action, head.source);
            if (head.action == 'add') {
                GatewayClassHandle.addTask(body, this);
            }
            else if(head.action == 'del') {
                GatewayClassHandle.delTask(body, this);
            }
            else if(head.action == 'handle') {
                GatewayClassHandle.handle_add(body);
            }
        }
    }

}


module.exports = new GatewayRxTx();

console.log('create gateway process, pid:', process.pid);