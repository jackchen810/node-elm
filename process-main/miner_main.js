'use strict';
const logger = require( '../logs/logs.js');
require('../mongodb/db.js');
//require("./controller/o3_100kg_real.js");
//require("./controller/s7_smart_plc.js");

logger.info('[main] create main process..., arg2:'+ process.argv[2], ',pid =', process.pid);




process.on('unhandledRejection', (reason, p) => {
    logger.info("[main] Unhandled Rejection:", p);
    console.log("[main] Unhandled Rejection:", p);
    // application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (err) => {
    logger.error("[main] uncaughtException：", err);
    console.log("[main] uncaughtException：", err);
});