'use strict';
console.log('[begin] create trader process, pid:', process.pid);
const logger = require( '../logs/logs.js');
require("./core/trader_task");
//require("./core/worker_backtest");
require("./trader_rx");
require("./trader_tx");
require('../mongodb/db.js');


process.on('unhandledRejection', (reason, p) => {
    logger.info("[trader] Unhandled Rejection:", p);
    console.log("[trader] Unhandled Rejection:", p);
});


process.on('uncaughtException', (err) => {
    logger.error("[trader] uncaughtException：", err);
    console.log("[trader] uncaughtException：", err);
});


console.log('[end] create trader process, pid:', process.pid);


// deepClone 添加到object对象里
const deepClone = function(obj) {
    // 先检测是不是数组和Object
    // let isArr = Object.prototype.toString.call(obj) === '[object Array]';
    let isArr = Array.isArray(obj);
    let isJson = Object.prototype.toString.call(obj) === '[object Object]';
    if (isArr) {
        // 克隆数组
        let newObj = [];
        for (let i = 0; i < obj.length; i++) {
            newObj[i] = deepClone(obj[i]);
        }
        return newObj;
    } else if (isJson) {
        // 克隆Object
        let newObj = {};
        for (let i in obj) {
            newObj[i] = deepClone(obj[i]);
        }
        return newObj;
    }
    // 不是引用类型直接返回
    return obj;
};

Object.prototype.deepClone = function() {
    return deepClone(this);
};
Object.defineProperty(Object.prototype, 'deepClone', {enumerable: false});