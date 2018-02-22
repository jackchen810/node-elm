'use strict';

import express from 'express'
import MarketGatewayHandle from '../controller/market/market_gateway.js'


const router = express.Router();


console.log("enter route of task");



//获取风控列表
router.all('/list', MarketGatewayHandle.list);



export default router