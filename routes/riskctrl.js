'use strict';

import express from 'express'
import RiskctrlHandle from '../controller/riskctrl/riskctrl.js'


const router = express.Router();


console.log("enter route of task");



//获取风控列表
router.all('/list', RiskctrlHandle.list);



export default router