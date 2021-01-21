'use strict';
const BaseProcessTx = require("../prototype/baseProcessTx");
/*
* request 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* response 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* */

//策略要继承基类
class FatherTx extends BaseProcessTx {
    constructor(){
        //父类
        super();

        //记录任务id
        this.type = null;
        this.action = null;
        this.head = null;
        this.send_function = null;

    }

    //on  ----不需要用户修改
    async setSendCallback(callback){
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
                    'source': this.head.source,
                    'dest': this.head.dest
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
        //fathen 进程就是主进程，不使用proces.send
        //直接调用函数process_message_reactor 既可以
        this.send_function(res);
    }

}


module.exports = new FatherRxTx();

//console.log('create gateway process, pid:', process.pid);