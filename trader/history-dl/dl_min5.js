'use strict';
import DB from "../../models/models.js";
import dtime from "time-formater";

const HistoryDataBaseClass_ifeng = require("../../prototype/historyDataBaseClass_ifeng");

//DAY_PRICE_COLS = ['date', 'open', 'high', 'close', 'low', 'volume',    'chg', '%chg', 'ma5', 'ma10', 'ma20',      'vma5', 'vma10', 'vma20', 'turnover']
const ktype = '5';

async function updateDatabase(data_s, symbol) {

    var barList = await data_s.to_download(ktype, 'fq', symbol);

    //更新到设备数据库
    for (var i = 0; i < barList.length; i++) {
        var wherestr = {'symbol': symbol, 'date': barList[i]['date']};
        var query = await DB.KHistory(ktype, symbol).findOne(wherestr).exec();
        if (query == null) {
            await DB.KHistory(ktype, symbol).create(barList[i]);
        }
    }
}

module.exports = async function callback() {
    console.log('HistoryDataBaseClass_ifeng, ktype', ktype);
    var data_s = new HistoryDataBaseClass_ifeng();

    var queryList = await DB.BasicsTable.find().exec();
    for (var i = 0; i < queryList.length; i++){
        updateDatabase(data_s, queryList[i]['code']);
    }
}