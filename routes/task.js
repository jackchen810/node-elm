'use strict';

import express from 'express'
import TaskHandle from '../controller/task/task.js'


const router = express.Router();


console.log("enter route of task");



//获取任务列表
router.all('/list', TaskHandle.list);

//新建任务（固件升级，插件升级，脚本执行）
//router.all('/add', TaskHandle.add);

//查看升级过程状态
router.all('/status', TaskHandle.status);

//恢复冻结任务
router.all('/restore', TaskHandle.restore);


export default router