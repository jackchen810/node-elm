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

        //var wherestr = {'task_status': 'running'};
        var queryList = await DB.TaskPlanTable.find().exec();
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: queryList});

        console.log('download plan list end');
    }

    async add(req, res, next) {
        console.log('[website] download task add');

        //获取表单数据，josn
        var task_exce_time = req.body['task_exce_time'];
        var task_plan_script = req.body['task_plan_script'];
        var exectime = new Date(task_exce_time);
        var task_id = DB.guid();
        var mytime = new Date();

        console.log('task_exce_time', task_exce_time);
        console.log('task_plan_script', task_plan_script);
        console.log('exectime', exectime.getHours(), exectime.getMinutes(), exectime.getSeconds());


        //更新到设备数据库， 设备上线，下线
        var wherestr = {'task_script': task_plan_script};
        var updatestr = {
            'task_id': task_id,   // task_id
            'task_type': 'download',   // 名称
            'task_status': 'stop',   // 运行状态

            'task_script': task_plan_script,
            'task_exce_time': dtime(task_exce_time).format('HH:mm:ss'),   // 运行状态
            'crontab_string':`${exectime.getSeconds()} ${exectime.getMinutes()} ${exectime.getHours()} * * *`,   // 任务crontab字符串
            //'crontab_string': `${exectime.getSeconds()} * * * * *`,   // 任务crontab字符串

            'create_at': dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
            'sort_time': mytime.getTime()
        };

        //参数检查,
        await DB.TaskPlanTable.findOneAndUpdate(wherestr, updatestr, { upsert : true }).exec();

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


}

module.exports = new HistoryHandle()



//await DB.TaskTable.findOneAndUpdate(wherestr, updatestr).exec();
//await 可以不调用.exec() 返回值
//如果没有转await 则必须调用.exec() 才能返回查询结果,不能通过返回值判断
//如果采用返回值得形式，必须的await

