'use strict';


const admin_router = require('./acount.js');
const task_router = require('./trade_task.js');
const riskctrl_router = require('./trade_riskctrl.js');
const strategy_router = require('./trade_strategy.js');
const order_router = require('./order_gateway.js');
const market_router = require('./market_gateway.js');
const log_router = require('./log.js');
const history_router = require('./history_data.js');
const backtest_router = require('./backtest.js');
const trade_point_router = require('./trade_point.js');
const download_plan_router = require('./download_plan.js');
const pick_strategy_router = require('./pick_stock.js');
const system_setup_router = require('./system_setup.js');
const Check = require('../middlewares/check');
const Account = require('../controller/admin/acount');
const script_file_router = require('./script_file.js');


function web_router(app) {


    //公共入口，做页面超时检查
    app.use('*', Check.checkAdminStatus);


    //渠道相关
     app.use('/api/admin', admin_router);

     //任务功能
     app.use('/api/task', task_router);

     //风控管理功能
     app.use('/api/riskctrl', riskctrl_router);

     //策略管理功能
     app.use('/api/strategy', strategy_router);

     //交易接口管理功能
     app.use('/api/order', order_router);

    //行情接口管理功能
    app.use('/api/market', market_router);

    //行情接口管理功能
    app.use('/api/log', log_router);

    //行情接口管理功能
    app.use('/api/history', history_router);

    //回测接口管理功能
    app.use('/api/backtest', backtest_router);

    //交易点管理
    app.use('/api/trade/point', trade_point_router);

    //下载计划路由
    app.use('/api/download/plan', download_plan_router);

    //选股策略路由
    //app.use('/api/pick/stock', pick_strategy_router);
    app.use('/api/script', script_file_router);

    //系统设置路由
    app.use('/api/system/setup', system_setup_router);
}


//导出模块
module.exports = web_router;
