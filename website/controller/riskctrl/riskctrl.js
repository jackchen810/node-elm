'use strict';
const config = require('config-lite');
const fs = require("fs");
const path = require('path');


class RiskctrlHandle {
    constructor(){

    }
    async list(req, res, next){
        console.log('riskctrl list');

        try {
            var path = config.riskctrl_dir;
            var files = fs.readdirSync(path);
            console.log('files', files);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:files});
        }
        catch (e) {
            console.log(e);
            res.send({ret_code: -1, ret_msg: 'FAIL', extra:e});
            return;
        }

        console.log('riskctrl list end');
    }

}

module.exports = new RiskctrlHandle()



//await DB.TaskTable.findOneAndUpdate(wherestr, updatestr).exec();
//await 可以不调用.exec() 返回值
//如果没有转await 则必须调用.exec() 才能返回查询结果,不能通过返回值判断
//如果采用返回值得形式，必须的await

