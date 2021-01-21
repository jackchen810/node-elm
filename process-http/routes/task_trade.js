'use strict';
const express = require('express');
const TaskHandle = require('../controller/task/trade_simulate_backtest_task.js');


const router = express.Router();


console.log("enter route of trade task");



//获取任务列表
router.all('/list', TaskHandle.task_list);
router.all('/list/length', TaskHandle.task_list_length);

//新建任务（任务添加，监控任务批量添加）
router.all('/add', TaskHandle.task_add);
//router.all('/add/simulate', TaskHandle.batch_monitor_task_add);

//删除任务
router.all('/del', TaskHandle.task_del);

//开始任务
router.all('/start', TaskHandle.start);

//停止任务
router.all('/stop', TaskHandle.stop);


router.all('/statistic', TaskHandle.task_info_stats);


router.all('/status', TaskHandle.task_status);

//任务类型切换
router.all('/change', TaskHandle.task_type_change);


module.exports = router;