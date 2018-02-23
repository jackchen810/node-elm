'use strict';

import express from 'express'
import OrderGatewayHandle from '../controller/order/order_gateway.js'


const router = express.Router();


console.log("enter route of task");



//获取行情列表
router.all('/list', OrderGatewayHandle.list);

//获取行情列表
router.all('/add', OrderGatewayHandle.add);




export default router