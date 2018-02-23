'use strict';
import DB from "../../models/models.js";
import config from "config-lite";
const fs = require("fs");
const path = require('path');


class LogHandle {
    constructor(){

    }
    async list(req, res, next){
        console.log('task log list');


        //获取表单数据，josn
        var page_size = req.body['page_size'];
        var current_page = req.body['current_page'];
        var sort = req.body['sort'];
        var filter = req.body['filter'];

        // 如果没有定义排序规则，添加默认排序
        if(typeof(sort)==="undefined"){
            console.log('sort undefined');
            sort = {"sort_time":-1};
        }

        // 如果没有定义排序规则，添加默认排序
        if(typeof(filter)==="undefined"){
            console.log('filter undefined');
            filter = {};
        }

        //参数有效性检查
        if(typeof(page_size)==="undefined" && typeof(current_page)==="undefined"){
            var query = await DB.LogTable.find(filter).sort(sort);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:query});
        }
        else if (page_size > 0 && current_page > 0) {
            //var ret = await DB.RomTable.findByPage(filter, page_size, current_page, sort);
            var skipnum = (current_page - 1) * page_size;   //跳过数
            var query = await DB.LogTable.find(filter).sort(sort).skip(skipnum).limit(page_size);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:query});
        }
        else{
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
        }
        console.log('task log list end');
    }




}

export default new LogHandle()



//await DB.TaskTable.findOneAndUpdate(wherestr, updatestr).exec();
//await 可以不调用.exec() 返回值
//如果没有转await 则必须调用.exec() 才能返回查询结果,不能通过返回值判断
//如果采用返回值得形式，必须的await

