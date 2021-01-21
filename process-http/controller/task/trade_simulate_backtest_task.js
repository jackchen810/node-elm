'use strict';
const mongoose = require('mongoose');
const DB = require('../../../models/models.js');
const HttpRx = require('../../http_rx.js');
const HttpTx = require('../../http_tx.js');
const dtime = require('time-formater');
const fs = require("fs");
const path = require('path');


class TaskHandle {
    constructor(){
        //this.guid = this.guid.bind(this);
        this.task_list = this.task_list.bind(this);
        this.task_add = this.task_add.bind(this);
        this.task_del = this.task_del.bind(this);
        //console.log('TaskHandle constructor');
        //this.task_recovey();
    }



    async task_list(req, res, next){
        console.log('[http] task_list');
        //console.log(req.body);

        //获取表单数据，josn
        var page_size = req.body['page_size'];
        var current_page = req.body['current_page'];
        var sort = req.body['sort'];
        var filter = req.body['filter'];

        // 如果没有定义排序规则，添加默认排序
        if(typeof(sort)==="undefined"){
            //console.log('sort undefined');
            sort = {"sort_time":-1};
        }

        // 如果没有定义排序规则，添加默认排序
        if(typeof(filter)==="undefined"){
            //console.log('filter undefined');
            filter = {};
        }

        //普通用户进行过滤
        if(req.session.user_type == '1' || req.session.user_type == '0'){
            filter['user_account'] = req.session.user_account;
        }

        //console.log('sort ', sort);
        //console.log('filter ', filter);
        var total = await DB.TaskTable.count(filter).exec();

        //参数有效性检查
        if(typeof(page_size)==="undefined" && typeof(current_page)==="undefined"){
            var queryList = await DB.TaskTable.find(filter).sort(sort);
            res.send({ret_code: 0, ret_msg: '成功', extra:queryList, total:total});
        }
        else if (page_size > 0 && current_page > 0) {
            var skipnum = (current_page - 1) * page_size;   //跳过数
            var queryList = await DB.TaskTable.find(filter).sort(sort).skip(skipnum).limit(page_size);
            res.send({ret_code: 0, ret_msg: '成功', extra:queryList, total:total});
        }
        else{
            res.send({ret_code: 1002, ret_msg: '没有找到表项', extra:'josn para invalid'});
        }

        console.log('[http] task_list end');
    }


    async task_list_length(req, res, next){
        console.log('[http] task_list_length');

        var filter = req.body['filter'];

        // 如果没有定义排序规则，添加默认排序
        if(typeof(filter)==="undefined"){
            //console.log('filter undefined');
            filter = {};
        }

        var query = await DB.TaskTable.count(filter).exec();
        res.send({ret_code: 0, ret_msg: '成功', extra:query});

        console.log('[http] task_list_length end');
    }




    async task_add(req, res, next) {
        console.log('[http] task add');
        //console.log('req.body:', JSON.stringify(req.body));

        //获取表单数据，josn
        var user_account = req.body['user_account'];   //
        var task_type = req.body['task_type'];   // 自动交易：'trade'; 机器人模拟交易：'simulate'; 交易回测：'backtest'
        var trade_symbol = req.body['trade_symbol'];   //交易标的
        var trade_amount = req.body['trade_amount'];   //交易数量
        var trade_symbol_name = req.body['trade_symbol_name'];

        var strategy_type = req.body['strategy_type'];
        var strategy_list = req.body['strategy_list'];        //获取表单数据，josn


        var riskctrl_name = req.body['riskctrl_name'];        //获取表单数据，josn
        var market_gateway = req.body['market_gateway'];
        var order_gateway = req.body['order_gateway'];

        //任务的不同类型
        if(task_type == 'backtest'){
            var bt_start_time = req.body['start_time'];
            var bt_end_time = req.body['end_time'];
            var riskctrl_name = 'none';        //回测不需要风控
            var order_gateway = 'none';      //回测不需要风控
        }
        // 自动交易：'trade'; 机器人模拟交易：'simulate';
        else{
            var bt_start_time = 'none';
            var bt_end_time = 'none';
            var riskctrl_name = req.body['riskctrl_name'];
            var order_gateway = req.body['order_gateway'];
        }

        var task_id = DB.guid();
        var mytime = new Date();


        // 如果没有定义用户，添加session中的用户
        if(typeof(user_account)==="undefined"){
            user_account = req.session.user_account;
        }

        //更新到设备数据库， 交易的标的不能够重复, index=0 是主策略
        var wherestr = {'task_type': task_type, 'trade_symbol': trade_symbol};
        console.log('task:', JSON.stringify(wherestr));

        //参数检查
        var query = await DB.TaskTable.findOne(wherestr).exec();
        if (query != null) {
            res.send({ret_code: -1, ret_msg: '任务重复', extra:'任务重复'});
            return;
        }


        var updatestr = {
            'task_id': task_id,
            'task_type': task_type,  //任务类型 // 自动交易：'trade'; 机器人模拟交易：'simulate'; 交易回测：'backtest'
            'task_status': 'stop',   // 运行状态
            'user_account': user_account,   //

            //交易标的
            'trade_symbol': trade_symbol,   ///index=0的使用交易symbol
            'trade_symbol_name': trade_symbol_name,   ///index=0的使用交易symbol
            'trade_amount': trade_amount,   ///index=0的使用交易symbol

            //策略类型
            'strategy_type': strategy_type,   //策略类型
            'strategy_list': strategy_list,   //策略类型

            //接口
            'market_gateway': market_gateway,   //行情网关名称
            'riskctrl_name': riskctrl_name,   //风控名称
            'order_gateway': order_gateway,   //交易网关名称

            //回测数据的开始结束日期
            'bt_start_time': bt_start_time,   //风控名称
            'bt_end_time': bt_end_time,   //交易网关名称

            'create_at': dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
            'sort_time': mytime.getTime()
        };

        var task_item = await DB.TaskTable.create(updatestr);
        if (task_item == null) {
            res.send({ret_code: -1, ret_msg: '任务添加数据库失败', extra: '任务添加数据库失败'});
            return;
        }

        res.send({ret_code: 0, ret_msg: '成功', extra:task_id});
        console.log('[http] task add end');
    }


