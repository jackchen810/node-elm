'use strict';
const DB = require('../../models/models.js');
const WebsiteRxTx = require('../website_rxtx.js');
const dtime = require('time-formater');



WebsiteRxTx.addLoopListener('trade_record', function (action, body) {
    console.log('website->trade_record, body', body);
    var mytime = new Date();

    var updatestr = {
        'trade_symbol': body['code'],
        'trade_ktype': body['ktype'],
        'order_type': action,
        //'symbol_name': body['comment'],
        'order_point_at': dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
        'order_point_time': mytime.getTime(),
        'create_at':dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
        'sort_time':mytime.getTime()
    };

    DB.OrderPointTable.create(updatestr);
});
