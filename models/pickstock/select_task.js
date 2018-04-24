'use strict'

const mongoose = require('mongoose');
const PickstockTaskSchema = new mongoose.Schema({
    task_id: String,
    task_type: String,  //任务类型，trade:交易型任务, order_point：买卖点任务，backtest:回测任务， pickstock：选股任务
    task_status:String,  // 运行状态
    user_account:String,  // 任务所属用户

    //输入
    stock_range: String,  // 数据标的
    stock_ktype: String,  // 数据触发条件，5,15：等k线类型；
    strategy_name: String,  //策略名称

    create_at:{type: String, default: null},
    sort_time:Number, //排序时间戳， string无法排序
});



const PickTaskTable = mongoose.model('PickTaskTable', PickstockTaskSchema);
module.exports = PickTaskTable;