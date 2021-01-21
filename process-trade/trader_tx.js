const config = require("config-lite");

/*
* request 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* response 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* */


class TraderTx{
    constructor(){
        this.type = null;
        this.action = null;
        this.head = null;

    }

    //on_init  ----不需要用户修改
    async init(head){
        this.head = head;
    }


    //on_init  ----不需要用户修改
    async send(message, type, action, dest){
        //参数为1，使用默认参数
        if (arguments.length == 1){
            var res = {
                'head': {
                    'type': this.head.type,
                    'action': this.head.action,
                    'source': 'trader',
                    'dest': this.head.source
                },
                'body': message,
            }
        }
        else{
            var res = {
                'head': {'type': type, 'action': action, 'source': 'trader', 'dest': dest},
                'body': message,
            }
        }

        //console.log('[trader] send:', JSON.stringify(res));
        //console.log('trader--->main');
        process.send(res);
        return;
    }
}

module.exports = new TraderTx();

