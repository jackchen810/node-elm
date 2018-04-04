'use strict';

const mongoose = require('mongoose');


const taskPlanSchema = new mongoose.Schema({

    task_id: String,    //任务名
    task_type: String,  //任务类型，trade:交易型任务, order_point：买卖点任务，backtest:回测任务， pickstock：选股任务
    task_status:String,  // 运行状态， stop，未运行；running，运行

    task_script:String,   //任务脚本
    task_exce_time:String,  // 任务计划执行时间
    crontab_string:String,  // 任务crontab字符串

    create_at:{type: String, default: null},
    sort_time:Number, //排序时间戳， string无法排序

});

const TaskPlanTable = mongoose.model('TaskPlanTable', taskPlanSchema);
module.exports = TaskPlanTable;