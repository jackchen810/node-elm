'use strict';

const express = require('express');
const MarketGatewayHandle = require('../controller/gateway/market_gateway.js');
const OrderGatewayHandle = require('../controller/gateway/order_gateway');


const router = express.Router();


console.log("enter route of task");



//获取行情列表
router.all('/list', MarketGatewayHandle.list);

//绑定行情列表
router.all('/bind', MarketGatewayHandle.bind);


//绑定行情列表
router.all('/get/bindobj', MarketGatewayHandle.get_bindobj);

module.exports = router