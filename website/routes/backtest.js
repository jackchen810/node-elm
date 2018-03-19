'use strict';

import express from 'express'
import BacktestHandle from '../controller/backtest/backtest.js'


const router = express.Router();


console.log("enter route of backtest");


//获取任务列表
router.all('/start', BacktestHandle.start);



export default router