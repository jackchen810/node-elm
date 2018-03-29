'use strict';

/*
* request 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* response 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* */

class WebsiteTx{
    constructor(){
        //记录任务id
        this.type = null;
        this.action = null;
        this.head = null;

    }


    //send  ----不需要用户修改
    async send(message, type, action, dest){
        //参数为1，使用默认参数, 回复响应消息
        if (arguments.length == 1){
            var res = {
                'head': {
                    'type': this.head.type,
                    'action': this.head.action,
                    'source': 'website',
                    'dest': this.head.source
                },
                'body': message,
            }
        }
        else{
            var res = {
                'head': {'type': type, 'action': action, 'source': 'website', 'dest': dest},
                'body': message,
            }
        }

        //console.log('[website] send:', JSON.stringify(res));
        console.log('website---> %s', dest);
        process.send(res);
        return;
    }

}

module.exports = new WebsiteTx();
