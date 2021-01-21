'use strict';
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const events = require("events");
const schedule = require('node-schedule');
const  backtesterTxHandle = require("../market_tx");

//require('../dl_channel/dl_by_ifeng-job');
//var loadDir = require('./load_dir');

class BacktestDataSourceClass {
    constructor(){
        this.task_id = '';
        this.taskMap = new Map(); // 空Map

        this.backtest_task_add = this.backtest_task_add.bind(this);
        this.backtest_task_del = this.backtest_task_del.bind(this);
        this.get_script_type = this.get_script_type.bind(this);

        ///python 测试，真实环境关闭
        //console.log('[backtest] test');
        //this.backtest_python_test('dl_by_tushare_python.py');
        //this.backtest_js_test('dl_by_ifeng.js');
        //this.backtest_js_test('dl_basic_by_tushare.js');

        //测试可以正常下载的脚步
        //this.backtest_js_test('dl_by_ifeng.js');
        //this.backtest_task_test('dl_by_ifeng.js');
    }
    async backtest_js_test(task_script) {
        console.log('[backtest] js test');

        //var task_script = 'dl_by_tushare_python.py';
        var script_fullname = path.join(__dirname, '../../', config.history_dl_dir, task_script);
        console.log('script_fullname', script_fullname);

        // 创建实例
        var script_class = require(script_fullname);
        var script_instance = new script_class('');

        script_instance.timer_callback('day');
    }

    async backtest_task_test(task_script) {
        console.log('[backtest] backtest_task_test test');

        var task = {
            'task_id': 'testit11',
            'task_type': 'simulate',
            'task_script': task_script,
            'crontab_string': '0 * * * * *',
        };

        this.backtest_task_del(task, backtesterTxHandle);

        this.backtest_task_add(task, backtesterTxHandle);
        console.log('[backtest] backtest_task_test add ok');

        //this.backtest_task_del(task, backtesterTxHandle);
        console.log('[backtest] backtest_task_test finish');
    }



    async backtest_task_add(taskObj, response) {
        console.log('[backtest] add task');

        ///路径有效性检查
        var task_id = taskObj['task_id'];
        var task_script = taskObj['task_script'];
        var task_type = taskObj['task_type'];
        var crontab_string = taskObj['crontab_string'];

        //如果任务存在
        if (this.taskMap.get(task_id)){
            var msgObj = {ret_code: 0, ret_msg: 'repeat', extra: task_id};
            response.send(msgObj);
            console.log('[backtest] repeat task');
            return;
        }

        var script_fullname = path.join(__dirname, '../../', config.history_dl_dir, task_script);
        var script_type = this.get_script_type(task_script);
        console.log('script_fullname', script_fullname);
        console.log('script_type:', script_type);
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
        this.taskMap.set(task_id, task); // 添加新的key-value
        //console.log('add task ok:', this.taskMap.get(task_id));

        //console.log('add task ok:', task);
        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        console.log('[backtest] add task ok');
    }


    async backtest_task_del(taskObj, response){
        console.log('[backtest] del task');

        var task_id = taskObj['task_id'];
        var taskObj = this.taskMap.get(task_id);

        if (typeof(taskObj) !== 'undefined') {
            console.log('[backtest] task instance', task_id, taskObj);
            taskObj['crontab_instance'].cancel();

            //删除实例
            this.taskMap.delete(task_id);
        }

        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);

        console.log('[backtest] del task ok', task_id);
    }

    get_script_type(task_script) {
        console.log('[backtest] get_script_type');

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
module.exports = new BacktestDataSourceClass();


