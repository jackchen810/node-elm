'use strict';
import config from "config-lite";
const fs = require("fs");
const path = require('path');
const schedule = require('node-schedule');

class BacktestHandle {
    constructor(){
        //绑定，this
        this.start = this.start.bind(this);

    }
    async start(req, res, next){
        console.log('backtest start');

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
        console.log('backtest start end');
    }




}

export default new BacktestHandle()



//await DB.TaskTable.findOneAndUpdate(wherestr, updatestr).exec();
//await 可以不调用.exec() 返回值
//如果没有转await 则必须调用.exec() 才能返回查询结果,不能通过返回值判断
//如果采用返回值得形式，必须的await

