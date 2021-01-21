'use strict';
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const events = require("events");
const schedule = require('node-schedule');
const  marketerTxHandle = require("../market_tx");

//require('../dl_channel/dl_by_ifeng-job');
//var loadDir = require('./load_dir');

class MarketDataSourceClass {
    constructor(){
        this.task_id = '';
        this.taskMap = new Map(); // 空Map

        this.market_task_add = this.market_task_add.bind(this);
        this.market_task_del = this.market_task_del.bind(this);
        this.get_script_type = this.get_script_type.bind(this);

        ///python 测试，真实环境关闭
        //console.log('[market] test');
        //this.market_python_test('dl_by_tushare_python.py');
        //this.market_js_test('dl_by_ifeng.js');
        //this.market_js_test('dl_basic_by_tushare.js');

        //测试可以正常下载的脚步
        //this.market_js_test('dl_by_ifeng.js');
        //this.market_task_test('dl_by_ifeng.js');
    }
    async market_js_test(task_script) {
        console.log('[market] js test');

        //var task_script = 'dl_by_tushare_python.py';
        var script_fullname = path.join(__dirname, '../../', config.history_dl_dir, task_script);
        console.log('script_fullname', script_fullname);

        // 创建实例
        var script_class = require(script_fullname);
        var market_gateway_obj = new script_class('');

        market_gateway_obj.timer_callback('day');
    }

    async market_task_test(task_script) {
        console.log('[market] market_task_test test');

        var task = {
            'task_id': 'testit11',
            'task_type': 'simulate',
            'task_script': task_script,
            'crontab_string': '0 * * * * *',
        };

        this.market_task_del(task, marketerTxHandle);

        this.market_task_add(task, marketerTxHandle);
        console.log('[market] market_task_test add ok');

        //this.market_task_del(task, marketerTxHandle);
        console.log('[market] market_task_test finish');
    }



    async market_task_add(taskObj, response) {
        console.log('[market] add task');

        ///路径有效性检查
        var task_id = taskObj['task_id'];
        var task_type = taskObj['task_type'];
        var market_gateway = taskObj['market_gateway'];
        var strategy_list = taskObj['strategy_list'];        //获取表单数据，josn

        //如果任务存在
        if (this.taskMap.get(task_id)){
            var msgObj = {ret_code: 0, ret_msg: 'repeat', extra: task_id};
            response.send(msgObj);
            console.log('[market] repeat task');
            return;
        }

        var script_fullname = path.join(__dirname, '../../', config.market_channel_dir, market_gateway);
        console.log('script_fullname', script_fullname);

        ///路径有效性检查
        /*strategy_list
        * {
                stock_symbol:'',
                stock_name:'',
                stock_ktype:'',
                strategy_name:'',
         }
        * */
        console.log('[market] strategy_list.length:', strategy_list.length);
        for (var i = 0; i < strategy_list.length; i++) {
            ///路径有效性检查
            var strategy_name = strategy_list[i]["strategy_name"];
            var stock_ktype = strategy_list[i]["stock_ktype"];
            var stock_symbol = strategy_list[i]["stock_symbol"];
            console.log('[market] scan strategy_list, index:', i);
            console.log('[market] strategy_name:', strategy_name);

            //console.log('[backtest] add strategy_obj:', JSON.stringify(strategy_obj));
            // 创建实例
            var script_class = require(script_fullname);
            var market_gateway_obj = new script_class();
            strategy_list[i]['market_gateway_obj'] = market_gateway_obj;
            //console.log('[market] market_gateway_obj:', market_gateway_obj);

            ///启动
            market_gateway_obj.on_start(stock_symbol, stock_ktype);
        }



        //market_gateway_obj.timer_callback.bind(this);
        // 数组添加任务
        var taskObj = {
            'task_id': task_id,
            'task_type': task_type,
            'market_gateway': market_gateway,
            'strategy_list': strategy_list,
        };

        //console.log('[market] add task obj:', taskObj);
        this.taskMap.set(task_id, taskObj); // 添加新的key-value
        //console.log('add task ok:', this.taskMap.get(task_id));

        //console.log('add task ok:', task);
        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        console.log('[market] add task ok');
    }


    async market_task_del(taskObj, response){
        console.log('[market] del task');

        var task_id = taskObj['task_id'];
        var taskObj = this.taskMap.get(task_id);

        //console.log('[market] task instance', task_id, taskObj);
        if (typeof(taskObj) !== 'undefined') {
            var strategy_list = taskObj['strategy_list'];        //获取表单数据，josn

            console.log('[market] strategy_list.length:', strategy_list.length);
            for (var i = 0; i < strategy_list.length; i++) {
                ///路径有效性检查
                var strategy_name = strategy_list[i]["strategy_name"];
                var stock_ktype = strategy_list[i]["stock_ktype"];
                var stock_symbol = strategy_list[i]["stock_symbol"];
                var market_gateway_obj = strategy_list[i]['market_gateway_obj'];
                console.log('[market] scan strategy_list, index:', i);
                console.log('[market] strategy_name:', strategy_name);
                //console.log('[market] market_gateway_obj:', market_gateway_obj);

                ///停止实例
                market_gateway_obj.on_stop(stock_symbol, stock_ktype);
                market_gateway_obj = null;
            }

            //删除实例
            this.taskMap.delete(task_id);
        }

        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);

        console.log('[market] del task ok', task_id);
    }

    get_script_type(task_script) {
        console.log('[market] get_script_type');

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
module.exports = new MarketDataSourceClass();


