'use strict';

const express = require('express');
const PickStockHandle = require('../controller/pickstock/pick_stock.js');
const PickStockResultHandle = require('../controller/pickstock/pick_stock_result.js');
const PickStockStrategyHandle = require('../controller/pickstock/pick_stock_strategy.js');


const router = express.Router();


console.log("enter route of pick stock");


//交易点统计列表

router.all('/task/list', PickStockHandle.task_list);
router.all('/task/list/length', PickStockHandle.task_list_length);
router.all('/task/status', PickStockHandle.task_status);

router.all('/add', PickStockHandle.add);

router.all('/del', PickStockHandle.del);

router.all('/start', PickStockHandle.start);

router.all('/stop', PickStockHandle.stop);

//选股结果
router.all('/result', PickStockResultHandle.result_list);
router.all('/result/length', PickStockResultHandle.result_list_length);


router.all('/strategy/list', PickStockStrategyHandle.strategy_list);
router.all('/strategy/upload', PickStockStrategyHandle.upload);
router.all('/strategy/download', PickStockStrategyHandle.download);
router.all('/strategy/del', PickStockStrategyHandle.del);
router.all('/strategy/release', PickStockStrategyHandle.release);
router.all('/strategy/revoke', PickStockStrategyHandle.revoke);

//router.all('/list/length', PickStockHandle.trade_point_list_length);



module.exports = router;