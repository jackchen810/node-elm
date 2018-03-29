'use strict';


const admin_router = require('./admin.js');
const task_router = require('./task.js');
const riskctrl_router = require('./trade_riskctrl.js');
const strategy_router = require('./trade_strategy.js');
const order_router = require('./order_gateway.js');
const market_router = require('./market_gateway.js');
const log_router = require('./log.js');
const history_router = require('./history.js');
const backtest_router = require('./backtest.js');
const trade_point_router = require('./trade_point.js');
const download_plan_router = require('./download_plan.js');
const pick_strategy_router = require('./pick_stock.js');



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

    //交易点管理
    app.use('/trade/point', trade_point_router);

    //下载计划路由
    app.use('/download/plan', download_plan_router);

    //选股策略路由
    app.use('/pick/stock/strategy', pick_strategy_router);

    //选股结果路由
    app.use('/pick/stock/result', pick_strategy_router);
}


//导出模块
module.exports = web_router;
