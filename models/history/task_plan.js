'use strict';

import mongoose from 'mongoose';


const taskPlanSchema = new mongoose.Schema({
    task_script:String,   //任务脚本
    task_name: String,    //任务名
    task_status:String,  // 运行状态

    create_at:{type: String, default: null},
    sort_time:Number, //排序时间戳， string无法排序

});

const TaskPlanTable = mongoose.model('TaskPlanTable', taskPlanSchema);
export {TaskPlanTable};