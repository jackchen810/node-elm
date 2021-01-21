'use strict';
const fork = require('child_process').fork;
const logger = require( '../logs/logs.js');
//const config = require('config-lite');
//const mqtt_hnd = require('../process-mqtt/mqtter_phandle.js');
//console.log('[main] create backtest process...');

//创建一个工作进程
const backtest_p = fork('./process-backtest/backtest_main.js', ['backtest_main']);
backtest_p.on('message', function () {
    //config.process.backtest_pid = process.pid;
    console.log('[main] recv backtest message, pid =', process.pid);
    //console.log('[main] recv backtest message, pid =', config.process.backtest_pid);
});


backtest_p.on('error', (err) => {
    logger.info('backtest error:', err);
});

backtest_p.on('exit', (err) => {
    logger.error('backtest exit:', err);
});

backtest_p.on('close', (err) => {
    logger.error('backtest close:', err);
    //异常直接退出主进程，外部pm2重启整个进程
    //这里要杀死其它子进程
    //主进程退出
    process.exit(0);
});


//导出模块
module.exports = backtest_p;

