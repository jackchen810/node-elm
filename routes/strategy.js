'use strict';

import express from 'express'
import StarategyHandle from '../controller/starategy/starategy.js'


const router = express.Router();


console.log("enter route of task");



//获取策略列表
router.all('/list', StarategyHandle.list);




export default router