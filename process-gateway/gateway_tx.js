var cp = require('child_process');
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const events = require("events");
const db = require('../mongodb/db.js');

/*
* request 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* response 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* */


class GatewayTx{
    constructor(){
        //记录任务id
        this.type = null;
        this.action = null;
        this.head = null;
        this.send_function = null;

    }

    //onInit  ----不需要用户修改
    async init(head){
        this.head = head;
    }

    //on  ----不需要用户修改
    async on(event, callback){
        this.send_function = callback;
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

        //console.log('[process-gateway] send:', JSON.stringify(res));
        //console.log('process-gateway--->main');
        this.send_function(res);
    }

}


module.exports = new GatewayTx();

console.log('create process-gateway process, pid:', process.pid);