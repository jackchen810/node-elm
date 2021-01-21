'use strict';
console.log('[begin] create pick process, pid:', process.pid);
require("./picker_rx");
require("./picker_tx");
const logger = require( '../logs/logs.js');



process.on('unhandledRejection', (reason, p) => {
    logger.info("[pick] Unhandled Rejection:", p);
    console.log("[pick] Unhandled Rejection：", p);
    // application specific logging, throwing an error, or other logic here
});


process.on('uncaughtException', (err) => {
    logger.error("[pick] uncaughtException：", err);
    console.log("[http] uncaughtException：", err);
});

console.log('[end] create pick process, pid:', process.pid);

/*
* 1，遍历沪深股票选股，baostock用不了9分钟，tushare至少37分钟

2，1主要是因为tushare需要赚积分，需要注册，而且还有严格要求，速度无法快，要wait0.3s，而baostock不需要注册，可以同时运行多个py，也没有限制

3，pydroid3可以用baostock，即平板电脑、手机等Android设备（也许apple也可以？）可以用来选股，但是tushare无法！因为lxml安装不能。

4，文档支持上，也是baostock胜过tushare，至少一些基本的教程、文章还是聊胜于无的，

5，又忘了，待补充。

6，针对某个评论回复：
*
* */