    async task_del(req, res, next) {
        console.log('[http] task del');

        //获取表单数据，josn
        var task_id = req.body['task_id'];        //获取表单数据，josn

        //参数有效性检查
        if(typeof(task_id)==="undefined" ){
            res.send({ret_code: 1002, ret_msg: '任务不存在', extra:task_id});
            return;
        }

        console.log('task_id:', task_id);
        var wherestr = {'task_id': task_id};
        var queryObj = await DB.TaskTable.findOne(wherestr).exec();
        if (queryObj == null){
            res.send({ret_code: 1004, ret_msg: '任务不存在', extra: task_id});
            return;
        }

        //发送任务,trader 删除任务
        //停止任务的时候就已经删除了，这里再删除一下
        HttpTx.send(queryObj, queryObj['task_type'], 'delTask', ['market', 'trader', 'backtest']);
        HttpRx.addOnceListener(task_id, async function(type, action, response) {
            //console.log('del task, response', response);
            if (response['ret_code'] == 0) {
                await DB.TaskTable.remove(wherestr).exec();
                res.send({ret_code: 0, ret_msg: '成功', extra: task_id});
                console.log('[http] task del end');
            }
            else{
                console.log('error:', response['extra']);
                res.send(response);
            }
        }, 3000);
    }

    async start(req, res, next) {
        console.log('[http] task start');

        //获取表单数据，josn
        var task_id = req.body['task_id'];        //获取表单数据，josn


        //参数有效性检查
        if(typeof(task_id)==="undefined" ){
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
            return;
        }

        //更新到设备数据库， 设备上线，下线
        var wherestr = {'task_id': task_id};
        var queryObj = await DB.TaskTable.findOne(wherestr).exec();
        if (queryObj == null){
            res.send({ret_code: 1003, ret_msg: '任务不存在', extra: task_id});
            return;
        }

        ///发送任务消息
        //任务类型 // 自动交易：'trade'; 机器人模拟交易：'simulate'; 交易回测：'backtest'
        HttpTx.send(queryObj, queryObj['task_type'], 'addTask', ['market', 'trader', 'backtest']);


        ///监听回应信息
        HttpRx.addOnceListener(task_id, async function(type, action, response) {
            //console.log('start task, response', response);
            if (response['ret_code'] == 0) {
                var updatestr = {'task_status': 'running'};
                await DB.TaskTable.update(wherestr, updatestr).exec();
                res.send({ret_code: 0, ret_msg: '成功', extra: task_id});
                console.log('[http] task start end');
            }
            else{
                console.log('error:', response['extra']);
                res.send(response);
            }
        }, 3000);
    }


