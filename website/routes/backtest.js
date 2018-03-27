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

//停止任务
router.all('/result', BacktestHandle.result_list);

module.exports = router