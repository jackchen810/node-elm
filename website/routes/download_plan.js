'use strict';

const express = require('express');
const DownloadPlanHandle = require('../controller/history/download_plan.js');


const router = express.Router();


console.log("enter route of download plan");


//获取下载任务文件列表
router.all('/file/list', DownloadPlanHandle.filelist);

//获取计划任务列表
router.all('/list', DownloadPlanHandle.planlist);


//计划任务更新
router.all('/update', DownloadPlanHandle.planupdate);


module.exports = router

