'use strict';

import express from 'express'
import OrderGatewayHandle from '../controller/order/order_gateway.js'


const router = express.Router();


console.log("enter route of task");



//获取风控列表
router.all('/list', OrderGatewayHandle.list);



export default router