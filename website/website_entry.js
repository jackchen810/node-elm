'use strict';

//加载主模块
require("./website_main");
require("./website_rx");
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

console.log('create website process, pid:', process.pid);


const TaskHandle = require('./controller/task/trade_task.js');
const PickStockHandle = require('./controller/pickstock/pick_stock.js');
const HistoryHandle = require('./controller/download/download_plan.js');
const BacktestHandle = require('./controller/backtest/back_test.js');
TaskHandle.task_recovey();
PickStockHandle.task_recovey();
HistoryHandle.task_recovey();
BacktestHandle.task_recovey();
