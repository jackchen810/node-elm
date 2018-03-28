'use strict';

const express = require('express');
const TaskHandle = require('../controller/task/task.js');
const TradePointHandle = require('../controller/task/trade_point.js');


const router = express.Router();


console.log("enter route of task");



//获取任务列表
router.all('/list', TaskHandle.list);

//新建任务（固件升级，插件升级，脚本执行）
router.all('/add', TaskHandle.add);

//删除任务
router.all('/del', TaskHandle.del);

//开始任务
router.all('/start', TaskHandle.start);

//停止任务
router.all('/stop', TaskHandle.stop);



//交易点统计列表
router.all('/trade/point/list', TradePointHandle.trade_point_list);
router.all('/trade/point/list/length', TradePointHandle.trade_point_list_length);



module.exports = router;