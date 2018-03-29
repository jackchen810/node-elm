'use strict';

const fork = require('child_process').fork;
const config = require("config-lite");

var events = require("events");
//创建事件监听的一个对象
const  emitter = new events.EventEmitter();


class WorkerProcessHandle {
    constructor(worker_handle) {
        //创建一个工作进程
        //this.worker = fork('./trader/worker/worker_entry.js');
        this.worker = worker_handle;
        //this.worker.on('message', message_reactor);
        //this.message_reactor = message_reactor;
        //this.worker.on('message', this.onMessage);
        console.log('create WorkerProcessHandle');

        //bind
        this.add_task = this.add_task.bind(this);
        this.delete_task = this.delete_task.bind(this);
        this.onBar = this.onBar.bind(this);
        this.onTick = this.onTick.bind(this);
        this.onBarBatch = this.onBarBatch.bind(this);
    }

    //消息处理
    async onMessage(message){
        //this.message_reactor(message, 'wok');
        console.log('[test] worker message:');
    }

    //消息处理， 发送消息到进程内部
    async add_task(message){

        console.log( '[worker agent] add task');

        // 1.添加任务到策略进程
        var request = {
            'head': {'type': 'task', 'action': 'add'},
            'body': message,
        }

        //向 worker 进程发送任务消息
        console.log('main---->worker')
        this.worker.send(request);

    }



    //消息处理， 发送消息到进程内部
    async delete_task(message){
        console.log( '[worker agent] del task');

        var request = {
            'head': {'type': 'task', 'action': 'del'},
            'body': message,
        }

        //向 worker 进程发送任务消息
        console.log('main---->worker')
        this.worker.send(request);
    }

    //消息处理， 发送消息到进程内部
    async onTick(tickObj){
        console.log(__filename, 'add tick');

        var request = {
            'head': {'type': 'on_tick', 'action': 'add'},
            'body': tickObj,
        }

        //向 worker 进程发送任务小心
        console.log('main---->worker')
        this.worker.send(request);
    }

    //消息处理， 发送消息到进程内部
    async onBar(ktype, barObj){
        console.log(__filename, 'add bar');

        var request = {
            'head': {'type': 'on_bar', 'action': ktype},
            'body': barObj,
        }

        //向 worker 进程发送任务小心
        console.log('main---->worker')
        this.worker.send(request);
    }

    //消息处理， 发送消息到进程内部
    async onBarBatch(ktype, barList){
        console.log(__filename, 'add bar batch');

        var request = {
            'head': {'type': 'on_bar_sync', 'action': ktype},
            'body': barList,
        }

        //向 worker 进程发送任务小心
        console.log('main---->worker')
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

//const WorkerHnd = new WorkerProcessHandle();
console.log('startup agent worker ');


module.exports = WorkerProcessHandle;
