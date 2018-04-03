'use strict';

const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const events = require("events");
const PickerTx = require('../picker_tx.js');

class PickerClass {
    constructor(){
        this.task_id = '';
        this.taskMap = new Map(); // 空Map

        this.pickstock_task_add = this.pickstock_task_add.bind(this);
        this.pickstock_task_del = this.pickstock_task_del.bind(this);
    }

    async pickstock_task_add(request, response) {
        console.log('[pickstock] add task');

        var task_id = request[0]['task_id'];
        var task_type = request[0]['task_type'];
        var strategy_name = request[0]['strategy_name'];
        var stock_ktype = request[0]['stock_ktype'];
        var stock_range = request[0]['stock_range'];

        var strategy_fullname = path.join(__dirname, '../../', config.pick_strategy_dir, strategy_name);
        console.log('[pickstock] strategy_fullname:', strategy_fullname);
        if (fs.existsSync(strategy_fullname) == false) {
            console.log('strategy path not exist:', strategy_name);
            response.send({ret_code: -1, ret_msg: 'FAILED', extra: 'strategy path not exist'});
            return;
        }

        // 创建实例
        var strategy_class = require(strategy_fullname);
        var instance = new strategy_class(task_id);
        instance.on_init(task_id, stock_ktype);


        // 数组添加任务
        var task = {
            'task_id': task_id,
            'task_type': task_type,
            'strategy_name': strategy_name,
            'stock_ktype': stock_ktype,
            'stock_range': stock_range,
            'instance': instance,
        }

        //同一个emitter 可以event通信，不同
        this.taskMap.set(task_id, task); // 添加新的key-value

        //console.log('add task ok:', task);
        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        console.log('[pickstock] add task ok');
    }


    async pickstock_task_del(request, response){
        console.log('[pickstock] del task');

        var task_id = request[0]['task_id'];
        console.log('[pickstock] delete taskMap');

        //删除实例
        this.taskMap.delete(task_id);
        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        console.log('[pickstock] del task ok');
    }


}

//导出模块
module.exports = new PickerClass();


