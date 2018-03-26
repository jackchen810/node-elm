'use strict';
const BaseStrategy = require("../../prototype/strategyBaseClass");
// load the module and display its version
const talib = require('talib/build/Release/talib');

var async = require('async');


//策略要继承基类
module.exports = class StrategyMacdClass extends BaseStrategy {
    constructor(){
        super();
        this.decimal = this.decimal.bind(this);
        this.on_bar = this.on_bar.bind(this);
        this.mybar = [];
        console.log('StrategyMacdClass constructor');
    }

    async on_tick(tickObj) {
        console.log('StrategyMacdClass on_tick, task_id:', this.task_id, tickObj);
        console.log('StrategyMacdClass on_tick, msg:', tickObj);

        var buyObj = {
            'code': tickObj['code'],
            'ktype': tickObj['ktype'],
            'price': '12.8',
            'volume': '24',
        }

        this.to_buy('tick', buyObj);

    }

    async on_bar(ktype, barObj) {
        console.log('StrategyMacdClass on_bar, task_id:', this.task_id, JSON.stringify(barObj));
        //console.log('StrategyMacdClass on_bar, msg:', JSON.stringify(barObj));

        var buyObj = {
            'code': barObj['code'],
            'ktype': ktype,
            'price': barObj['price'],
            'volume': barObj['volume'],
        }

        this.mybar.push(barObj);

        //移除第一个元素，末尾加入一个
        if (this.mybar.length > 100) {
            this.mybar.shift();
        }

        //var open, high, low, close = this.mybar.map((obj) => {return obj['open'], obj['high'], obj['low'], obj['close']});
        var close = this.mybar.map((obj) => {return obj['close']});
        console.log(close.length);


        talib.execute({
            name: "MACD",
            startIdx: 0,
            endIdx: close.length - 1,
            inReal: close,
            optInFastPeriod : 12,
            optInSlowPeriod : 26,
            optInSignalPeriod : 9,
        }, function (err, result) {
            //console.log("result Function err:", err);
            //macd, macdsignal, macdhist
            //dif, dea, macd = ta.MACD
            //MACD(蓝线): 计算12天平均和26天平均的差
            //Signal (红线): 计算macd9天均值
            //Histogram (柱): 计算macd与signal的差值
            //返回值：注意有些地方的macdhist = 2(dif-dea)，但是talib中MACD的计算是macdhist = dif-dea
            var nbElement = result['nbElement'];
            var difList = result['result']['outMACD'];
            var deaList = result['result']['outMACDSignal'];
            var macdList = result['result']['outMACDHist'];
            console.log("result length:", difList.length, deaList.length, macdList.length, nbElement, barObj['date']);

            //var dif = this.decimal(difList[nbElement-1], 2);
            var dif = Math.round(difList[nbElement-1]*100)/100;
            var dea = Math.round(deaList[nbElement-1]*100)/100;
            var macd =  Math.round(macdList[nbElement-1]*200)/100;  //2(dif-dea)

            console.log("Results, dif:", dif, 'dea:', dea, 'macd:', macd);
        });

        if (macd == 0 && dif > 0 && dea > 0) {
            this.to_buy(ktype, buyObj);
        }

    }


    async on_buy_point(ktype, msgObj) {
        console.log('StrategyMacdClass on_buy_point, task_id:', this.task_id);
        console.log('StrategyMacdClass on_buy_point, msg:', JSON.stringify(msgObj));
        this.log('strategy', 1, JSON.stringify(msgObj));

    }

}
console.log('create worker StrategyMacdClass');




