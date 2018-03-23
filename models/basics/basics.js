'use strict';

const mongoose = require('mongoose');

//tushare 中数据库字段兼容
const basicsSchema = new mongoose.Schema({
    code:String, //代码
    name:String, //名称
    industry:String, //所属行业
    area:String, //地区
    pe:String, //市盈率
    outstanding:String, //流通股本(亿)
    totals:String, //总股本(亿)
    totalAssets:String, //总资产(万)
    liquidAssets:String, //流动资产
    fixedAssets:String, //固定资产
    reserved:String, //公积金
    reservedPerShare:String, //每股公积金
    esp:String, //每股收益
    bvps:String, //每股净资
    pb:String, //市净率
    timeToMarket:String, //上市日期
    undp:String, //未分利润
    perundp:String, // 每股未分配
    rev:String, //收入同比(%)
    profit:String, //利润同比(%)
    gpr:String, //毛利率(%)
    npr:String, //净利润率(%)
    holders:String, //股东人数
});

//module.exports = mongoose.model('BasicsTable', basicsSchema);
const BasicsTable = mongoose.model('BasicsTable', basicsSchema);
module.exports = BasicsTable;