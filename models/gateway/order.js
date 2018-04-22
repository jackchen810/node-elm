'use strict';

const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
    file_name: String,    //文件名
    alias_name:{ type: String, default: null },  //策略名称
    user_account: String,  //策略所属用户帐号
    comment: { type: String, default: null },   //备注说明
    file_status: { type: String, default: 'revoke' }, //normal:rom上架,revoke:pkg 下架
    is_bind: String, //是否已经绑定
    create_date: String,
    sort_time:Number, //排序时间戳， string无法排序
    //create_date: { type: Date, default: Date.now },

});

const OrderTable = mongoose.model('OrderTable', orderSchema);
module.exports = OrderTable;