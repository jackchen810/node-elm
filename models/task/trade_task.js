'use strict'

const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
    task_id: String,
    task_type: String,  //任务类型，trade:交易型任务, order_point：买卖点任务， picker：选股任务
    task_status:String,  // 运行状态

    //输入
    trade_symbol: String,  // 数据标的
    trade_ktype: String,  // 数据触发条件，5,15：等k线类型；order_point：交易点
    symbol_name: String,  //标的名称

    //
    strategy_type: String,  //策略类型， 1：简单策略，2：多级别分析策略， 3：综合分析策略， 4：选股策略
    market_gateway: String,  //行情接口名称
    strategy_name: String,  //策略名称
    riskctrl_name: String,  //风控名称
    order_gateway: String,  //交易网关名称
    create_at:{type: String, default: null},
    sort_time:Number, //排序时间戳， string无法排序
});



const TaskTable = mongoose.model('TaskTable', taskSchema);
module.exports = TaskTable;