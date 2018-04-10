'use strict';

const mongoose = require('mongoose');
const db = require('../../mongodb/db.js');


//tushare 中数据库字段兼容
const historySchema = new mongoose.Schema({
    code: String,    //股票代码
    name:String,    //名称

    open:String,    //开盘价
    high:String,    //最高价
    low:String,    //最低价
    close:String,  //收盘价

    //trade:String,    //现价
    volume:String,    //成交量

    date: String,
    time: String,
});


module.exports = function KTable(ktype, table) {
    if (ktype == '5') {
        return db.db_minute5.model(table, historySchema);
    }
    else if (ktype == '15') {
        return db.db_minute15.model(table, historySchema);
    }
    else if (ktype == '30') {
        return db.db_minute30.model(table, historySchema);
    }
    else if (ktype == '60') {
        return db.db_minute60.model(table, historySchema);
    }
    else if (ktype == 'day') {
        return db.db_day.model(table, historySchema);
    }
}
