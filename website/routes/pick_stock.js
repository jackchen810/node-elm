'use strict';

const express = require('express');
const PickStrategyHandle = require('../controller/pickstock/pick_strategy.js');


const router = express.Router();


console.log("enter route of pick stock");


//交易点统计列表
router.all('/list', PickStrategyHandle.list);
//router.all('/list/length', PickStockHandle.trade_point_list_length);



module.exports = router;