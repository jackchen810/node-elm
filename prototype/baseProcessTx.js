'use strict';
module.exports = class BaseProcessTx {

    constructor(){
        //记录任务id
        this.type = null;
        this.action = null;
        this.head = null;
        this.source = null;
        this.send_function = null;

    }

    //onInit  ----不需要用户修改
    async init(head){
        this.head = head;
    }

    //on  ----不需要用户修改
    async setSelf(name){
        this.source = name;
    }


    //send  ----不需要用户修改
    async send(message, type, action, dest){
        //参数为1，使用默认参数
        if (arguments.length == 1){
            var res = {
                'head': {
                    'type': this.head.type,
                    'action': this.head.action,
                    'source': this.source,
                    'dest': this.head.dest
                },
                'body': message,
            }
        }
        else{
            var res = {
                'head': {
                    'type': type,
                    'action': action,
                    'source': this.source,
                    'dest': dest
                },
                'body': message,
            }
        }

        //console.log('[gateway] send:', JSON.stringify(res));
        //console.log('gateway--->main');
        //子进程发送到主进程
        process.send(res);
    }

};
