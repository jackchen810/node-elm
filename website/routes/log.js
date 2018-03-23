'use strict';

const express = require('express');
const LogHandle = require('../controller/log/log.js');


const router = express.Router();


console.log("enter route of log");



//获取任务列表
router.all('/list', LogHandle.list);

module.exports = router