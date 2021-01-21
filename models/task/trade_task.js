'use strict';

const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
    task_id: String,
    task_type: String,  //任务类型，//任务类型，trade:交易型任务, simulate：机器人模拟交易，backtest:回测任务
    task_status:String,  // 运行状态
    user_account:String,  // 任务所属用户

    //交易标的，交易数量
    trade_symbol: String,  // 交易标的
    trade_symbol_name: String,  // 交易标的名称
    trade_amount: String,  //交易数量

    //策略类型， 1：简单策略，2：多级别分析策略， 3：综合分析策略， 4：选股策略
    strategy_type: String,   //策略类型
    strategy_list: Array,   //策略列表；数组

    //strategy_name: String,  //策略名称
    market_gateway: String,  //行情接口名称，//trade， simulate，该字段有效
    riskctrl_name: String,  //风控名称， //trade， simulate，该字段有效
    order_gateway: String,  //交易网关名称，//trade， simulate，该字段有效

    bt_start_time: String,  //开始时间，回测任务使用，//backtest， 该字段有效
    bt_end_time: String,  //结束时间，回测任务使用，//backtest， 该字段有效

    create_at:{type: String, default: null},
    sort_time:Number, //排序时间戳， string无法排序
});



const TaskTable = mongoose.model('SysTaskTable', taskSchema);
module.exports = TaskTable;