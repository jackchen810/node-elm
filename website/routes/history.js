'use strict';

const express = require('express');
const HistoryHandle = require('../controller/history/history.js');


const router = express.Router();


console.log("enter route of history");


//获取下载任务文件列表
router.all('/download/file/list', HistoryHandle.filelist);

//获取计划任务列表
router.all('/download/plan/list', HistoryHandle.planlist);


//计划任务更新
router.all('/download/plan/update', HistoryHandle.planupdate);


//获取历史数据
router.all('/history/data', HistoryHandle.history_data);

module.exports = router

