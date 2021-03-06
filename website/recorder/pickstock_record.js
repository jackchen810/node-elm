'use strict';
const DB = require('../../models/models.js');
const WebsiteRxTx = require('../website_rx.js');
const dtime = require('time-formater');



WebsiteRxTx.addLoopListener('pickstock.status', function(action, body) {
    console.log('website->pickstock.status, body', body);

    var wherestr = {'task_id': body['task_id']};
    var updatestr = {'task_status': action};
    DB.PickTaskTable.update(wherestr, updatestr).exec();
    return;


});


WebsiteRxTx.addLoopListener('pickstock.record', function(action, body) {
    console.log('website->pickstock.record, body', body);
    var mytime = new Date();

    var updatestr = {
        'task_id': body['task_id'],
        'stock_symbol': body['trade_symbol'],
        'symbol_name': body['symbol_name'],
        'trade_ktype': body['trade_ktype'],

        'create_at':dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
        'sort_time':mytime.getTime()
    };

    DB.PickResultTable.create(updatestr);
});
