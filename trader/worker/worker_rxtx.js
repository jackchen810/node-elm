const config = require("config-lite");
const  WorkerClassHandle = require("./worker_main");

/*
* request 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* response 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* */


class WorkerRxTx{
    constructor(){
        //记录任务id
        this.type = null;
        this.action = null;
        this.head = null;

        //bind
        this.send = this.send.bind(this);
        this.onMessage = this.onMessage.bind(this);

        //监听进程消息
        process.on('message', this.onMessage);
    }


    //onInit  ----数据接收
    async onMessage(msg) {
        if (typeof msg != 'object'){
            console.log('msg is error');
            var response = new WebsiteResponse('system', 'error');
            response.send({ret_code: 1002, ret_msg: 'FAILED', extra:'type error'});
            return;
        }

        console.log('[worker entry] recv request:', JSON.stringify(msg));
        //tradeLog('system', '1', msg);

        //type, action, data
        var head = msg['head'];
        var body = msg['body'];
        this.head = head;

        //接收主进程发送过来的消息
        if(head.type == 'task'){
            if (head.action == 'add') {
                WorkerClassHandle.addTask(body, this);
            }
            else if(head.action == 'del') {
                WorkerClassHandle.delTask(body, this);
            }
        }
        else if (head.type == 'on_tick'){
            WorkerClassHandle.on_tick(body);
        }
        else if (head.type == 'on_bar'){
            WorkerClassHandle.on_bar(head.action, body);
        }
        else if (head.type == 'on_tick_sync'){
            //数组处理， 多个标的的数据以数组方式传递
            for (var i = 0; i < body.length; i++) {
                WorkerClassHandle.on_tick(body[i]);
            }
        }
        else if (head.type == 'on_bar_sync'){
            //数组处理， 多个标的的数据以数组方式传递
            for (var i = 0; i < body.length; i++) {
                WorkerClassHandle.on_bar_sync(head.action, body[i]);
            }
            //var response = new WorkerRxTx(head.type, head.action);
            //WorkerClassHandle.dataSync(msg['body'], msg['data'], response);
        }

    }

    //onInit  ----不需要用户修改
    async send(message, type, action, dest){
        //参数为1，使用默认参数
        if (arguments.length == 1){
            var res = {
                'head': {
                    'type': this.head.type,
                    'action': this.head.action,
                    'source': 'worker',
                    'dest': this.head.source
                },
                'body': message,
            }
        }
        else{
            var res = {
                'head': {'type': type, 'action': action, 'source': 'worker', 'dest': dest},
                'body': message,
            }
        }

        //console.log('[worker] send:', JSON.stringify(res));
        //console.log('worker--->main');
        process.send(res);
        return;
    }
}

module.exports = new WorkerRxTx();

