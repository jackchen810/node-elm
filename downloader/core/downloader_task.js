
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const events = require("events");
const DownloadTx = require('../downloader_tx.js');
const schedule = require('node-schedule');

class WorkerClass {
    constructor(){
        this.task_id = '';
        this.taskMap = new Map(); // 空Map

        this.download_task_add = this.download_task_add.bind(this);
        this.download_task_del = this.download_task_del.bind(this);
    }


    async download_task_add(request, response) {
        console.log('[download] add task');

        ///路径有效性检查
        var task_id = request[0]['task_id'];
        var task_script = request[0]['task_script'];
        var task_type = request[0]['task_type'];
        var crontab_string = request[0]['crontab_string'];

        var script_fullname = path.join(__dirname, '../../', config.history_dl_dir, task_script);
        console.log('script_fullname', script_fullname);
        var timer_callback = require(script_fullname);

        // 数组添加任务
        var task = {
            'task_id': task_id,
            'task_type': task_type,
            'task_script': task_script,
            'crontab_string': crontab_string,
            //'timer_callback': timer_callback,
            'crontab_instance': schedule.scheduleJob(crontab_string, timer_callback),
        }

        this.taskMap.set(task_id, task); // 添加新的key-value
        //console.log('add task ok:', this.taskMap.get(task_id));

        //console.log('add task ok:', task);
        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        console.log('[download] add task ok');
    }


    async download_task_del(request, response){
        console.log('[download] del task');

        var task_id = request[0]['task_id'];
        var task = this.taskMap.get(task_id);

        if (typeof(task) !== 'undefined'){
            //console.log('[download] task instance', task_id, task);
            task['crontab_instance'].cancel();

            //删除实例
            this.taskMap.delete(task_id);
        }

        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        console.log('[download] del task ok');
    }


}

//导出模块
module.exports = new WorkerClass();


