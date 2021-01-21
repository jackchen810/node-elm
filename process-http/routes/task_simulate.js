'use strict';

const express = require('express');
const TaskHandle = require('../controller/task/trade_simulate_backtest_task.js');


const router = express.Router();


console.log("enter route of simulate");



//获取任务列表
router.all('/task/add', TaskHandle.task_add);
router.all('/task/del', TaskHandle.task_del);

module.exports = router;