'use strict';
const DB = require('../../../models/models.js');
const dtime = require('time-formater');
const config = require('config-lite');
const HttpRx = require('../../http_rx.js');
const HttpTx = require('../../http_tx.js');

const fs = require("fs");
const path = require('path');
const multiparty = require('multiparty');
const formidable = require('formidable');

class PickStockResultHandle {
    constructor(){
        //绑定，this
        this.result_list = this.result_list.bind(this);
    }


    async result_list(req, res, next){
        console.log('[http] pickstock result list');
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


        var total = await DB.PickResultTable.count(filter).exec();

        //参数有效性检查
        if(typeof(page_size)==="undefined" && typeof(current_page)==="undefined"){
            var queryList = await DB.PickResultTable.find(filter).sort(sort);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:queryList, total:total});
            //console.log(queryList);
        }
        else if (page_size > 0 && current_page > 0) {
            var skipnum = (current_page - 1) * page_size;   //跳过数
            var queryList = await DB.PickResultTable.find(filter).sort(sort).skip(skipnum).limit(page_size);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:queryList, total:total});
        }
        else{
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
        }

        console.log('[http] pickstock result list end');
    }


    async result_list_length(req, res, next){
        console.log('[http] pickstock result_list_length');

        var filter = req.body['filter'];

        // 如果没有定义排序规则，添加默认排序
        if(typeof(filter)==="undefined"){
            filter = {};
        }
        var query = await DB.PickResultTable.count(filter).exec();
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:query});

        console.log('[http] pickstock result_list_length end');
    }

}

module.exports = new PickStockResultHandle();



//await DB.TaskTable.findOneAndUpdate(wherestr, updatestr).exec();
//await 可以不调用.exec() 返回值
//如果没有转await 则必须调用.exec() 才能返回查询结果,不能通过返回值判断
//如果采用返回值得形式，必须的await

