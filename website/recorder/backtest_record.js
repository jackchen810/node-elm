'use strict';
const DB = require('../../models/models.js');
const WebsiteRxTx = require('../website_rx.js');
const dtime = require('time-formater');


WebsiteRxTx.addLoopListener('backtest_record', function(action, body) {
    console.log('website->backtest_record, body', body);

    if (action == 'finish'){

        var wherestr = {'task_id': body['task_id']};
        var updatestr = {'task_status': 'finish'};
        DB.BacktestTaskTable.update(wherestr, updatestr).exec();
        return;
    }


    var mytime = new Date();

    var updatestr = {
        'task_id': body['task_id'],
        'trade_symbol': body['trade_symbol'],
        'symbol_name': body['symbol_name'],
        'trade_ktype': body['trade_ktype'],
        'order_position': body['order_position'],
        'order_type': action,
        'order_point_at': body['order_point_at'],
        'strategy_name': body['strategy_name'],

        'trade_price': body['price'],
        'trade_amount': body['amount'],

        'create_at':dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
        'sort_time':mytime.getTime()
    };


    DB.BacktestResultTable.create(updatestr);
});
