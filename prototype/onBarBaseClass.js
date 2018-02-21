'use strict';


module.exports = class BaseBarData {
    constructor(){

        this.symbol = '';          // 代码
        //this.exchange = '';        // 交易所

        this.open = '';             // OHLC
        this.high = '';
        this.low = '';
        this.close = '';

        this.date = '';            // bar开始的时间，日期
        this.time = '';            // 时间
        this.datetime = '';                // python的datetime时间对象

        this.volume = '';             // 成交量
        this.openInterest = '';       // 持仓量

    }

}
