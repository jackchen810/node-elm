'use strict';

import express from 'express'
import GatewayHandle from '../controller/gateway/gateway.js'


const router = express.Router();


console.log("enter route of task");



//获取风控列表
router.all('/list', GatewayHandle.list);



export default router