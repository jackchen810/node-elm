'use strict';
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const events = require("events");
const schedule = require('node-schedule');
const  DownloaderTxHandle = require("../market_tx");

//require('../dl_channel/dl_by_ifeng-job');
//var loadDir = require('./load_dir');

class DownloadeDataSourceClass {
    constructor(){
        this.task_id = '';
        this.dlTaskMap = new Map(); // 空Map

        this.download_task_add = this.download_task_add.bind(this);
        this.download_task_del = this.download_task_del.bind(this);
        this.get_script_type = this.get_script_type.bind(this);

        ///python 测试，真实环境关闭
        //console.log('[download] test');
        //this.download_python_test('dl_by_tushare_python.py');
        //this.download_js_test('dl_by_ifeng.js');
        //this.download_js_test('dl_basic_by_tushare.js');

        //测试可以正常下载的脚步
        //this.download_js_test('dl_by_ifeng.js');
        //this.download_task_test('dl_by_ifeng.js');
    }
    async download_js_test(task_script) {
        console.log('[download] js test');

        //var task_script = 'dl_by_tushare_python.py';
        var script_fullname = path.join(__dirname, '../../', config.history_dl_dir, task_script);
        console.log('script_fullname', script_fullname);

        // 创建实例
        var script_class = require(script_fullname);
        var script_instance = new script_class('');

        script_instance.timer_callback('day');
    }

    async download_task_test(task_script) {
        console.log('[download] download_task_test test');

        var task = {
            'task_id': 'testit11',
            'task_type': 'simulate',
            'task_script': task_script,
            'crontab_string': '0 * * * * *',
        };

        this.download_task_del(task, DownloaderTxHandle);

        this.download_task_add(task, DownloaderTxHandle);
        console.log('[download] download_task_test add ok');

        //this.download_task_del(task, DownloaderTxHandle);
        console.log('[download] download_task_test finish');
    }



    async download_task_add(taskObj, response) {
        console.log('[download] add task');

        ///路径有效性检查
        var task_id = taskObj['task_id'];
        var task_script = taskObj['task_script'];
        var task_type = taskObj['task_type'];
        var crontab_string = taskObj['crontab_string'];

        //如果任务存在
        if (this.dlTaskMap.get(task_id)){
            var msgObj = {ret_code: 0, ret_msg: 'repeat', extra: task_id};
            response.send(msgObj);
            console.log('[download] repeat task');
            return;
        }

        var script_fullname = path.join(__dirname, '../../', config.history_dl_dir, task_script);
        console.log('script_fullname', script_fullname);
        console.log('crontab_string:', crontab_string);


        // 创建实例
        var script_class = require(script_fullname);
        var script_instance = new script_class();
        //script_instance.timer_callback();

        //script_instance.timer_callback.bind(this);
        // 数组添加任务
        var task = {
            'task_id': task_id,
            'task_type': task_type,
            'task_script': task_script,
            'crontab_string': crontab_string,
            'script_instance': script_instance,
            'crontab_instance': schedule.scheduleJob(crontab_string, script_instance.timer_callback),
        };
        //schedule.scheduleJob(crontab_string, script_instance.timer_callback);
        this.dlTaskMap.set(task_id, task); // 添加新的key-value
        //console.log('add task ok:', this.dlTaskMap.get(task_id));

        //console.log('add task ok:', task);
        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        console.log('[download] add task ok');
    }


    async download_task_del(taskObj, response){
        console.log('[download] del task');

        var task_id = taskObj['task_id'];
        var taskItemObj = this.dlTaskMap.get(task_id);

        if (typeof(taskItemObj) !== 'undefined') {
            console.log('[download] task instance', task_id, taskItemObj);

            //取消定时器
            taskItemObj['crontab_instance'].cancel();

            taskItemObj['script_instance'] = null;

            //删除实例
            this.dlTaskMap.delete(task_id);
        }

        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);

        console.log('[download] del task ok', task_id);
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
module.exports = new DownloadeDataSourceClass();


