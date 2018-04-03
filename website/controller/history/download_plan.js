'use strict';
const DB = require('../../../models/models.js');
const config = require('config-lite');
const dtime = require('time-formater');
const fs = require("fs");
const path = require('path');
const schedule = require('node-schedule');

class HistoryHandle {
    constructor() {
        //绑定，this
        this.plan_run = this.plan_run.bind(this);
        this.plan_update = this.plan_update.bind(this);

    }

    async file_list(req, res, next) {
        console.log('history dl list');

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
        console.log('history dl list end');
    }


    async plan_list(req, res, next) {
        console.log('download plan list');

        var wherestr = {'task_status': 'running'};
        var query = await DB.TaskPlanTable.find(wherestr).exec();
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: query});

        console.log('download plan list end');
    }

    async plan_update(req, res, next) {
        console.log('download plan update');

        //获取表单数据，josn
        var task_exce_time = req.body['task_exce_time'];
        var task_plan_list = req.body['task_select_list'];
        var exectime = new Date(task_exce_time);
        var mytime = new Date();

        console.log('task_exce_time', task_exce_time);
        console.log('task_plan_list', task_plan_list);
        console.log('exectime', exectime.getHours(), exectime.getMinutes(), exectime.getSeconds());
        for (var i = 0; i < task_plan_list.length; i++) {

            //更新到设备数据库， 设备上线，下线
            var wherestr = {'task_script': task_plan_list[i]['task_script']};
            var updatestr = {
                'task_script': task_plan_list[i]['task_script'],
                'task_name': task_plan_list[i]['task_script'],   // 名称
                'task_status': task_plan_list[i]['task_status'],   // 运行状态
                'task_exce_time': dtime(task_exce_time).format('HH:mm:ss'),   // 运行状态
                //'task_crontab_str':`${exectime.getSeconds()} ${exectime.getMinutes()} ${exectime.getHours()} * * *`,   // 任务crontab字符串
                'task_crontab_str': `${exectime.getSeconds()} * * * * *`,   // 任务crontab字符串
                'crontab_status': 'stop',   // 运行状态

                'create_at': dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
                'sort_time': mytime.getTime()
            };

            //参数检查
            var query = await DB.TaskPlanTable.findOne(wherestr).exec();
            if (query == null) {
                await DB.TaskPlanTable.create(updatestr);
            }
            else {
                await DB.TaskPlanTable.findByIdAndUpdate(query['_id'], updatestr).exec();
            }
        }

        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: task_plan_list.length});
        this.plan_run();
        console.log('download plan update end');
    }

    async plan_run(req, res, next) {
        console.log('download plan run');

        var wherestr = {'task_status': 'running', 'crontab_status': 'stop'};
        var query = await DB.TaskPlanTable.find(wherestr).exec();
        if (query == null) {
            return;
        }

        for (var i = 0; i < query.length; i++) {
            var task_script = query[i]['task_script'];
            var task_crontab_str = query[i]['task_crontab_str'];

            //console.log('scheduleJob', task_crontab_str);
            var script_fullname = path.join(__dirname, '../../../', config.history_dl_dir, task_script);
            console.log('script_fullname', script_fullname);
            var timer_callback = require(script_fullname);
            schedule.scheduleJob(task_crontab_str, timer_callback);

            console.log('scheduleJob start', task_crontab_str);
        }
        console.log('download plan run end');
    }



    async add(req, res, next) {
        console.log('[website] download plan task add');
    }


    async del(req, res, next) {
        console.log('[website] download plan task del');

        //获取表单数据，josn
        var _id = req.body['_id'];        //获取表单数据，josn

        //参数有效性检查
        if(typeof(_id)==="undefined" ){
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
            return;
        }

        await DB.TaskPlanTable.findByIdAndRemove(_id).exec();
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: _id});
    }



    async start(req, res, next) {
        console.log('[website] download plan task start');

        //获取表单数据，josn
        var _id = req.body['_id'];        //获取表单数据，josn

        //参数有效性检查
        if(typeof(_id)==="undefined" ){
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
            return;
        }

        //更新到设备数据库， 已经完成的任务不重新开始
        var updatestr = {'task_status': 'running'};
        await DB.TaskPlanTable.findByIdAndUpdate(_id, updatestr).exec();
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: _id});
    }


    async stop(req, res, next) {
        console.log('[website] download plan task stop');

        //获取表单数据，josn
        var _id = req.body['_id'];        //获取表单数据，josn

        //参数有效性检查
        if(typeof(task_id)==="undefined" ){
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
            return;
        }

        //更新到设备数据库， 已经完成的任务不重新开始
        var updatestr = {'task_status': 'stop'};
        await DB.TaskPlanTable.findByIdAndUpdate(_id, updatestr).exec();
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: _id});
    }


}

module.exports = new HistoryHandle()



//await DB.TaskTable.findOneAndUpdate(wherestr, updatestr).exec();
//await 可以不调用.exec() 返回值
//如果没有转await 则必须调用.exec() 才能返回查询结果,不能通过返回值判断
//如果采用返回值得形式，必须的await

