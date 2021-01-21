'use strict';
const fork = require('child_process').fork;
const logger = require( '../logs/logs.js');
//const config = require('config-lite');
//const mqtt_hnd = require('../process-mqtt/mqtter_phandle.js');
//console.log('[main] create picker process...');

//创建一个工作进程
const picker_p = fork('./process-pick/picker_main.js', ['picker_main']);
picker_p.on('message', function () {
    //config.process.picker_pid = process.pid;
    console.log('[main] recv picker message, pid =', process.pid);
    //console.log('[main] recv picker message, pid =', config.process.picker_pid);
});


picker_p.on('error', (err) => {
    logger.info('picker error:', err);
});

picker_p.on('exit', (err) => {
    logger.error('picker exit:', err);
});

picker_p.on('close', (err) => {
    logger.error('picker close:', err);
    //异常直接退出主进程，外部pm2重启整个进程
    //这里要杀死其它子进程
    //主进程退出
    process.exit(0);
});


//导出模块
module.exports = picker_p;

