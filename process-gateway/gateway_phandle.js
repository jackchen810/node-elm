'use strict';
const fork = require('child_process').fork;
const logger = require( '../logs/logs.js');
//const config = require('config-lite');
//const mqtt_hnd = require('../process-mqtt/mqtter_phandle.js');
//console.log('[main] create gateway process...');

//创建一个工作进程
const gateway_p = fork('./process-gateway/gateway_main.js', ['gateway_main']);
gateway_p.on('message', function () {
    //config.process.gateway_pid = process.pid;
    console.log('[main] recv gateway message, pid =', process.pid);
    //console.log('[main] recv gateway message, pid =', config.process.gateway_pid);
});


gateway_p.on('error', (err) => {
    logger.info('gateway error:', err);
});

gateway_p.on('exit', (err) => {
    logger.error('gateway exit:', err);
});

gateway_p.on('close', (err) => {
    logger.error('gateway close:', err);
    //异常直接退出主进程，外部pm2重启整个进程
    //这里要杀死其它子进程
    //主进程退出
    process.exit(0);
});


//导出模块
module.exports = gateway_p;

