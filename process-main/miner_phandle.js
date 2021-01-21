'use strict';
const fork = require('child_process').fork;


//console.log('[main] create mqtt process...');



//创建一个工作进程
const main_p = fork('./miner_main.js', ['main_main']);
main_p.on('message', function () {
    console.log('[main] recv main message, pid =', process.pid);
});



//导出模块
module.exports = main_p;
