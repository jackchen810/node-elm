'use strict';
import DB from "../../models/models.js";
import config from "config-lite";
import dtime from "time-formater";
const fs = require("fs");
const path = require('path');


class MarketGatewayHandle {
    constructor(){

    }
    async list(req, res, next){
        console.log('market gateway list');

        try {
            var path = config.market_gateway_dir;
            var files = fs.readdirSync(path);
            console.log('files', files);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:files});
        }
        catch (e) {
            console.log(e);
            res.send({ret_code: -1, ret_msg: 'FAIL', extra:e});
            return;
        }

        console.log('market gateway list end');
    }

    async get_bindobj(req, res, next){
        console.log('market gateway get bindobj');

        //更新到设备数据库， 设备上线，下线
        var wherestr = {'is_bind': 'true'};
        var query = await DB.MarketTable.findOne(wherestr).exec();
        if (query == null) {
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:''});
            return;
        }

        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:query['file_name']});
        console.log('market gateway bindobj end');
    }

    async bind(req, res, next){
        console.log('order gateway bind');

        //获取表单数据，josn
        var file_name = req.body['file_name'];
        var is_bind = req.body['is_bind'];        //绑定的行情接口
        var mytime = new Date();

        await DB.MarketTable.update({'is_bind': 'false'}).exec();

        //更新到设备数据库， 设备上线，下线
        var wherestr = {'file_name': file_name};
        var updatestr = {'is_bind': is_bind};
        var query = await DB.MarketTable.findOneAndUpdate(wherestr, updatestr).exec();
        if (query == null) {
            var newstr = {
                'file_name': file_name,
                'file_status': 'normal',
                'is_bind': is_bind,   // 运行状态
                'create_at':dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
                'sort_time':mytime.getTime()
            };
            await DB.MarketTable.create(newstr);
        }


        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:'ok'});
        console.log('order gateway bind end');
    }


}

export default new MarketGatewayHandle()



//await DB.TaskTable.findOneAndUpdate(wherestr, updatestr).exec();
//await 可以不调用.exec() 返回值
//如果没有转await 则必须调用.exec() 才能返回查询结果,不能通过返回值判断
//如果采用返回值得形式，必须的await

