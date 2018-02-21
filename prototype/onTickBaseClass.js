'use strict';

module.exports = class BaseTickData {
    constructor(){
         // 代码相关
        this.symbol = '';              // 合约代码
        this.exchange = '';            // 交易所代码
        this.vtSymbol = '';            // 合约在vt系统中的唯一代码，通常是 合约代码.交易所代码

        // 成交数据
        this.lastPrice = '';            // 最新成交价
        this.lastVolume = '';             // 最新成交量
        this.volume = '';                 // 今天总成交量
        this.openInterest = '';           // 持仓量
        this.time = '';                // 时间 11:20:56.5
        this.date = '';                // 日期 20151009
        this.datetime = '';                    // python的datetime时间对象

        // 常规行情
        this.openPrice = '';            // 今日开盘价
        this.highPrice = '';            // 今日最高价
        this.lowPrice = '';             // 今日最低价
        this.preClosePrice = '';

        this.upperLimit = '';           // 涨停价
        this.lowerLimit = '';           // 跌停价

        // 五档行情
        this.bidPrice1 = '';
        this.bidPrice2 = '';
        this.bidPrice3 = '';
        this.bidPrice4 = '';
        this.bidPrice5 = '';

        this.askPrice1 = '';
        this.askPrice2 = '';
        this.askPrice3 = '';
        this.askPrice4 = '';
        this.askPrice5 = '';

        this.bidVolume1 = '';
        this.bidVolume2 = '';
        this.bidVolume3 = '';
        this.bidVolume4 = '';
        this.bidVolume5 = '';

        this.askVolume1 = '';
        this.askVolume2 = '';
        this.askVolume3 = '';
        this.askVolume4 = '';
        this.askVolume5 = '';
        console.log('TickData');

        //监听事件some_event
        //emitter.on('onTick', this.onTick);
    }
}
