'use strict';

const express = require('express');
const OrderGatewayHandle = require('../controller/order/order_gateway.js');


const router = express.Router();


console.log("enter route of task");



//获取行情列表
router.all('/list', OrderGatewayHandle.list);

//获取行情列表
router.all('/add', OrderGatewayHandle.add);




module.exports = router