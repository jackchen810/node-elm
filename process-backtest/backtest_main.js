'use strict';
console.log('[begin] create backtest process, pid:', process.pid);

const logger = require( '../logs/logs.js');
require("./backtest_rx.js");
require("./backtest_tx.js");


process.on('unhandledRejection', (reason, p) => {
    logger.info("[backtest] Unhandled Rejection:", p);
    console.log("[backtest] Unhandled Rejection:", p);
    // application specific logging, throwing an error, or other logic here
});


process.on('uncaughtException', (err) => {
    logger.error("[backtest] uncaughtException：", err);
    console.log("[backtest] uncaughtException：", err);
});


console.log('[end] create backtest process, pid:', process.pid);