'use strict';

//log要继承基类
module.exports = function tradeLog(log_type, log_level, msgstr){
    console.log('[worker] send log:', log_type, log_level, msgstr);
    var res = {
        'head': {'type': 'log', 'action': 'db'},
        'body': {'log_type': log_type, 'log_level': log_level, 'comment': msgstr},
    }
    process.send(res);
    return;
}




