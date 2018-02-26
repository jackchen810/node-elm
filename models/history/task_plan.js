'use strict';

import mongoose from 'mongoose';


const taskPlanSchema = new mongoose.Schema({
    task_script:String,   //任务脚本
    task_name: String,    //任务名
    task_status:String,  // 运行状态， stop，未运行；running，运行
    task_exce_time:String,  // 任务计划执行时间
    task_crontab_str:String,  // 任务crontab字符串
    crontab_status:String,  // 任务crontab状态，crontab执行的状态

    create_at:{type: String, default: null},
    sort_time:Number, //排序时间戳， string无法排序

});

const TaskPlanTable = mongoose.model('TaskPlanTable', taskPlanSchema);
export {TaskPlanTable};