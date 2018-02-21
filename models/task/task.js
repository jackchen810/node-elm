'use strict';

import mongoose from 'mongoose';
const taskSchema = new mongoose.Schema({
    task_id: String,
    task_status:String,  // 运行状态
    trade_symbol: String,  //strategy_list[0] 的股票代码
    trade_ktype: String,  //strategy_list[0] 的股票ktype
    symbol_name: String,  //标的名称
    strategy_list: mongoose.Schema.Types.Mixed,   //策略对象列表
    strategy_name: String,  //策略名称
    riskctrl_name: String,  //风控名称
    gateway_name: String,  //交易网关名称
    create_at:{type: String, default: null},
    sort_time:Number, //排序时间戳， string无法排序
});



const TaskTable = mongoose.model('TaskTable', taskSchema);
export {TaskTable};