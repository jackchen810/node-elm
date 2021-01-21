'use strict';

const express = require('express');
const ScriptFileHandle = require('../controller/files/script_file.js');

const router = express.Router();


console.log("enter route of trade strategy");



//获取策略列表
router.all('/list', ScriptFileHandle.file_list);

module.exports = router;