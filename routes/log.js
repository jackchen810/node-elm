'use strict';

import express from 'express'
import LogHandle from '../controller/log/log.js'


const router = express.Router();


console.log("enter route of log");



//获取任务列表
router.all('/list', LogHandle.list);

export default router