'use strict';


import admin_router from './admin.js'
import task_router from './task.js'
import riskctrl_router from './riskctrl.js'
import strategy_router from './strategy.js'
import order_router from './order_gateway.js'
import market_router from './market_gateway.js'
import log_router from './log.js'
import history_router from './history.js'



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


}


//导出模块
export default web_router;
