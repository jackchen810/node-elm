'use strict';

import express from 'express'
import HistoryHandle from '../controller/history/history.js'


const router = express.Router();


console.log("enter route of history");


//获取任务列表
router.all('/download/file/list', HistoryHandle.filelist);

//获取任务列表
router.all('/download/plan/list', HistoryHandle.planlist);



router.all('/download/plan/update', HistoryHandle.planupdate);

export default router