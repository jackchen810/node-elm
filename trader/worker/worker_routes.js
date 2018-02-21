var cp = require('child_process');
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const events = require("events");
const  WorkerClassHandle = require("./worker_main");


/*
* request 格式：{type: 'task', action: 'add', request:message}
* response 格式：{type: 'task', action: 'add', response:message}
* */



console.log('create worker process');
process.on('message', function(msg) {

    if (typeof msg != 'object'){
        console.log('msg is error');
        process.send({ret_code: 1002, ret_msg: 'FAILED', extra:'type error'});
        return;
    }

    //console.log('process msg:', msg);
    //type, action, data

    //接收主进程发送过来的消息
    if(msg.type == 'task'){
        if (msg.action == 'add') {
            WorkerClassHandle.addTask(msg.request);
        }
        else if(msg.action == 'del') {
            WorkerClassHandle.delTask(msg.request);
        }
    }
    else if (msg.type == 'on_tick'){
        WorkerClassHandle.on_tick(msg.request);
    }
    else if (msg.type == 'on_bar'){
        if (!(Array.isArray(msg.request))) {
            WorkerClassHandle.on_bar(msg.action, msg.request);
            return;
        }

        //数组处理， 多个标的的数据以数组方式传递
        for (var i = 0; i < msg.request.length; i++) {
            WorkerClassHandle.on_bar(msg.action, msg.request[i]);
        }
    }

});

process.on('SIGHUP', function() {
    process.exit();//收到kill信息，进程退出
});


