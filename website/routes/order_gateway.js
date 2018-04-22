'use strict';

const express = require('express');
const OrderGatewayHandle = require('../controller/gateway/order_gateway.js');


const router = express.Router();


console.log("enter route of task");



//获取行情列表
router.all('/list', OrderGatewayHandle.list);
router.all('/upload', OrderGatewayHandle.upload);
router.all('/download', OrderGatewayHandle.download);
router.all('/del', OrderGatewayHandle.del);
router.all('/release', OrderGatewayHandle.release);
router.all('/revoke', OrderGatewayHandle.revoke);

//获取行情列表
router.all('/add', OrderGatewayHandle.add);




module.exports = router