'use strict';

import mongoose from 'mongoose';


const historySchema = new mongoose.Schema({
    symbol: String,    //股票代码
    name:String,    //名称

    open:String,    //开盘价
    high:String,    //最高价
    low:String,    //最低价
    close:String,  //收盘价

    //trade:String,    //现价
    volume:String,    //成交量

    price_change:String,    //价格变动
    p_change:String,    //涨跌幅

    ma5:String,    //5日均价
    ma10:String,    //10日均价
    ma20:String,    //20日均价

    v_ma5:String,    //5日均量
    v_ma10:String,    //10日均量
    v_ma20:String,    //20日均量

    date: String,
    time: String,
    sort_time:Number, //排序时间戳， string无法排序
    //create_date: { type: Date, default: Date.now },

});

const HistoryTable = mongoose.model('HistoryTable', historySchema);

const DayTable = mongoose.model('DayTable', historySchema);
const WeekTable = mongoose.model('WeekTable', historySchema);
const MonthTable = mongoose.model('MonthTable', historySchema);

const Min5Table = mongoose.model('Min5Table', historySchema);
const Min15Table = mongoose.model('Min15Table', historySchema);
const Min30Table = mongoose.model('Min30Table', historySchema);
const Min60Table = mongoose.model('Min60Table', historySchema);
export {HistoryTable, DayTable, WeekTable, MonthTable, Min5Table, Min15Table, Min30Table, Min60Table};