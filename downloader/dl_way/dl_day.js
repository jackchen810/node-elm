'use strict';
const DB = require('../../models/models.js');
const dtime = require('time-formater');
const HistoryDataBaseClass_ifeng = require("../dl_strategy/historyDataBaseClass_ifeng.js");

//DAY_PRICE_COLS = ['date', 'open', 'high', 'close', 'low', 'volume',    'chg', '%chg', 'ma5', 'ma10', 'ma20',      'vma5', 'vma10', 'vma20', 'turnover']


async function updateDatabase(data_s, symbol) {

    var record = await data_s.to_download('day', 'fq', symbol);

    var data = record['record'];
    console.log('to day db', JSON.stringify(data[0]));

    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var time_array = item[0].split(" ");
        //console.log('to item', item);

        //更新到设备数据库
        var wherestr = {'code': symbol, 'date': time_array[0]};
        var updatestr = {
            'code': symbol,

            'date': time_array[0],
            //'time': time_array[1],

            'open': item[1],
            'high': item[2],
            'close': item[3],
            'low': item[4],
            'volume': item[5],
        };

        //参数检查
        //console.log('find day db', wherestr);
        await DB.KHistory('day', symbol).update(wherestr, updatestr, { upsert : true }).exec();
    }

}

module.exports = async function callback() {
    console.log('new day HistoryDataBaseClass_ifeng');
    var data_s = new HistoryDataBaseClass_ifeng();

    var queryList = await DB.BasicsTable.find().exec();

    for (var i = 0; i < queryList.length; i++){
        await updateDatabase(data_s, queryList[i]['code']);
    }
}