'use strict';

const express = require('express');
const DownloadPlanHandle = require('../controller/download/download_plan.js');


const router = express.Router();


console.log("enter route of download plan");


//获取下载任务文件列表
router.all('/file/list', DownloadPlanHandle.file_list);

//获取计划任务列表
router.all('/list', DownloadPlanHandle.plan_list);


//计划任务更新
router.all('/update', DownloadPlanHandle.add);

router.all('/add', DownloadPlanHandle.add);

router.all('/del', DownloadPlanHandle.del);

router.all('/start', DownloadPlanHandle.start);

router.all('/stop', DownloadPlanHandle.stop);


module.exports = router

