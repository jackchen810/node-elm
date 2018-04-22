'use strict';

const express = require('express');
const ScriptFileHandle = require('../controller/files/script_file.js');


const router = express.Router();


console.log("enter route of files");


//交易点统计列表


router.all('/list', ScriptFileHandle.list);
router.all('/upload', ScriptFileHandle.upload);
router.all('/download', ScriptFileHandle.download);
router.all('/del', ScriptFileHandle.del);
router.all('/release', ScriptFileHandle.release);
router.all('/revoke', ScriptFileHandle.revoke);



module.exports = router;