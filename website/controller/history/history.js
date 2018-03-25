'use strict';
const DB = require('../../../models/models.js');
const config = require('config-lite');
const dtime = require('time-formater');
const fs = require("fs");
const path = require('path');
const schedule = require('node-schedule');

class HistoryHandle {
    constructor(){
        //绑定，this
        this.planrun = this.planrun.bind(this);
        this.planupdate = this.planupdate.bind(this);

    }
    async filelist(req, res, next){
        console.log('history dl list');

        try {
            var path = config.history_dl_dir;
            var files = fs.readdirSync(path);
            console.log('files', files);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:files});
        }
        catch (e) {
            console.log(e);
            res.send({ret_code: -1, ret_msg: 'FAIL', extra:e});
            return;
        }
        console.log('history dl list end');
    }


    async planlist(req, res, next){
        console.log('task plan list');

        var wherestr = {'task_status': 'running'};
        var query = await DB.TaskPlanTable.find(wherestr).exec();
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:query});

        console.log('task plan list end');
    }

    async planupdate(req, res, next){
        console.log('task plan update');

        //获取表单数据，josn
        var task_exce_time = req.body['task_exce_time'];
        var task_plan_list = req.body['task_select_list'];
        var exectime = new Date(task_exce_time);
        var mytime = new Date();

        console.log('task_exce_time', task_exce_time);
        console.log('task_plan_list', task_plan_list);
        console.log('exectime', exectime.getHours(), exectime.getMinutes(), exectime.getSeconds());
        for(var i = 0; i< task_plan_list.length; i++) {

            //更新到设备数据库， 设备上线，下线
            var wherestr = {'task_script': task_plan_list[i]['task_script']};
            var updatestr = {
                'task_script': task_plan_list[i]['task_script'],
                'task_name': task_plan_list[i]['task_script'],   // 名称
                'task_status':task_plan_list[i]['task_status'],   // 运行状态
                'task_exce_time':task_exce_time,   // 运行状态
                //'task_crontab_str':`${exectime.getSeconds()} ${exectime.getMinutes()} ${exectime.getHours()} * * *`,   // 任务crontab字符串
                'task_crontab_str':`${exectime.getSeconds()} * * * * *`,   // 任务crontab字符串
                'crontab_status':'stop',   // 运行状态

                'create_at':dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
                'sort_time':mytime.getTime()
            };

            //参数检查
            var query = await DB.TaskPlanTable.findOne(wherestr).exec();
            if (query == null) {
                await DB.TaskPlanTable.create(updatestr);
            }
            else{
                await DB.TaskPlanTable.findByIdAndUpdate(query['_id'], updatestr).exec();
            }
        }

        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:task_plan_list.length});
        this.planrun();
        console.log('task plan update end');
    }

    async planrun(req, res, next){
        console.log('task plan run');

        var wherestr = {'task_status': 'running', 'crontab_status': 'stop'};
        var query = await DB.TaskPlanTable.find(wherestr).exec();
        if (query == null){
            return;
        }

        for (var i = 0; i< query.length; i++){
            var task_script = query[i]['task_script'];
            var task_crontab_str = query[i]['task_crontab_str'];

            console.log('1111', task_crontab_str);
            var script_fullname = path.join(__dirname, '../../', config.history_dl_dir, task_script);
            var timer_callback = require(script_fullname);
            schedule.scheduleJob(task_crontab_str, timer_callback);

            console.log('2222', task_crontab_str);
        }
        console.log('task plan run end');
    }


    async history_data(req, res, next){
        console.log('history_data run');

        //获取表单数据，josn
        var code = req.body['code'];
        var date_start = req.body['date_start'];
        var date_end = req.body['date_end'];

        var wherestr = {'date': { $gt: date_start, $lte: date_end}};
        var query = await DB.KHistory(ktype, code).find(wherestr).exec();

        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:query});
        console.log('history_data run end');
    }

    async history_list(req, res, next){
        console.log('history_list run');

        //获取表单数据，josn
        var page_size = req.body['page_size'];
        var current_page = req.body['current_page'];
        var sort = req.body['sort'];
        var filter = req.body['filter'];
        var stock_symbol = req.body['stock_symbol'];
        var stock_ktype = req.body['stock_ktype']


        // 如果没有定义排序规则，添加默认排序
        if(typeof(sort)==="undefined"){
            console.log('sort undefined');
            sort = {"date":1};
        }

        // 如果没有定义排序规则，添加默认排序
        if(typeof(filter)==="undefined"){
            console.log('filter undefined');
            filter = {'code': stock_symbol};
        }


        if (stock_ktype == '日线'){
            stock_ktype = 'day';
        }
        else if (stock_ktype == '周线'){
            stock_ktype = 'week';
        }
        else if (stock_ktype == '月线'){
            stock_ktype = 'month';
        }

        console.log('stock_symbol', stock_symbol);
        console.log('stock_ktype', stock_ktype);
        console.log('page_size', page_size);
        console.log('current_page', current_page);


        //参数有效性检查
        if(typeof(page_size)==="undefined" && typeof(current_page)==="undefined"){
            var queryList = await DB.KHistory(stock_ktype, stock_symbol).find(filter).sort(sort);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:queryList});
        }
        else if (page_size > 0 && current_page > 0) {
            var skipnum = (current_page - 1) * page_size;   //跳过数
            var queryList = await DB.KHistory(stock_ktype, stock_symbol).find(filter).sort(sort).skip(skipnum).limit(page_size);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:queryList});
        }
        else{
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
        }

        console.log('history_data run end');
    }
    async history_list_length(req, res, next){
        console.log('history_list_length run');

        //获取表单数据，josn
        var stock_symbol = req.body['stock_symbol'];
        var stock_ktype = req.body['stock_ktype']



        if (stock_ktype == '日线'){
            stock_ktype = 'day';
        }
        else if (stock_ktype == '周线'){
            stock_ktype = 'week';
        }
        else if (stock_ktype == '月线'){
            stock_ktype = 'month';
        }

        console.log('stock_symbol', stock_symbol);
        console.log('stock_ktype', stock_ktype);


        var query = await DB.KHistory(stock_ktype, stock_symbol).count;
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:query});

        console.log('history_list_length run end');
    }
}

module.exports = new HistoryHandle()



//await DB.TaskTable.findOneAndUpdate(wherestr, updatestr).exec();
//await 可以不调用.exec() 返回值
//如果没有转await 则必须调用.exec() 才能返回查询结果,不能通过返回值判断
//如果采用返回值得形式，必须的await

