var cp = require('child_process');
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const events = require("events");
const  WorkerClassHandle = require("./worker_main");
const db = require('../../mongodb/db.js');

/*
* request 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* response 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* */



class ProcessResponse{
    constructor(type, action){
        //记录任务id
        this.type = type;
        this.action = action;

        //bind
        this.send = this.send.bind(this);
    }

    //onInit  ----不需要用户修改
    async send(message){
        var res = {
            'head': {'type': this.type, 'action': this.action},
            'body': message,
        }
        //console.log('[worker] send:', JSON.stringify(res));
        console.log('worker--->to');
        process.send(res);
        return;
    }
}





console.log('create worker process');
process.on('message', function(msg) {

    if (typeof msg != 'object'){
        console.log('msg is error');
        var response = new ProcessResponse('system', 'error');
        response.send({ret_code: 1002, ret_msg: 'FAILED', extra:'type error'});
        return;
    }

    //console.log('process msg:', msg);

    //type, action, data
    var head = msg['head'];
    var body = msg['body'];
    var response = new ProcessResponse(head.type, head.action);

    //接收主进程发送过来的消息
    if(head.type == 'task'){
        if (head.action == 'add') {
            WorkerClassHandle.addTask(body, response);
        }
        else if(head.action == 'del') {
            WorkerClassHandle.delTask(body, response);
        }
    }
    else if (head.type == 'on_tick'){
        WorkerClassHandle.on_tick(body);
    }
    else if (head.type == 'on_bar'){
        if (!(Array.isArray(body))) {
            WorkerClassHandle.on_bar(head.action, body);
            return;
        }

        //数组处理， 多个标的的数据以数组方式传递
        for (var i = 0; i < body.length; i++) {
            WorkerClassHandle.on_bar(head.action, body[i]);
        }
    }

});

process.on('SIGHUP', function() {
    process.exit();//收到kill信息，进程退出
});


