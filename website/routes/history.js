'use strict';

const express = require('express');
const HistoryHandle = require('../controller/history/history.js');


const router = express.Router();


console.log("enter route of history");


//获取任务列表
router.all('/download/file/list', HistoryHandle.filelist);

//获取任务列表
router.all('/download/plan/list', HistoryHandle.planlist);



router.all('/download/plan/update', HistoryHandle.planupdate);

module.exports = router