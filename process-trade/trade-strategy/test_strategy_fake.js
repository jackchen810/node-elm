'use strict';
const BaseStrategy = require("../../prototype/strategyBaseClass");
// load the module and display its version
//const talib = require('talib/build/Release/talib');


//策略要继承基类
//这个文件模拟买卖点对系统进行测试
module.exports = class TestClass extends BaseStrategy {
    constructor(strategy_name){
        super(strategy_name);
        //this.decimal = this.decimal.bind(this);
        //this.on_bar = this.on_bar.bind(this);
        this.testObj1 = {
            test_count: 0,
            order:'sell',
        };

        console.log('TestClass constructor');
    }

    async on_tick(tickObj) {
        console.log('TestClass on_tick, tickObj:', JSON.stringify(tickObj));
        //console.log('StrategyMacdClass on_tick, msg:', tickObj);
    }

    async on_bar(ktype, barObj) {
        console.log('TestClass on_bar, barObj:', JSON.stringify(barObj));
        //console.log('StrategyMacdClass on_bar, msg:', JSON.stringify(barObj));
        this.test_backtest_stub(ktype, barObj);
        console.log('TestClass on_bar end');
    }

    async test_backtest_stub(ktype, barObj) {
        console.log('TestClass test_1, barObj:', JSON.stringify(barObj));
        //console.log('StrategyMacdClass on_bar, msg:', JSON.stringify(barObj));
        this.testObj1['test_count']++;
        if (this.testObj1['test_count'] > 5){
            this.testObj1['test_count'] = 0;

            if (this.testObj1['order'] == 'sell'){
                this.to_buy_point();
                this.testObj1['order'] = 'buy';
            }
            else{
                this.to_sell_point();
                this.testObj1['order'] = 'sell';
            }
        }

        console.log('TestClass test_1 end');
    }
};



