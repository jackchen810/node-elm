'use strict';
const PickerTx = require("../process-pick/picker_tx.js");
const dtime = require('time-formater');

module.exports = class PickstockBaseStrategy {

    constructor(task_id){
        //记录任务id
        this.task_id = task_id;
        this.task_type = '';  //trade, order_point,

    }


    //__init  ----不需要用户修改
    //task_type:
    async on_init(task_id, ktype){
        this.task_id = task_id;
        this.task_type = 'pickstock';
        this.ktype = ktype;
        return;
    }

    //to_end  发送结束事件
    async to_end(msgObj){
        //console.log('to_buy', this.task_type);
        //1. 发送event:to_end 事件
        PickerTx.send(msgObj, 'pickstock.status', 'finish', 'httper');
        return;
    }


}
