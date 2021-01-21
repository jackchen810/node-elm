'use strict';
const BaseStrategy = require("../../prototype/strategyBaseClass");
// load the module and display its version
//const talib = require('talib/build/Release/talib');


//策略要继承基类
//这个文件模拟买卖点对系统进行测试
module.exports = class TestTimerClass extends BaseStrategy {
    constructor(strategy_name){
        super(strategy_name);
        //this.decimal = this.decimal.bind(this);
        //this.on_bar = this.on_bar.bind(this);
        this.testObj1 = {
            test_count: 0,
            order:'sell',
        };

        var timeout_time = this.GetRandomNum(8000-4000);
        this.updateTimer = setTimeout(function(){
            var barObj = {
                symbol:'8888888',
                name:'test',
                close:'1.1',
                open:'1.1',
                high:'1.1',
                low:'1.1',
            };
            this.test_timer_stub(this.ktype, barObj);
        },timeout_time);

        console.log('TestTimerClass constructor');
    }
    async GetRandomNum(Min,Max)
    {
        var Range = Max - Min;
        var Rand = Math.random();
        return(Min + Math.round(Rand * Range));
    }
    async on_tick(tickObj) {
        console.log('TestTimerClass on_tick, tickObj:', JSON.stringify(tickObj));
        //console.log('StrategyMacdClass on_tick, msg:', tickObj);
    }

    async on_bar(ktype, barObj) {
        console.log('TestTimerClass on_bar, barObj:', JSON.stringify(barObj));
        //console.log('StrategyMacdClass on_bar, msg:', JSON.stringify(barObj));
        console.log('TestTimerClass on_bar end');
    }

    async test_timer_stub(ktype, barObj) {
        console.log('TestTimerClass test_1, barObj:', JSON.stringify(barObj));
        //console.log('StrategyMacdClass on_bar, msg:', JSON.stringify(barObj));
        this.testObj1['test_count']++;
        if (this.testObj1['test_count'] > 5){
            if (this.testObj1['order'] == 'sell'){
                this.to_buy_point(this.symbol, ktype, barObj);
                this.testObj1['order'] = 'buy';
            }
            else{
                this.to_sell_point(this.symbol, ktype, barObj);
                this.testObj1['order'] = 'sell';
            }
        }

        console.log('TestTimerClass test_1 end');
    }

};



