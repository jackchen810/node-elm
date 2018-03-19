'use strict';

import DB from "../../models/models";

const fork = require('child_process').fork;
const fs = require("fs");
const path = require('path');

//var market = require("../gateway-market/market_tushare.js");
const market = require("../gateway-market/market_sina.js");
const tradeLog = require("../trade-log/log.js");
const config = require("config-lite");

var events = require("events");
//创建事件监听的一个对象
const  emitter = new events.EventEmitter();


class GatewayAgentHandle {
    constructor() {
        this.worker = fork('./trader/worker/worker_entry.js') //创建一个工作进程
        this.worker.on('message', this.onMessage);
        //console.log('create MqttSubHandle');

        //bind
        this.addTask = this.addTask.bind(this);
        this.onBar = this.onBar.bind(this);
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

        console.log( '[worker agent] add task');

        var task_id = message['task_id'];
        var strategy_list = message['strategy_list'];
        var market_gateway = message['market_gateway'];
        var trade_symbol = message['trade_symbol'];   //交易标的， 主策略标的
        var trade_ktype = message['trade_ktype'];   //交易标的，主策略标的

        //console.log('strategy_list', strategy_list);

        // 1.添加任务到策略进程
        var request = {
            'head': {'type': 'task', 'action': 'add'},
            'body': message,
        }

        //向 worker 进程发送任务消息
        console.log('main---->worker')
        this.worker.send(request);


        // 2.添加行情定时获取接口
        //market.onStart(message['trade_symbol'], message['trade_ktype']);

        ///路径有效性检查 riskctrl
        var market_gateway_fullname = path.join(__dirname, '../../', config.market_gateway_dir, market_gateway);
        if (fs.existsSync(market_gateway_fullname) == false) {
            console.log('[worker] market_gateway path not exist:', market_gateway_fullname);
            return -1;
        }

        // 3. 发送已有的bar数据，启动定时器发送
        var market_gateway_class = require(market_gateway_fullname);
        for (var i = 0; i < strategy_list.length; i++){
            //3. 下载数据，进行同步, 根据策略中的标的和ktype 进行同步
            var barList = await market_gateway_class.to_download(trade_ktype, 'fq', trade_symbol);

            // 发送已有bar数据
            this.onBar(strategy_list[i]['stock_ktype'], barList);
            //console.log('to_download', barList[0]);

            //4. 加载market，启动定时器， 发出on_bar 数据
            market_gateway_class.onStart(strategy_list[i]['stock_symbol'], strategy_list[i]['stock_ktype']);
            console.log(__filename, 'add task onStart');
        }

    }



    //消息处理
    async delTask(message){
        console.log( '[worker agent] del task');

        //添加行情定时获取接口
        ///路径有效性检查 riskctrl
        var market_gateway_fullname = path.join(__dirname, '../../', config.market_gateway_dir, message['market_gateway']);
        if (fs.existsSync(market_gateway_fullname) == false) {
            console.log('[worker] market_gateway path not exist:', market_gateway_fullname);
            return -1;
        }

        //1. 加载market
        var market_gateway_class = require(market_gateway_fullname);
        market_gateway_class.onStop(message['trade_symbol'], message['trade_ktype']);

        var request = {
            'head': {'type': 'task', 'action': 'del'},
            'body': message,
        }

        //向 worker 进程发送任务消息
        console.log('main---->worker')
        this.worker.send(request);
    }

    //消息处理
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

    //消息处理
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

const WorkerHnd= new GatewayAgentHandle();
console.log('startup agent worker ');


export default WorkerHnd;
