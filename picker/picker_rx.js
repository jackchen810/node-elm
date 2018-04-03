'use strict';
const config = require("config-lite");
const  PickerTradeHandle = require("./core/picker_task");
const  PickerTxHandle = require("./picker_tx");

/*
* request 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* response 格式：{'head': {'type': this.type, 'action': this.action}, body:message}
* */


class PickerRx{
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
            var response = new WebsiteResponse('system', 'error');
            response.send({ret_code: 1002, ret_msg: 'FAILED', extra:'type error'});
            return;
        }

        console.log('[picker entry] recv request:', JSON.stringify(msg));
        //tradeLog('system', '1', msg);

        //type, action, data
        var head = msg['head'];
        var body = msg['body'];
        PickerTxHandle.init(head);

        //接收主进程发送过来的消息
        if(head.type == 'pickstock.task'){
            if (head.action == 'add') {
                PickerTradeHandle.pickstock_task_add(body, PickerTxHandle);
            }
            else if(head.action == 'del') {
                PickerTradeHandle.pickstock_task_del(body, PickerTxHandle);
            }
        }

    }
}

module.exports = new PickerRx();

