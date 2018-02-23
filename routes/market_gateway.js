'use strict';

import express from 'express'
import MarketGatewayHandle from '../controller/market/market_gateway.js'
import OrderGatewayHandle from "../controller/order/order_gateway";


const router = express.Router();


console.log("enter route of task");



//获取行情列表
router.all('/list', MarketGatewayHandle.list);

//绑定行情列表
router.all('/bind', MarketGatewayHandle.bind);


//绑定行情列表
router.all('/bindobj', MarketGatewayHandle.bindobj);

export default router