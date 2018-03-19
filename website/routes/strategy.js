'use strict';

import express from 'express'
import StrategyHandle from '../controller/starategy/starategy.js'
import Check from '../middlewares/check'

const router = express.Router();


console.log("enter route of task");



//获取策略列表
router.all('/list', StrategyHandle.list);



//将发行固件上传到平台, form表单需要的中间件处理
//app.use(mutipart({uploadDir:'./linshi'}));
router.all('/upload', Check.checkSuperAdmin, StrategyHandle.upload);

//下载固件
router.all('/download', StrategyHandle.download);

//删除固件
router.all('/del', Check.checkSuperAdmin, StrategyHandle.del);


//固件上传成功后，该固件需上架才能推送
router.all('/release', Check.checkSuperAdmin, StrategyHandle.release);


//下架固件，该固件变得不可推送升级。
router.all('/revoke', Check.checkSuperAdmin, StrategyHandle.revoke);


export default router