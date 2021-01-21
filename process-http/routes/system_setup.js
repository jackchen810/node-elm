'use strict';

const express = require('express');
const SystemSetupHandle = require('../controller/config/system_setup.js');


const router = express.Router();


console.log("enter route of system setup");



//获取行情列表
router.all('/list', SystemSetupHandle.system_setup_list);

//更新行情列表
router.all('/update', SystemSetupHandle.system_setup_update);



module.exports = router