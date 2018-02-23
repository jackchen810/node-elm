'use strict';
const BaseStrategy = require("../../prototype/strategyBaseClass");

//策略要继承基类
class StrategyMacdClass extends BaseStrategy {
    constructor(){
        super();
        console.log('constructor');
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


        this.to_buy(ktype, buyObj);

    }

    async on_buy_point(ktype, msgObj) {
        console.log('StrategyMacdClass on_buy_point, task_id:', this.task_id);
        console.log('StrategyMacdClass on_buy_point, msg:', JSON.stringify(msgObj));
        this.log('strategy', 1, JSON.stringify(msgObj));

    }

}
console.log('create worker StrategyMacdClass');

//导出模块
module.exports = new StrategyMacdClass();


