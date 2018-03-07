'use strict';
const BaseStrategy = require("../../prototype/strategyBaseClass");
// load the module and display its version
const talib = require('talib/build/Release/talib');


//策略要继承基类
module.exports = class StrategyMacdClass extends BaseStrategy {
    constructor(){
        super();
        console.log('StrategyMacdClass constructor');
    }

    async on_tick(msgObj) {
        console.log('StrategyMacdClass on_tick, task_id:', this.task_id);
        console.log('StrategyMacdClass on_tick, msg:', msgObj);

        var buyObj = {
            'symbol': msgObj['symbol'],
            'ktype': msgObj['ktype'],
            'price': '12.8',
            'volume': '24',
        }

        this.to_buy('tick', buyObj);

    }

    async on_bar(ktype, msgObj) {
        console.log('StrategyMacdClass on_bar, task_id:', this.task_id);
        console.log('StrategyMacdClass on_bar, msg:', JSON.stringify(msgObj));

        var buyObj = {
            'symbol': msgObj['symbol'],
            'ktype': ktype,
            'price': msgObj['price'],
            'volume': msgObj['volume'],
        }

        talib.execute({
            name: "MACD",
            startIdx: 0,
            endIdx: marketData.close.length - 1,
            high: marketData.high,
            low: marketData.low,
            close: marketData.close,
            optInTimePeriod: 9
        }, function (err, result) {

            console.log("ADX Function Results:");
            console.log(result);

        });



        this.to_buy(ktype, buyObj);

    }

    async on_buy_point(ktype, msgObj) {
        console.log('StrategyMacdClass on_buy_point, task_id:', this.task_id);
        console.log('StrategyMacdClass on_buy_point, msg:', JSON.stringify(msgObj));
        this.log('strategy', 1, JSON.stringify(msgObj));

    }

}
console.log('create worker StrategyMacdClass');



