'use strict';

const fork = require('child_process').fork;
const fs = require("fs");

//var market = require("../gateway-market/market_tushare.js");
var market = require("../gateway-market/market_sina.js");

var events = require("events");
//创建事件监听的一个对象
const  emitter = new events.EventEmitter();


class WorkerHandle {
    constructor() {
        this.worker = fork('./trader/worker/worker_routes.js') //创建一个工作进程
        this.worker.on('message', this.onMessage);
        //console.log('create MqttSubHandle');
    }


    //消息处理
    async onMessage(message){
        if (process.env.NODE_ENV == 'local') {
            console.log('worker response:', JSON.stringify(message));
        }

        var type = message['type'];
        var action = message['action'];
        var response = message['response'];
        emitter.emit(type, action, response);
        if (type == 'task') {
            emitter.emit(response['extra']['task_id'], message['type'], message['action'], response);
        }
    }

    //消息处理
    async addTask(message){

        //添加行情定时获取接口
        market.onStart(message['request']['trade_symbol'], message['request']['trade_ktype']);

        console.log(__filename, 'add task onstart');


        //向 worker 进程发送任务小心
        this.worker.send(message);
    }



    //消息处理
    async delTask(message){

        //添加行情定时获取接口
        market.onStop(message['request']['trade_symbol'], message['request']['trade_ktype']);


        //向 worker 进程发送任务小心
        this.worker.send(message);
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

}

const WorkerHnd= new WorkerHandle();
console.log('startup agent worker ');


export default WorkerHnd;

/*
// 10分钟钟后
setInterval(function(){
    var obj = {
        'symbol': '600089',
        'ktype': '60',
    }
    WorkerHnd.worker.send({type: 'tick', action: 'on', data:obj});
}, 5000);

*/