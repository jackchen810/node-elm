'use strict';
var http = require('http');
var iconv = require('iconv-lite');
var schedule = require('node-schedule');

const sinaDataDownload = (symbol, ktype) =>
    `http://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?symbol=${symbol}scale=${ktype}&ma=no&datalen=1023`;

console.log('run script dl day');

sinaDataDownload()

//导出模块
module.exports = new SinaMarketClass();
