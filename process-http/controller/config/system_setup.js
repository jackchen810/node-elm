'use strict';
const DB = require('../../../models/models.js');
const config = require('config-lite');
const dtime = require('time-formater');
const fs = require("fs");
const path = require('path');


class SystemSetupHandle {
    constructor(){

        DB.SystemSetupTable.count(function (err, count) {
            if (count == 0) {
                var mytime = new Date();
                var updatestr = {
                    'market_gateway': '',
                    'riskctrl_name': '',
                    'order_gateway': '',
                    'create_at': dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
                    'sort_time': mytime.getTime()
                };
                DB.SystemSetupTable.create(updatestr);
            }
        });
    }
    async system_setup_list(req, res, next){
        console.log('[http] system setup list');

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

        //console.log('sort ', sort);
        //console.log('filter ', filter);

        //参数有效性检查
        if(typeof(page_size)==="undefined" && typeof(current_page)==="undefined"){
            var queryList = await DB.SystemSetupTable.find(filter).sort(sort);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:queryList[0]});
        }
        else if (page_size > 0 && current_page > 0) {
            var skipnum = (current_page - 1) * page_size;   //跳过数
            var queryList = await DB.SystemSetupTable.find(filter).sort(sort).skip(skipnum).limit(page_size);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:queryList[0]});
        }
        else{
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
        }

        console.log('[http] system setup list end');
    }


    async system_setup_update(req, res, next) {
        console.log('[http] system setup update');

        //获取表单数据，josn
        var updater = req.body['updater'];

        // 如果没有定义排序规则，添加默认排序
        if(typeof(updater)==="undefined"){
            updater = {};
        }

        console.log('updater:', updater);
        await DB.SystemSetupTable.update({}, updater, { upsert : true }).exec();
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:{}});
        console.log('[http] system setup update end');
    }

}

module.exports = new SystemSetupHandle()



//await DB.TaskTable.findOneAndUpdate(wherestr, updatestr).exec();
//await 可以不调用.exec() 返回值
//如果没有转await 则必须调用.exec() 才能返回查询结果,不能通过返回值判断
//如果采用返回值得形式，必须的await

