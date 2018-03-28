'use strict';

const express = require('express');
const TradePointHandle = require('../controller/task/trade_point.js');


const router = express.Router();


console.log("enter route of trade point");


//交易点统计列表
router.all('/list', TradePointHandle.trade_point_list);
router.all('/list/length', TradePointHandle.trade_point_list_length);



module.exports = router;