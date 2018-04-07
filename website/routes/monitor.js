'use strict';

const express = require('express');
const MonitorHandle = require('../controller/monitor/monitor.js');


const router = express.Router();


console.log("enter route of monitor");



//获取任务列表
router.all('/task/add', MonitorHandle.add);
router.all('/task/del', MonitorHandle.del);

module.exports = router