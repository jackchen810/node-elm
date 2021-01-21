'use strict';
console.log('[begin] create download process, pid:', process.pid);

const logger = require( '../logs/logs.js');

require("./core/dl_timer_task");
require("./market_rx");
require("./market_tx");



process.on('unhandledRejection', (reason, p) => {
    logger.info("[download] Unhandled Rejection:", p);
    // application specific logging, throwing an error, or other logic here
});


process.on('uncaughtException', (err) => {
    logger.error("[download] uncaughtException：", err);
});


console.log('[end] create download process, pid:', process.pid);