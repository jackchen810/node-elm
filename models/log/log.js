'use strict';

import mongoose from 'mongoose';


const logSchema = new mongoose.Schema({
    log_type: String,    //log 类型
    log_level:String,  //log 级别
    comment: { type: String, default: null },   //备注说明
    create_date: String,
    sort_time:Number, //排序时间戳， string无法排序
    //create_date: { type: Date, default: Date.now },

});

const LogTable = mongoose.model('LogTable', logSchema);
export {LogTable};