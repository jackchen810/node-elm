'use strict';

const fork = require('child_process').fork;
const tradeLog = require("../trade-log/log.js");
const config = require("config-lite");
const WorkerHnd = require("../worker/worker_phandle");

var events = require("events");
//创建事件监听的一个对象
const  emitter = new events.EventEmitter();


class GatewayProcessHandle {
    constructor() {
        //创建一个工作进程
        this.gateway = fork('./trader/gateway/gateway_entry.js');
        this.gateway.on('message', this.onMessage);
        console.log('create GatewayProcessHandle');

        //bind
        this.start_market = this.start_market.bind(this);
        this.stop_market = this.stop_market.bind(this);

    }


    //进程消息处理, 接收进程内部消息，通过emitter转换成event发送
    async onMessage(message){
        if (process.env.NODE_ENV == 'local') {
            console.log('[gateway agent] recv gateway response:', JSON.stringify(message));
        }

        var head = message['head'];
        var body = message['body'];

        var type = head['type'];
        var action = head['action'];
        emitter.emit(type, action, body);
        if (type == 'task') {
            emitter.emit(body['extra']['task_id'], type, action, body);
        }
    }



    //消息处理， 发送消息到进程内部
    async start_market(message){

        console.log( '[gateway agent] add task');

        // 1.添加任务到策略进程
        var request = {
            'head': {'type': 'task', 'action': 'add'},
            'body': message,
        }

        //向 gateway 进程发送任务消息
        console.log('main---->gateway')
        this.gateway.send(request);

    }



    //消息处理， 发送消息到进程内部
    async stop_market(message){
        console.log( '[gateway agent] del task');

        var request = {
            'head': {'type': 'task', 'action': 'del'},
            'body': message,
        }

        //向 gateway 进程发送任务消息
        console.log('main---->gateway')
        this.gateway.send(request);
    }



}

const GatewayHnd= new GatewayProcessHandle();
console.log('startup agent gateway ');

module.exports = GatewayHnd;
