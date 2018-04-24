
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const events = require("events");
const DownloadTx = require('../downloader_tx.js');
const schedule = require('node-schedule');
const PythonDownloadClass = require('../core/downloader_python.js');

class WorkerClass {
    constructor(){
        this.task_id = '';
        this.taskMap = new Map(); // 空Map

        this.download_task_add = this.download_task_add.bind(this);
        this.download_task_del = this.download_task_del.bind(this);
        this.get_script_type = this.get_script_type.bind(this);
    }


    async download_task_add(request, response) {
        console.log('[download] add task');

        ///路径有效性检查
        var task_id = request[0]['task_id'];
        var task_script = request[0]['task_script'];
        var task_type = request[0]['task_type'];
        var crontab_string = request[0]['crontab_string'];

        //如果任务存在
        if (this.taskMap.get(task_id)){
            var msgObj = {ret_code: 0, ret_msg: 'repeat', extra: task_id};
            response.send(msgObj);
            return;
        }

        var script_fullname = path.join(__dirname, '../../', config.history_dl_dir, task_script);
        var script_type = this.get_script_type(task_script);
        console.log('script_fullname', script_fullname);
        console.log('script_type:', script_type);

        if (script_type == 'python'){
            // 创建实例
            var script_instance = new PythonDownloadClass(script_fullname);
        }
        else{
            // 创建实例
            var script_class = require(script_fullname);
            var script_instance = new script_class('');
        }

        // 数组添加任务
        var task = {
            'task_id': task_id,
            'task_type': task_type,
            'task_script': task_script,
            'crontab_string': crontab_string,
            'script_instance': script_instance,
            'crontab_instance': schedule.scheduleJob(crontab_string, script_instance.timer_callback),
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

        for (var i = 0; i < request.length; i++) {
            var task_id = request[i]['task_id'];
            var task = this.taskMap.get(task_id);

            if (typeof(task) !== 'undefined') {
                //console.log('[download] task instance', task_id, task);
                task['crontab_instance'].cancel();

                //删除实例
                this.taskMap.delete(task_id);
            }

            var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
            response.send(msgObj);
        }
        console.log('[download] del task ok');
    }

    get_script_type(task_script) {
        console.log('[download] get_script_type');

        var strlist = task_script.split(".");
        var len = strlist.length;
        if (len == 0){
            return '';
        }

        if (strlist[len-1] == 'py'){
            return 'python';
        }
        else{
            return 'js';
        }
    }

}

//导出模块
module.exports = new WorkerClass();


