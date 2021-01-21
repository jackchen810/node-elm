'use strict';

const express = require('express');
const ScriptFileHandle = require('../controller/files/script_file.js');


const router = express.Router();


console.log("enter route of market");


//获取行情列表
router.all('/list', ScriptFileHandle.file_list);


module.exports = router;