'use strict';

import mongoose from 'mongoose';
const taskSchema = new mongoose.Schema({
    task_id: String,
    task_status:String,
    stock_name: String,
    stock_code: String,
    obj_amount: String,
    strategy_name: String,
    riskctrl_name: String,
    gateway_name: String,
    create_at:{type: String, default: null},
});



const TaskTable = mongoose.model('TaskTable', taskSchema);
export {TaskTable};