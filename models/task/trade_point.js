'use strict';

const mongoose = require('mongoose');
const tradePointSchema = new mongoose.Schema({
    task_id: String,  //任务id
    task_type: String,  //任务类型// 自动交易：'trade'; 机器人模拟交易：'simulate'; 交易回测：'gateway'
    trade_symbol: String,  //股票代码
    trade_ktype: String,  //股票ktype
    trade_symbol_name: String,  //标的名称
    strategy_name: String,  //策略名称

    order_position: String,  //交易方向
    order_point_at: String,   //买卖点时间
    order_reset_at: String,  //买卖点恢复时间


    trade_price: String,  //交易价格
    trade_amount: String,  //交易数量
    profit_rate: String,  //收益率
    max_retracement: String,  //最大回撤率

    create_at:{type: String, default: null},
    sort_time:Number, //排序时间戳， string无法排序
});



const TradePointTable = mongoose.model('TradePointTable', tradePointSchema);
module.exports = TradePointTable;