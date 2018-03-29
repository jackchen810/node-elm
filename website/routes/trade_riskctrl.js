'use strict';

const express = require('express');
const RiskctrlHandle = require('../controller/riskctrl/riskctrl.js');


const router = express.Router();


console.log("enter route of task");



//获取风控列表
router.all('/list', RiskctrlHandle.list);



module.exports = router;