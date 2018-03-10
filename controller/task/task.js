'use strict';
import DB from "../../models/models.js";
import WorkerHnd from "../../trader/worker/worker_agent.js";
import dtime from "time-formater";
const fs = require("fs");
const path = require('path');


class TaskHandle {
    constructor(){
        this.guid = this.guid.bind(this);
        this.list = this.list.bind(this);
        this.add = this.add.bind(this);
        this.del = this.del.bind(this);
        //console.log('TaskHandle constructor');
    }


    guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    async list(req, res, next){
        console.log('task list');
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

        //参数有效性检查
        if(typeof(page_size)==="undefined" && typeof(current_page)==="undefined"){
            var query = await DB.TaskTable.find(filter).sort(sort);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:query});
        }
        else if (page_size > 0 && current_page > 0) {
            var skipnum = (current_page - 1) * page_size;   //跳过数
            var query = await DB.TaskTable.find(filter).sort(sort).skip(skipnum).limit(page_size);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:query});
        }
        else{
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
        }

        console.log('task list end');
    }



    async add(req, res, next) {
        console.log('task add');

        //获取表单数据，josn
        var strategy_type = req.body['strategy_type'];
        var strategy_list = req.body['strategy_list'];        //获取表单数据，josn
        var riskctrl_name = req.body['riskctrl_name'];        //获取表单数据，josn
        var market_gateway = req.body['market_gateway'];
        var order_gateway = req.body['order_gateway'];
        var trade_symbol = strategy_list[0]['stock_symbol'];   //交易标的， 主策略标的
        var stock_ktype = strategy_list[0]['stock_ktype'];   //交易标的，主策略标的
        var task_id = this.guid();
        var mytime = new Date();


        //更新到设备数据库， 设备上线，下线
        var wherestr = {'trade_symbol': trade_symbol};

        //参数检查
        var query = await DB.TaskTable.findOne(wherestr).exec();
        if (query != null) {
            res.send({ret_code: -1, ret_msg: 'FAILED', extra:'任务重复'});
            return;
        }

        var strategy_name = '';
        for(var i = 0; i< strategy_list.length; i++) {
            strategy_name += strategy_list[i]['stock_symbol'] + '/' + strategy_list[i]['stock_ktype'] + '/' + strategy_list[i]['strategy_name'] + ';';
        }

        var updatestr = {
            'task_id': task_id,
            'task_status': 'stop',   // 运行状态
            'trade_symbol': trade_symbol,   ///index=0的使用交易symbol
            'trade_ktype': stock_ktype,   ///index=0的使用交易symbol
            'symbol_name': '',   //标的名称
            'strategy_list': strategy_list,   //对象数组
            'strategy_name': strategy_name,   //策略名称
            'riskctrl_name': riskctrl_name,   //风控名称
            'market_gateway': market_gateway,   //交易网关名称
            'order_gateway': order_gateway,   //交易网关名称
            'create_at':dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
            'sort_time':mytime.getTime()
        };

        var task_item = await DB.TaskTable.create(updatestr);
        if (task_item == null){
            res.send({ret_code: -1, ret_msg: 'FAILED', extra:'任务添加数据库失败'});
            return;
        }

        console.log('strategy_list:', strategy_list);
        var message = {
            'task_id': task_id,
            'trade_symbol': trade_symbol,
            'trade_ktype': stock_ktype,
            'strategy_list': strategy_list,   //策略名称
            'riskctrl_name': riskctrl_name,   //风控名称
            'market_gateway': market_gateway,   //行情网关名称
            'order_gateway': order_gateway,   //交易网关名称
        }

        WorkerHnd.addTask(message);
        WorkerHnd.addOnceListener(task_id, async function(type, action, response) {
            console.log('add task, response', response);
            if (response['ret_code'] == 0) {
                res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:task_id});
            }
            else{
                console.log('worker return error:', response['extra']);
                res.send(response);
                await DB.TaskTable.findByIdAndRemove(task_item['_id']);
            }
        }, 3000);
    }



    async del(req, res, next) {
        console.log('task del');

        //获取表单数据，josn
        var task_id = req.body['task_id'];        //获取表单数据，josn

        //参数有效性检查
        if(typeof(task_id)==="undefined" ){
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
            return;
        }

        console.log('task_id:', task_id);
        var wherestr = {'task_id': task_id};
        var query = await DB.TaskTable.findOne(wherestr).exec();
        if (query == null) {
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'任务不存在'});
            return;
        }

        var message = {
            'task_id': task_id,
            'trade_symbol': query['trade_symbol'],
            'trade_ktype': query['trade_ktype'],
            'strategy_list': query['strategy_list'],   //策略名称
            'riskctrl_name': query['riskctrl_name'],   //风控名称
            'market_gateway': query['market_gateway'],   //行情网关名称
            'order_gateway': query['order_gateway'],   //交易网关名称
        }


        //worker 删除任务
        WorkerHnd.delTask(message);
        WorkerHnd.addOnceListener(task_id, async function(type, action, response) {
            console.log('del task, response', response);
            if (response['ret_code'] == 0) {
                await DB.TaskTable.findByIdAndRemove(query['_id']).exec();
                res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: task_id});
            }
            else{
                console.log('error:', response['extra']);
                res.send(response);
            }
        }, 3000);
    }



    async start(req, res, next) {
        console.log('[entry] task start');

        //获取表单数据，josn
        var task_id = req.body['task_id'];        //获取表单数据，josn

        //参数有效性检查
        if(typeof(task_id)==="undefined" ){
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
            return;
        }

        //更新到设备数据库， 设备上线，下线
        var wherestr = {'task_id': task_id};
        var query = await DB.TaskTable.findOne(wherestr).exec();
        if (query == null) {
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'任务没有发现'});
            return;
        }

        var message = {
            'task_id': task_id,
            'trade_symbol': query['trade_symbol'],
            'trade_ktype': query['trade_ktype'],
            'strategy_list': query['strategy_list'],   //策略名称
            'riskctrl_name': query['riskctrl_name'],   //风控名称
            'market_gateway': query['market_gateway'],   //交易网关名称
            'order_gateway': query['order_gateway'],   //交易网关名称
        }

        WorkerHnd.addTask(message);
        WorkerHnd.addOnceListener(task_id, async function(type, action, response) {
            //console.log('start task, response', response);
            if (response['ret_code'] == 0) {
                var updatestr = { 'task_status': 'running'};
                var result = await DB.TaskTable.findByIdAndUpdate(query['_id'], updatestr).exec();
                //console.log('db query:', query);
                if (result != null) {
                    res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: task_id});
                }
                else{
                    res.send({ret_code: -1, ret_msg: 'FAILED', extra:'任务重复'});
                }
            }
            else{
                console.log('error:', response['extra']);
                res.send(response);
            }
        }, 3000);
    }


    async stop(req, res, next) {
        console.log('task stop');

        //获取表单数据，josn
        var task_id = req.body['task_id'];        //获取表单数据，josn

        //参数有效性检查
        if(typeof(task_id)==="undefined" ){
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
            return;
        }

        //更新到设备数据库， 设备上线，下线
        var wherestr = {'task_id': task_id};
        var updatestr = { 'task_status': 'stop'};


        var query = await DB.TaskTable.findOne(wherestr).exec();
        if (query == null) {
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'任务不存在'});
            return;
        }

        var message = {
            'task_id': task_id,
            'trade_symbol': query['trade_symbol'],
            'trade_ktype': query['trade_ktype'],
            'strategy_list': query['strategy_list'],   //策略名称
            'riskctrl_name': query['riskctrl_name'],   //风控名称
            'market_gateway': query['market_gateway'],   //行情网关名称
            'order_gateway': query['order_gateway'],   //交易网关名称
        }


        WorkerHnd.delTask(message);
        WorkerHnd.addOnceListener(task_id, async function(type, action, response) {
            //console.log('stop task, response', response);
            if (response['ret_code'] == 0) {
                await DB.TaskTable.findByIdAndUpdate(query['_id'], updatestr).exec();
                res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: task_id});

            }
            else{
                console.log('error:', response['extra']);
                res.send(response);
            }
        }, 3000);
    }

}

export default new TaskHandle()



//await DB.TaskTable.findOneAndUpdate(wherestr, updatestr).exec();
//await 可以不调用.exec() 返回值
//如果没有转await 则必须调用.exec() 才能返回查询结果,不能通过返回值判断
//如果采用返回值得形式，必须的await

