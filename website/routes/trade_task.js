'use strict';

const express = require('express');
const TaskHandle = require('../controller/task/trade_task.js');
const TradePointHandle = require('../controller/task/trade_point.js');


const router = express.Router();


console.log("enter route of task");



//获取任务列表
router.all('/list', TaskHandle.task_list);
router.all('/list/length', TaskHandle.task_list_length);

//新建任务（任务添加，监控任务批量添加）
router.all('/add', TaskHandle.task_add);
router.all('/add/monitor', TaskHandle.batch_monitor_task_add);

//删除任务
router.all('/del', TaskHandle.del);

//开始任务
router.all('/start', TaskHandle.start);

//停止任务
router.all('/stop', TaskHandle.stop);


router.all('/stats', TaskHandle.task_stats);


module.exports = router;