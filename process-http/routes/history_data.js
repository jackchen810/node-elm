'use strict';

const express = require('express');
const HistoryHandle = require('../controller/download/history_data.js');


const router = express.Router();


console.log("enter route of download");


//获取历史数据
//router.all('/data', HistoryHandle.history_data);
router.all('/list', HistoryHandle.history_list);
router.all('/list/length', HistoryHandle.history_list_length);

module.exports = router;

