'use strict';
const DB = require('../../../models/models.js');
const config = require('config-lite');
const dtime = require('time-formater');
const fs = require("fs");
const path = require('path');
const WebsiteRx = require('../../website_rx.js');
const WebsiteTx = require('../../website_tx.js');


class HistoryHandle {
    constructor() {
        //绑定，this
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.add = this.add.bind(this);

    }

    async file_list(req, res, next) {
        console.log('download dl list');

        try {
            var path = config.history_dl_dir;
            var files = fs.readdirSync(path);
            console.log('files', files);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: files});
        }
        catch (e) {
            console.log(e);
            res.send({ret_code: -1, ret_msg: 'FAIL', extra: e});
            return;
        }
        console.log('download dl list end');
    }


    async plan_list(req, res, next) {
        console.log('download plan list');

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
        var total = await DB.TaskPlanTable.count(filter).exec();

        //参数有效性检查
        if(typeof(page_size)==="undefined" && typeof(current_page)==="undefined"){
            var queryList = await DB.TaskPlanTable.find(filter).sort(sort);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:queryList, total:total});
        }
        else if (page_size > 0 && current_page > 0) {
            var skipnum = (current_page - 1) * page_size;   //跳过数
            var queryList = await DB.TaskPlanTable.find(filter).sort(sort).skip(skipnum).limit(page_size);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:queryList, total:total});
        }
        else{
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
        }

        console.log('download plan list end');
    }

    async add(req, res, next) {
        console.log('[website] download task add');

        //获取表单数据，josn
        var user_account = req.body['user_account'];   //
        var task_exce_time = req.body['task_exce_time'];
        var task_plan_script = req.body['task_plan_script'];
        var exectime = new Date(task_exce_time);
        var task_id = DB.guid();
        var mytime = new Date();

        // 如果没有定义用户，添加session中的用户
        if(typeof(user_account)==="undefined"){
            user_account = req.session.user_account;
        }

        if (task_plan_script == ''){
            res.send({ret_code: -1, ret_msg: 'FAIL', extra: 'task_plan_script is null'});
            return;
        }

        console.log('task_exce_time', task_exce_time);
        console.log('task_plan_script', task_plan_script);
        console.log('exectime', exectime.getHours(), exectime.getMinutes(), exectime.getSeconds());


        //更新到设备数据库， 设备上线，下线
        var wherestr = {'task_script': task_plan_script};
        var updatestr = {
            'task_id': task_id,   // task_id
            'task_type': 'download',   // 名称
            'task_status': 'stop',   // 运行状态
            'user_account': user_account,   //

            'task_script': task_plan_script,
            'task_exce_time': dtime(task_exce_time).format('HH:mm:ss'),   // 运行状态
            'crontab_string':`${exectime.getSeconds()} ${exectime.getMinutes()} ${exectime.getHours()} * * *`,   // 任务crontab字符串
            //'crontab_string': `${exectime.getSeconds()} * * * * *`,   // 任务crontab字符串

            'create_at': dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
            'sort_time': mytime.getTime()
        };

        //参数检查,
        await DB.TaskPlanTable.findOneAndUpdate(wherestr, updatestr, { upsert : true }).exec();
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: task_id});
        console.log('[website] download task add end');

        /*
        //发送任务
        WebsiteTx.send([updatestr], 'download.task', 'add', 'downloader');
        WebsiteRx.addOnceListener(task_id, async function(type, action, response) {
            if (response['ret_code'] == 0) {
                res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: task_id});
                console.log('[website] download task add end');
            }
            else{
                console.log('worker return error:', response['extra']);
                res.send(response);
                var wherestr = {'task_id': task_id};
                await DB.TaskPlanTable.remove(wherestr).exec();
            }
        }, 3000);
        */
    }


    async del(req, res, next) {
        console.log('[website] download task del');

        //获取表单数据，josn
        var task_id = req.body['task_id'];        //获取表单数据，josn

        //参数有效性检查
        if(typeof(task_id)==="undefined" ){
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
            return;
        }

        console.log('task_id:', task_id);
        var wherestr = {'task_id': task_id};
        var queryList = await DB.TaskPlanTable.find(wherestr).exec();

        //发送任务,worker 删除任务
        WebsiteTx.send(queryList, 'download.task', 'del', 'downloader');
        WebsiteRx.addOnceListener(task_id, async function(type, action, response) {
            if (response['ret_code'] == 0) {
                await DB.TaskPlanTable.remove(wherestr).exec();
                res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: task_id});
                console.log('[website] download task del end');
            }
            else{
                console.log('error:', response['extra']);
                res.send(response);
            }
        }, 3000);
    }



    async start(req, res, next) {
        console.log('[website] download task start');

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
        var queryList = await DB.TaskPlanTable.find(wherestr).exec();
        if (queryList.length == 0){
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: task_id});
            return;
        }

        WebsiteTx.send(queryList, 'download.task', 'add', 'downloader');
        WebsiteRx.addOnceListener(task_id, async function(type, action, response) {
            if (response['ret_code'] == 0) {
                var updatestr = {'task_status': 'running'};
                await DB.TaskPlanTable.update(wherestr, updatestr).exec();
                res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: task_id});
                console.log('[website] download task start end');
            }
            else{
                console.log('error:', response['extra']);
                res.send(response);
            }
        }, 3000);
    }


    async stop(req, res, next) {
        console.log('[website] download task stop');

        //获取表单数据，josn
        var task_id = req.body['task_id'];        //获取表单数据，josn

        //参数有效性检查
        if(typeof(task_id)==="undefined" ){
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
            return;
        }

        //更新到设备数据库， stop
        //var wherestr = {'task_id': task_id, 'task_status': 'running'};
        var wherestr = {'task_id': task_id};
        var queryList = await DB.TaskPlanTable.find(wherestr).exec();
        if (queryList.length == 0){
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: task_id});
            return;
        }

        WebsiteTx.send(queryList, 'download.task', 'del', 'downloader');
        WebsiteRx.addOnceListener(task_id, async function(type, action, response) {
            //console.log('stop task, response', response);
            if (response['ret_code'] == 0) {
                var updatestr = {'task_status': 'stop'};
                await DB.TaskPlanTable.update(wherestr, updatestr).exec();
                res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: task_id});
                console.log('[website] download task stop end');
            }
            else{
                console.log('error:', response['extra']);
                res.send(response);
            }
        }, 3000);
    }

    async task_recovey(){
        console.log('[website] download task recovery');

        //遍历数据库，恢复运行的任务
        var wherestr = {'task_status': 'running'};
        var queryList = await DB.TaskPlanTable.find(wherestr).exec();
        WebsiteTx.send(queryList, 'download.task', 'add', 'downloader');

        console.log('[website] download task recovery end');

    }
}

module.exports = new HistoryHandle()



//await DB.TaskPlanTable.findOneAndUpdate(wherestr, updatestr).exec();
//await 可以不调用.exec() 返回值
//如果没有转await 则必须调用.exec() 才能返回查询结果,不能通过返回值判断
//如果采用返回值得形式，必须的await

