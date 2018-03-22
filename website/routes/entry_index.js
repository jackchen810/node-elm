'use strict';


const admin_router = require('./admin.js');
const task_router = require('./task.js');
const riskctrl_router = require('./riskctrl.js');
const strategy_router = require('./strategy.js');
const order_router = require('./order_gateway.js');
const market_router = require('./market_gateway.js');
const log_router = require('./log.js');
const history_router = require('./history.js');
const backtest_router = require('./backtest.js');



function web_router(app) {
     //渠道相关
     app.use('/admin', admin_router);

     //任务功能
     app.use('/task', task_router);

     //风控管理功能
     app.use('/riskctrl', riskctrl_router);

     //策略管理功能
     app.use('/strategy', strategy_router);

     //交易接口管理功能
     app.use('/order', order_router);

    //行情接口管理功能
    app.use('/market', market_router);

    //行情接口管理功能
    app.use('/log', log_router);

    //行情接口管理功能
    app.use('/history', history_router);

    //回测接口管理功能
    app.use('/backtest', backtest_router);


}


//导出模块
module.exports = web_router;
