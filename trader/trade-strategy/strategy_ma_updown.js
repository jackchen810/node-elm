'use strict';
const BaseStrategy = require("../../prototype/strategyBaseClass");
// load the module and display its version
const talib = require('talib/build/Release/talib');


//策略要继承基类
module.exports = class StrategyMAClass extends BaseStrategy {
    constructor(){
        super();
        this.decimal = this.decimal.bind(this);
        this.on_bar = this.on_bar.bind(this);
        this.mybar = [];
        console.log('StrategyMacdClass constructor');
    }

    async on_tick(tickObj) {
        console.log('StrategyMacdClass on_tick, task_id:', this.task_id);
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
        console.log('Strategy MA on_bar, task_id:', this.task_id);
        console.log('Strategy MA on_bar, msg:', JSON.stringify(barObj));

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

        await talib.execute({
            name: "MA",
            startIdx: 0,
            endIdx: close.length - 1,
            inReal: close,
            optInTimePeriod : 30,
            optInMAType : 0,
        }, function (err, result) {
            //console.log("result Function err:", err);
            var nbElement = result['nbElement'];
            var ma30List = result['result']['outReal'];

            console.log("result length:", ma30List.length, nbElement, barObj['date']);

            //var dif = this.decimal(difList[nbElement-1], 2);
            var ma30 = Math.round(ma30List[nbElement-1]*100)/100;

            console.log("Results, ma30:", ma30);
        });

        console.log("Results, 111111111111:");


        this.to_buy(ktype, buyObj);

    }


    async on_buy_point(ktype, msgObj) {
        console.log('StrategyMacdClass on_buy_point, task_id:', this.task_id);
        console.log('StrategyMacdClass on_buy_point, msg:', JSON.stringify(msgObj));
        this.log('strategy', 1, JSON.stringify(msgObj));

    }

}
console.log('create worker StrategyMacdClass');



