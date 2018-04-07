'use strict';

const express = require('express');
const TaskHandle = require('../controller/task/trade_task.js');
const TradePointHandle = require('../controller/task/trade_point.js');


const router = express.Router();


console.log("enter route of task");



//获取任务列表
router.all('/list', TaskHandle.task_list);
router.all('/list/length', TaskHandle.task_list_length);

//新建任务（固件升级，插件升级，脚本执行）
router.all('/add', TaskHandle.add);

//删除任务
router.all('/del', TaskHandle.del);

//开始任务
router.all('/start', TaskHandle.start);

//停止任务
router.all('/stop', TaskHandle.stop);





module.exports = router;