'use strict';

const mongoose = require('mongoose');


const selectResultSchema = new mongoose.Schema({
    task_id: String,  //任务id

    stock_symbol: String,  //股票代码
    stock_ktype: String,  //股票ktype
    symbol_name: String,  //标的名称
    strategy_name: String,  //策略名称

    create_at:{type: String, default: null},
    sort_time:Number, //排序时间戳， string无法排序

});

const SelectResultTable = mongoose.model('SelectResultTable', selectResultSchema);
module.exports = SelectResultTable;
