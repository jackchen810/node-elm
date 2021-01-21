'use strict';

const mongoose = require('mongoose');
//const WorkerHnd = require('../../trader/worker/trader_phandle.js');
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

