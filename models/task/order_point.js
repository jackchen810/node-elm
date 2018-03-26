'use strict';

const mongoose = require('mongoose');
const orderPointSchema = new mongoose.Schema({
    trade_symbol: String,  //股票代码
    trade_ktype: String,  //股票ktype
    symbol_name: String,  //标的名称

    order_type: String,  //买卖点类型
    order_point_at: String,   //买卖点时间
    order_point_time: String,  //买卖点时间

    create_at:{type: String, default: null},
    sort_time:Number, //排序时间戳， string无法排序
});



const OrderPointTable = mongoose.model('OrderPointTable', orderPointSchema);
module.exports = OrderPointTable;