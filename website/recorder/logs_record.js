'use strict';
const DB = require('../../models/models.js');
const WebsiteRxTx = require('../website_rx.js');
const dtime = require('time-formater');

WebsiteRxTx.addLoopListener('log_record', function(action, body) {
    console.log('website->log, body', body);
    var mytime = new Date();

    var updatestr = {
        'log_type': action,
        'log_level': '0',
        'comment': JSON.stringify(body),
        'create_at':dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
        'sort_time':mytime.getTime()
    };

    DB.LogTable.create(updatestr);
});
