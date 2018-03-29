'use strict';

const fork = require('child_process').fork;


//创建一个工作进程
const worker = fork('./trader/worker_entry.js');
worker.on('message', process_message_reactor);
console.log('create worker_entry');

//创建一个工作进程
const picker = fork('./picker/picker_entry.js');
picker.on('message', process_message_reactor);
console.log('create picker_entry');

//创建一个工作进程
const website = fork('./website/website_entry.js');
website.on('message', process_message_reactor);
console.log('create website_entry');

//创建一个工作进程, 这个是主进程
const GatewayTx = require("./gateway/gateway_tx");
//初始化 gateway的发送函数；
GatewayTx.on('message', process_message_reactor);
const GatewayRx = require("./gateway/gateway_rx");

/*
//初始化phandle
const WorkerHandleClass = require("./trader/worker/worker_phandle");
const WorkerHandle = new WorkerHandleClass(worker);


const WebsiteHandleClass = require("./website/website_phandle");
const WebsiteHandle = new WebsiteHandleClass(website);
*/

function process_message_reactor(message) {

    var head = message['head'];
    var source = head['source'];
    var dest = head['dest'];

    if (process.env.NODE_ENV == 'local') {
        console.log('[%s ---> %s] message:',  source, dest, JSON.stringify(message));
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
        if (dest_list[i] == 'worker') {
            worker.send(message);
        }
        else if (dest_list[i] == 'picker') {
            picker.send(message);
        }
        else if (dest_list[i] == 'website') {
            website.send(message);
        }
        else if (dest_list[i] == 'gateway') {
            //父进程，直接调用
            GatewayRx.onMessage(message);
        }
    }

    return;
}



process.on('unhandledRejection', (reason, p) => {
    console.info("Unhandled Rejection:", p);
    // application specific logging, throwing an error, or other logic here
});

