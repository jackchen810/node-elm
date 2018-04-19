'use strict';
const config = require("config-lite");
const  DownloaderTradeHandle = require("./core/downloader_task");
const  DownloaderTxHandle = require("./downloader_tx");

/*
* request 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* response 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* */


class DownloaderRx{
    constructor(){
        //记录任务id
        this.type = null;
        this.action = null;
        this.head = null;

        //bind
        this.onMessage = this.onMessage.bind(this);

        //监听进程消息
        process.on('message', this.onMessage);
    }


    //on_init  ----数据接收
    async onMessage(msg) {
        if (typeof msg != 'object'){
            console.log('msg is error');
            var response = {ret_code: 1002, ret_msg: 'FAILED', extra:'type error'};
            DownloaderTxHandle.send(response, 'system', 'error', 'website');
            return;
        }

        console.log('[downloader entry] recv request:', JSON.stringify(msg));
        //tradeLog('system', '1', msg);

        //type, action, data
        var head = msg['head'];
        var body = msg['body'];
        DownloaderTxHandle.init(head);

        //接收主进程发送过来的消息
        if(head.type == 'download.task'){
            if (head.action == 'add') {
                DownloaderTradeHandle.download_task_add(body, DownloaderTxHandle);
            }
            else if(head.action == 'del') {
                DownloaderTradeHandle.download_task_del(body, DownloaderTxHandle);
            }
        }
    }
}

module.exports = new DownloaderRx();

