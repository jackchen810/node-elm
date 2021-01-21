'use strict';

const express = require('express');
const TaskHandle = require('../controller/task/trade_simulate_backtest_task.js');
const BackTestHandle = require('../controller/backtest/back_test.js');


const router = express.Router();


console.log("enter route of backtest");

//任务列表
router.all('/list', TaskHandle.task_list);
router.all('/list/length', TaskHandle.task_list_length);

//新建任务
router.all('/add', TaskHandle.task_add);

//删除任务
router.all('/del', TaskHandle.task_del);

//开始任务
router.all('/start', TaskHandle.start);

//停止任务
router.all('/stop', TaskHandle.stop);

//任务状态
router.all('/task/status', TaskHandle.task_status);



//回测结果
router.all('/result', BackTestHandle.result_list);
router.all('/result/length', BackTestHandle.result_list_length);


module.exports = router;