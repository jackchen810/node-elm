'use strict';
const config = require('config-lite');
const fs = require("fs");
const path = require('path');
const schedule = require('node-schedule');
const dtime = require('time-formater');
const DB = require('../../../models/models');
const HttpRx = require('../../http_rx.js');
const HttpTx = require('../../http_tx.js');

class BacktestHandle {
    constructor(){
        //绑定，this


    }


    async start(req, res, next) {
        console.log('[http] backtest task start');

        //获取表单数据，josn
        var task_id = req.body['task_id'];        //获取表单数据，josn

        //参数有效性检查
        if(typeof(task_id)==="undefined" ){
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
            return;
        }

        //更新到设备数据库， 已经完成的任务不重新开始
        //var wherestr = {'task_id': task_id, 'task_status': 'stop'};
        var wherestr = {'task_id': task_id};
        var queryList = await DB.BacktestTaskTable.find(wherestr).exec();
        if (queryList.length == 0){
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: task_id});
            return;
        }

        await DB.BacktestResultTable.remove(wherestr).exec();
        HttpTx.send(queryList, 'backtest.task', 'add', ['trader', 'backtest']);
        HttpRx.addOnceListener(task_id, async function(type, action, response) {
            //console.log('start task, response', response);
            if (response['ret_code'] == 0) {
                var updatestr = {'task_status': 'running'};
                await DB.BacktestTaskTable.update(wherestr, updatestr).exec();
                res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: task_id});
                console.log('[http] backtest task start end');
            }
            else{
                console.log('error:', response['extra']);
                res.send(response);
            }
        }, 3000);
    }


    async result_list(req, res, next){
        console.log('[http] backtest result list');
        //console.log(req.body);

        //获取表单数据，josn
        var page_size = req.body['page_size'];
        var current_page = req.body['current_page'];
        var sort = req.body['sort'];
        var filter = req.body['filter'];

        // 如果没有定义排序规则，添加默认排序
        if(typeof(sort)==="undefined"){
            sort = {"sort_time":1};
        }

        // 如果没有定义排序规则，添加默认排序
        if(typeof(filter)==="undefined"){
            filter = {};
        }

        //console.log('sort ', sort);
        console.log('filter ', filter);
        var total = await DB.BacktestResultTable.count(filter).exec();

        //参数有效性检查
        if(typeof(page_size)==="undefined" && typeof(current_page)==="undefined"){
            var queryList = await DB.BacktestResultTable.find(filter).sort(sort);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:queryList, total:total});
            //console.log(queryList);
        }
        else if (page_size > 0 && current_page > 0) {
            var skipnum = (current_page - 1) * page_size;   //跳过数
            var queryList = await DB.BacktestResultTable.find(filter).sort(sort).skip(skipnum).limit(page_size);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:queryList, total:total});
        }
        else{
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
        }

        console.log('[http] backtest result list end');
    }


    async result_list_length(req, res, next){
        console.log('[http] backtest result_list_length');

        var filter = req.body['filter'];

        // 如果没有定义排序规则，添加默认排序
        if(typeof(filter)==="undefined"){
            //console.log('filter undefined');
            filter = {};
        }
        var query = await DB.BacktestResultTable.count(filter).exec();
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:query});

        console.log('[http] backtest result_list_length end');
    }


}

module.exports = new BacktestHandle();



//await DB.BacktestTaskTable.findOneAndUpdate(wherestr, updatestr).exec();
//await 可以不调用.exec() 返回值
//如果没有转await 则必须调用.exec() 才能返回查询结果,不能通过返回值判断
//如果采用返回值得形式，必须的await

