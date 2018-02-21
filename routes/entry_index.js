'use strict';


import admin_router from './admin.js'
import task_router from './task.js'
import riskctrl_router from './riskctrl.js'
import strategy_router from './strategy.js'
import gateway_router from './gateway.js'


function web_router(app) {
     //渠道相关
     app.use('/admin', admin_router);

     //任务功能
     app.use('/task', task_router);

     //风控管理功能
     app.use('/riskctrl', riskctrl_router);

     //策略管理功能
     app.use('/strategy', strategy_router);

     //gateway管理功能
     app.use('/gateway', gateway_router);

}


//导出模块
export default web_router;
