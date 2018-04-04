'use strict';

const mongoose = require('mongoose');


const selectResultSchema = new mongoose.Schema({
    task_id: String,  //任务id

    stock_symbol: String,  //股票代码
    symbol_name: String,  //标的名称
    stock_ktype: String,  //股票ktype
    close: String,  //股票收盘价
    weight: String,  //股票weight
    base: String,  //股票weight
    strategy_name: String,  //策略名称

});

const PickResultTable = mongoose.model('PickResultTable', selectResultSchema);
module.exports = PickResultTable;
