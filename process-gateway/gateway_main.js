'use strict';
console.log('[begin] create gateway process, pid:', process.pid);

const logger = require( '../logs/logs.js');
require("./gateway_rx.js");
require("./gateway_tx.js");
const connectMongo = require('connect-mongo');

process.on('unhandledRejection', (reason, p) => {
    logger.info("[gateway] Unhandled Rejection:", p);
    // application specific logging, throwing an error, or other logic here
});


process.on('uncaughtException', (err) => {
    logger.error("[gateway] uncaughtException：", err);
});


console.log('[end] create gateway process, pid:', process.pid);