'use strict';

const express = require('express');
const BacktestHandle = require('../controller/backtest/backtest.js');


const router = express.Router();


console.log("enter route of backtest");

//任务列表
router.all('/list', BacktestHandle.list);

//新建任务
router.all('/add', BacktestHandle.add);

//删除任务
router.all('/del', BacktestHandle.del);

//开始任务
router.all('/start', BacktestHandle.start);

//停止任务
router.all('/stop', BacktestHandle.stop);

//回测结果
router.all('/result', BacktestHandle.result_list);
router.all('/result/length', BacktestHandle.result_list_length);

//任务状态
router.all('/task/status', BacktestHandle.task_status);

module.exports = router