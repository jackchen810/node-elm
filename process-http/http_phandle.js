'use strict';
/*
//加载主模块
require("./http_main");
require("./http_rx");
require("./recorder/backtest_record");
require("./recorder/pickstock_record");
require("./recorder/logs_record");
require("./recorder/trade_record");



process.on('SIGHUP', function() {
    process.exit();//收到kill信息，进程退出
});

process.on('unhandledRejection', (reason, p) => {
    console.info("Unhandled Rejection:", p);
});

console.log('create http process, pid:', process.pid);


const TaskHandle = require('./controller/task/trade_simulate_backtest_task.js');
const PickStockHandle = require('./controller/pickstock/task_pick.js');
const HistoryHandle = require('./controller/download/download_plan.js');
const BacktestHandle = require('./controller/backtest/back_test.js');
TaskHandle.task_recovey();
PickStockHandle.task_recovey();
HistoryHandle.task_recovey();
BacktestHandle.task_recovey();
*/
'use strict';
const fork = require('child_process').fork;
const logger = require( '../logs/logs.js');
//const config = require('config-lite');
//const mqtt_hnd = require('../process-mqtt/mqtter_phandle.js');
//console.log('[main] create http process...');

//创建一个工作进程
const http_p = fork('./process-http/http_main.js', ['http_main']);
http_p.on('message', function () {
    //config.process.http_pid = process.pid;
    console.log('[main] recv http message, pid =', process.pid);
    //console.log('[main] recv http message, pid =', config.process.http_pid);
});


http_p.on('error', (err) => {
    logger.info('http error:', err);
});

http_p.on('exit', (err) => {
    logger.error('http exit:', err);
});

http_p.on('close', (err) => {
    logger.error('http close:', err);
    //异常直接退出主进程，外部pm2重启整个进程
    //这里要杀死其它子进程
    //主进程退出
    process.exit(0);
});


//导出模块
module.exports = http_p;

