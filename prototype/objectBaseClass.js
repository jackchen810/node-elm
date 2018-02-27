'use strict';

class BaseObjectData {
    constructor() {

    }

    //获取 tick 数据对象
    async get_tick_object() {
        var tickObj = {
            symbol: '',          // 标的代码
            name : '',           // 标的名称

            price: '',           // 当前价格

            date: '',            // bar开始的时间，日期
            time: '',            // 时间

            volume: '',             // 成交量
            openInterest: '',       // 持仓量
        }

        return tickObj;
    }

    //获取 bar 数据对象
    async get_bar_object() {

        var barObj = {
            symbol: '',          // 标的代码
            name : '',           // 标的名称

            open: '',             // k 线柱体 开盘价
            high: '',             // k 线柱体 最高价
            low: '',              // k 线柱体 最低价
            close: '',           // k 线柱体 收盘价

            price: '',           // 当前价格

            date: '',            // bar开始的时间，日期
            time: '',            // 时间

            volume: '',             // 成交量
            openInterest: '',       // 持仓量
        }

        return barObj;

    }
}

module.exports = new BaseObjectData();