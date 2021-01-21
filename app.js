'use strict';

//创建一个工作进程
const http_hnd = require('./process-http/http_phandle.js');
const trader_hnd = require('./process-trade/trader_phandle.js');
const picker_hnd = require("./process-pick/picker_phandle.js");
const gateway_hnd = require("./process-gateway/gateway_phandle.js");
const market_hnd = require("./process-market/market_phandle.js");
const backtest_hnd = require("./process-backtest/backtest_phandle.js");


//注册进程间消息接收
// 进程1 ----》 主进程 （父进程）-----》进程2
// 主进程监听各个消息
http_hnd.on('message', process_message_reactor);
trader_hnd.on('message', process_message_reactor);
picker_hnd.on('message', process_message_reactor);
gateway_hnd.on('message', process_message_reactor);
market_hnd.on('message', process_message_reactor);
backtest_hnd.on('message', process_message_reactor);


//创建一个工作进程, 这个是主进程
require("./process-main/miner_main.js");
//初始化 gateway的发送函数；
//FatherTx.on('message', process_message_reactor);
const FatherRx = require("./process-main/miner_rx");


function process_message_reactor(message) {

    var head = message['head'];
    var source = head['source'];
    var dest = head['dest'];

    if (process.env.NODE_ENV == 'development') {
        console.log('[//reactor//][%s ---> %s] message:',  source, dest, JSON.stringify(message));
    }

    //参数有效性检查，如果，不是数组，返回错误
    var dest_list = [];
    if (Array.isArray(dest)){
        dest_list = dest;
    }
    else{
        dest_list[0] = dest;
    }

    //消息分发
    for (var i=0; i < dest_list.length; i++){
        head['dest'] = dest_list[i];   //dest替换
        if (dest_list[i] == 'trader') {
            trader_hnd.send(message);
        }
        else if (dest_list[i] == 'picker') {
            picker_hnd.send(message);
        }
        else if (dest_list[i] == 'httper') {
            http_hnd.send(message);
        }
        else if (dest_list[i] == 'market') {
            market_hnd.send(message);
        }
        else if (dest_list[i] == 'gateway') {
            gateway_hnd.send(message);
        }
        else if (dest_list[i] == 'backtest') {
            backtest_hnd.send(message);
        }
        else if (dest_list[i] == 'miner') {
            //父进程，直接调用
            FatherRx.onMessage(message);
        }
    }

    return;
}


