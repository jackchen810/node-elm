'use strict';
const fork = require('child_process').fork;
const logger = require( '../logs/logs.js');
//const config = require('config-lite');
//const mqtt_hnd = require('../process-mqtt/mqtter_phandle.js');
//console.log('[main] create market process...');

//创建一个工作进程
const market_p = fork('./process-market/market_main.js', ['market_main']);
market_p.on('message', function () {
    //config.process.market_pid = process.pid;
    console.log('[main] recv market message, pid =', process.pid);
    //console.log('[main] recv market message, pid =', config.process.market_pid);
});


market_p.on('error', (err) => {
    logger.info('market error:', err);
});

market_p.on('exit', (err) => {
    logger.error('market exit:', err);
});

market_p.on('close', (err) => {
    logger.error('market close:', err);
    //异常直接退出主进程，外部pm2重启整个进程
    //这里要杀死其它子进程
    //主进程退出
    process.exit(0);
});


//导出模块
module.exports = market_p;

