'use strict';

const express = require('express');
const TaskHandle = require('../controller/task/task.js');


const router = express.Router();


console.log("enter route of task");



//获取任务列表
router.all('/list', TaskHandle.list);

//新建任务（固件升级，插件升级，脚本执行）
router.all('/add', TaskHandle.add);

//删除任务
router.all('/del', TaskHandle.del);

//开始任务
router.all('/start', TaskHandle.start);

//停止任务
router.all('/stop', TaskHandle.stop);

module.exports = router;