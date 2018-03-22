'use strict';

const express = require('express');
const BacktestHandle = require('../controller/backtest/backtest.js');


const router = express.Router();


console.log("enter route of backtest");


//获取任务列表
router.all('/start', BacktestHandle.start);



module.exports = router