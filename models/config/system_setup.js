'use strict';

const mongoose = require('mongoose');


const systemSetupSchema = new mongoose.Schema({
    market_gateway: String,    //行情接口
    riskctrl_name:String,  //风控名称
    order_gateway: String,   //交易接口
    create_date: String,
    sort_time:Number, //排序时间戳， string无法排序
    //create_date: { type: Date, default: Date.now },

});

const SystemSetupTable = mongoose.model('SystemSetupTable', systemSetupSchema);
module.exports = SystemSetupTable;