    async stop(req, res, next) {
        console.log('[http] task stop');

        //获取表单数据，josn
        var task_id = req.body['task_id'];        //获取表单数据，josn

        //参数有效性检查
        if(typeof(task_id)==="undefined" ){
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
            return;
        }

        //更新到设备数据库， stop
        var wherestr = {'task_id': task_id};
        var queryObj = await DB.TaskTable.findOne(wherestr).exec();
        if (queryObj == null){
            res.send({ret_code: 1003, ret_msg: '任务不存在', extra: task_id});
            return;
        }

        console.log('[http] task stop', queryObj['task_type']);
        ///发送任务消息
        //任务类型 // 自动交易：'trade'; 机器人模拟交易：'simulate'; 交易回测：'backtest'
        HttpTx.send(queryObj, queryObj['task_type'], 'delTask', ['market', 'trader', 'backtest']);


        HttpRx.addOnceListener(task_id, async function(type, action, response) {
            //console.log('stop task, response', response);
            if (response['ret_code'] == 0) {
                var updatestr = {'task_status': 'stop'};
                await DB.TaskTable.update(wherestr, updatestr).exec();
                res.send({ret_code: 0, ret_msg: '成功', extra: task_id});
                console.log('[http] task stop end');
            }
            else{
                console.log('error:', response['extra']);
                res.send(response);
            }
        }, 3000);
    }


    async task_info_stats(req, res, next){
        console.log('[http] task_info_stats');

        var filter = req.body['filter'];

        // 如果没有定义排序规则，添加默认排序
        if(typeof(filter)==="undefined"){
            //console.log('filter undefined');
            filter = {};
        }

        var total = await DB.TaskTable.count(filter).exec();
        filter['task_status'] = 'running';
        var running = await DB.TaskTable.count(filter).exec();
        filter['task_status'] = 'fail';
        var fail = await DB.TaskTable.count(filter).exec();
        var query = {
            'total_count': total,
            'running_count': running,
            'fail_count': fail
        };
        res.send({ret_code: 0, ret_msg: '成功', extra:query});

        console.log('[http] task_info_stats end');
    }

    async task_status(req, res, next){
        console.log('[http] task_status');
        //console.log(req.body);

        //获取表单数据，josn
        var task_id = req.body['task_id'];

        //更新到设备数据库， stop
        //var wherestr = {'task_id': task_id, 'task_status': 'running'};
        var wherestr = {'task_id': task_id};
        var queryList = await DB.TaskTable.find(wherestr).exec();
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: queryList});
        console.log('[http] task_status end');
    }


    async task_type_change(req, res, next){
        console.log('[http] task_type_change');
        //console.log(req.body);

        //获取表单数据，josn
        var task_id = req.body['task_id'];
        var trade_symbol = req.body['trade_symbol'];
        var task_type = req.body['task_type'];
        var dst_task_type = req.body['dst_task_type'];

        //参数检查
        //交易任务，通一个股票智能有一个任务
        var wherestr = {'trade_symbol': trade_symbol, 'task_type': 'trade'};
        var queryObj = await DB.TaskTable.findOne(wherestr).exec();
        if (queryObj != null) {
            res.send({ret_code: -1, ret_msg: '任务重复', extra:'任务重复'});
            return;
        }

        console.log('[http] dst_task_type:', dst_task_type);

        //更新到设备数据库， stop
        var wherestr = {'task_id': task_id, 'task_type': task_type};
        var updatestr = {'task_type': dst_task_type, 'task_status': 'stop'};
        var queryObj = await DB.TaskTable.updateOne(wherestr, updatestr).exec();
        if(queryObj != null){
            res.send({ret_code: 0, ret_msg: '成功', extra: queryObj});
        }
        else {
            res.send({ret_code: -1, ret_msg: '更新失败', extra: queryObj});
        }
        console.log('[http] task_type_change end');
    }



    /*
    *  根据数据库里的数据恢复各个进程的内容记录
    *  根据数据库里的数据恢复各个进程的内容记录
    *  进程重启后，内存数据丢失，需要恢复
    * */
    async task_recovey(){
        console.log('[http] task recovery');

        //遍历数据库，恢复运行的任务
        var wherestr = {'task_status': 'running'};
        var queryList = await DB.TaskTable.find(wherestr).exec();
        HttpTx.send(queryList, 'trade.task', 'add', ['trader', 'gateway']);

        console.log('[http] task recovery end');

    }


}

module.exports = new TaskHandle();



//await DB.TaskTable.findOneAndUpdate(wherestr, updatestr).exec();
//await 可以不调用.exec() 返回值
//如果没有转await 则必须调用.exec() 才能返回查询结果,不能通过返回值判断
//如果采用返回值得形式，必须的await

