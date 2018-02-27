'use strict';

const fork = require('child_process').fork;
const fs = require("fs");

//var market = require("../gateway-market/market_tushare.js");
const market = require("../gateway-market/market_sina.js");
const tradeLog = require("../trade-log/log.js");

var events = require("events");
//创建事件监听的一个对象
const  emitter = new events.EventEmitter();


class WorkerHandle {
    constructor() {
        this.worker = fork('./trader/worker/worker_entry.js') //创建一个工作进程
        this.worker.on('message', this.onMessage);
        //console.log('create MqttSubHandle');

        //bind
        //this.log = this.log.bind(this);
    }


    //消息处理
    async onMessage(message){
        if (process.env.NODE_ENV == 'local') {
            console.log('[agent] recv response:', JSON.stringify(message));
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



    //消息处理
    async addTask(message){

        //添加行情定时获取接口
        market.onStart(message['trade_symbol'], message['trade_ktype']);

        console.log(__filename, 'add task onstart');


        var request = {
            'head': {'type': 'task', 'action': 'add'},
            'body': message,
        }

        //向 worker 进程发送任务小心
        console.log('to---->worker')
        this.worker.send(request);
    }



    //消息处理
    async delTask(message){

        //添加行情定时获取接口
        market.onStop(message['trade_symbol'], message['trade_ktype']);

        var request = {
            'head': {'type': 'task', 'action': 'del'},
            'body': message,
        }

        //向 worker 进程发送任务小心
        console.log('to---->worker')
        this.worker.send(request);
    }

    //消息处理
    async onTick(message){
        console.log(__filename, 'add tick');

        var request = {
            'head': {'type': 'on_tick', 'action': 'add'},
            'body': message,
        }

        //向 worker 进程发送任务小心
        console.log('to---->worker')
        this.worker.send(request);
    }

    //消息处理
    async onBar(ktype, message){
        console.log(__filename, 'add bar');

        var request = {
            'head': {'type': 'on_bar', 'action': ktype},
            'body': message,
        }

        //向 worker 进程发送任务小心
        console.log('to---->worker')
        this.worker.send(request);
    }


    //监听事件some_event
    // 仅适用于但命令任务下发，不适用于批量任务
    async addOnceListener(event, listener_callback, timeout){

        //监听事件some_event
        await emitter.once(event, listener_callback);

        setTimeout(function(){
            //task_id,---- type, action, response
            var response = {ret_code: -1, ret_msg: 'FAILED', extra: 'timeout'};
            emitter.emit(event, '-1', '-1', response);
        }, timeout);
    }

    //监听事件some_event
    async addLoopListener(event, listener_callback) {
        //监听事件some_event
        await emitter.on(event, listener_callback);
    }
}

const WorkerHnd= new WorkerHandle();
console.log('startup agent worker ');


export default WorkerHnd;
