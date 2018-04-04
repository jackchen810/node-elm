'use strict';
const DB = require('../../models/models.js');
const dtime = require('time-formater');
const HistoryDataBaseClass_ifeng = require("../dl_strategy/historyDataBaseClass_ifeng.js");
const  DownloaderTxHandle = require("../downloader_tx");

//DAY_PRICE_COLS = ['date', 'open', 'high', 'close', 'low', 'volume',    'chg', '%chg', 'ma5', 'ma10', 'ma20',      'vma5', 'vma10', 'vma20', 'turnover']




async function updateDatabase_ktype(data_s, symbol, ktype) {

    var record = await data_s.to_download(ktype, 'fq', symbol);

    var data = record['record'];
    if (typeof(data) === 'undefined'){
        return;
    }

    console.log('to %s db', ktype, JSON.stringify(data[0]));

    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var date = item[0].substr(0, 16);
        //console.log('to date', date);

        //更新到设备数据库
        var wherestr = {'code': symbol, 'date': date};
        var updatestr = {
            'code': symbol,

            'date': date,
            //'time': time_array[1],

            'open': item[1],
            'high': item[2],
            'close': item[3],
            'low': item[4],
            'volume': item[5],
        };
        await DB.KHistory(ktype, symbol).update(wherestr, updatestr, { upsert : true }).exec();
    }
}

async function updateDatabase_day(data_s, symbol, type) {

    var record = await data_s.to_download(type, 'fq', symbol);

    var data = record['record'];
    console.log('to %s db', type, JSON.stringify(data[0]));

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
        await updateDatabase_day(data_s, queryList[i]['code'], 'day');
        await updateDatabase_ktype(data_s, queryList[i]['code'], '5');
        await updateDatabase_ktype(data_s, queryList[i]['code'], '15');
        await updateDatabase_ktype(data_s, queryList[i]['code'], '30');
        await updateDatabase_ktype(data_s, queryList[i]['code'], '60');
    }

    //完成后，直接进行选股操作
    var msgObj = {
        'task_id': 1,
        'task_type': 'pickstock',  //任务结果
        'strategy_name': 'pick_strategy_base_3.js',   // 策略名称

    };
    DownloaderTxHandle.send(msgObj, 'pickstock.task', 'add', 'picker');
}