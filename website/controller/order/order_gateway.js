'use strict';
import DB from "../../../models/models.js";
import config from "config-lite";
import dtime from "time-formater";
const fs = require("fs");
const path = require('path');


class OrderGatewayHandle {
    constructor(){

    }
    async list(req, res, next){
        console.log('order gateway list');

        try {
            var path = config.order_gateway_dir;
            var files = fs.readdirSync(path);
            console.log('files', files);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:files});
        }
        catch (e) {
            console.log(e);
            res.send({ret_code: -1, ret_msg: 'FAIL', extra:e});
            return;
        }

        console.log('order gateway list end');
    }

    async add(req, res, next){
        console.log('order gateway add');

        //获取表单数据，josn
        var file_name = req.body['file_name'];
        var is_bind = req.body['is_bind'];        //绑定的行情接口

        console.log('order gateway add end');
    }

}

export default new OrderGatewayHandle()



//await DB.TaskTable.findOneAndUpdate(wherestr, updatestr).exec();
//await 可以不调用.exec() 返回值
//如果没有转await 则必须调用.exec() 才能返回查询结果,不能通过返回值判断
//如果采用返回值得形式，必须的await

