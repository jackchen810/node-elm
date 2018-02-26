'use strict';
import DB from "../../models/models.js";
import dtime from "time-formater";

const HistoryDataBaseClass_ifeng = require("../../prototype/historyDataBaseClass_ifeng");

//DAY_PRICE_COLS = ['date', 'open', 'high', 'close', 'low', 'volume',    'chg', '%chg', 'ma5', 'ma10', 'ma20',      'vma5', 'vma10', 'vma20', 'turnover']


async function updateDatabase(data_s, symbol) {

    var record = await data_s.download('5', 'fq', symbol);
    var data = record['record'];
    console.log('to min5 db', data[0]);

    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var time_array = item[0].split(" ");
        //console.log('to item', item);

        //更新到设备数据库
        var wherestr = {'symbol': symbol, 'date': time_array[0], 'time': time_array[1]};
        var updatestr = {
            'symbol': symbol,
            'name': '',

            'date': time_array[0],
            'time': time_array[1],

            'open': item[1],
            'high': item[2],
            'close': item[3],
            'low': item[4],

            'volume': item[5],
            'price_change': item[6],
            'p_change': item[7],

            'ma5': item[8],
            'ma10': item[9],
            'ma15': item[10],

            'v_ma5': item[11],
            'v_ma10': item[12],
            'v_ma20': item[13],
        };


        //参数检查
        var query = await DB.Min5Table.findOne(wherestr).exec();
        if (query == null) {
            await DB.Min5Table.create(updatestr);
        }
        else {
            await DB.Min5Table.findByIdAndUpdate(query['_id'], updatestr).exec();
        }
    }
}

module.exports = async function callback() {
    console.log('new min5 HistoryDataBaseClass_ifeng');
    var data_s = new HistoryDataBaseClass_ifeng();

    for (var i = 0; i < 1; i++){
        updateDatabase(data_s, '002500');
    }
}