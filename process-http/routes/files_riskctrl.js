'use strict';

const express = require('express');
const ScriptFileHandle = require('../controller/files/script_file.js');


const router = express.Router();


console.log("enter route of riskctrl");



//获取风控列表
router.all('/list', ScriptFileHandle.file_list);



module.exports = router;