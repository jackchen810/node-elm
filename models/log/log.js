'use strict';

const mongoose = require('mongoose');
//const WorkerHnd = require('../../trader/worker/worker_phandle.js');
const DB = require('../models');
const dtime = require('time-formater');

const logSchema = new mongoose.Schema({
    log_type: String,    //log 类型
    log_level:String,  //log 级别
    comment: { type: String, default: null },   //备注说明
    file: { type: String, default: null },   //备注说明
    function: { type: String, default: null },   //备注说明
    create_at: String,
    sort_time:Number, //排序时间戳， string无法排序
    //create_date: { type: Date, default: Date.now },

});

const LogTable = mongoose.model('LogTable', logSchema);
module.exports = LogTable;


/*
WorkerHnd.addLoopListener('log', function(action, body) {
    //console.log('log->db, body', body);
    var mytime = new Date();

    var updatestr = {
        'log_type': body['log_type'],
        'log_level': body['log_level'],
        'comment': body['comment'],
        'create_at':dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
        'sort_time':mytime.getTime()
    };

    LogTable.create(updatestr);
});
*/