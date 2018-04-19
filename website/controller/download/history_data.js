'use strict';
const DB = require('../../../models/models.js');
const config = require('config-lite');
const dtime = require('time-formater');
const fs = require("fs");
const path = require('path');
const schedule = require('node-schedule');

class HistoryHandle {
    constructor(){

    }

/*
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
*/

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

        var total = await DB.KHistory(stock_ktype, stock_symbol).count().exec();

        //参数有效性检查
        if(typeof(page_size)==="undefined" && typeof(current_page)==="undefined"){
            var queryList = await DB.KHistory(stock_ktype, stock_symbol).find(filter).sort(sort);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:queryList, total:total});
        }
        else if (page_size > 0 && current_page > 0) {
            var skipnum = (current_page - 1) * page_size;   //跳过数
            var queryList = await DB.KHistory(stock_ktype, stock_symbol).find(filter).sort(sort).skip(skipnum).limit(page_size);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:queryList, total:total});
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


        var query = await DB.KHistory(stock_ktype, stock_symbol).count().exec();
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:query});

        console.log('history_list_length run end');
    }
}

module.exports = new HistoryHandle()



//await DB.TaskTable.findOneAndUpdate(wherestr, updatestr).exec();
//await 可以不调用.exec() 返回值
//如果没有转await 则必须调用.exec() 才能返回查询结果,不能通过返回值判断
//如果采用返回值得形式，必须的await

