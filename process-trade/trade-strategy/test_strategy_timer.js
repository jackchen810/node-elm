'use strict';
const BaseStrategy = require("../../prototype/strategyBaseClass");
// load the module and display its version
//const talib = require('talib/build/Release/talib');


//策略要继承基类
//这个文件模拟买卖点对系统进行测试
///这个测试文件通过定时器发送买卖点测试配套系统的功能。
///这个测试不需要行情数据， 这个是起始测试点
module.exports = class TestTimerClass extends BaseStrategy {
    constructor(strategy_name){
        super(strategy_name);
        //this.decimal = this.decimal.bind(this);
        //this.on_bar = this.on_bar.bind(this);
        this.testObj1 = {
            test_count: 0,
            order:'sell',
        };
        this.count = 0;
        this.ktype = '1';
        //this.test_timer_stub = this.test_timer_stub.bind(this);
        //this.on_init = this.on_init.bind(this);
        this.on_deinit = this.on_deinit.bind(this);


        var timeout_time = this.GetRandomNum(8000, 3000);
        var self = this;
        this.updateTimer = setInterval(function(){
            self.test_timer_simulate_buysell_point(self.ktype, {});
        },timeout_time);

        console.log('TestTimerClass constructor, timer:', timeout_time);
    }

    //销毁函数
    async on_deinit(task_id){

        clearTimeout(this.updateTimer);
        //console.log('111111', ktype);
        return;
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

    GetRandomNum(Min,Max){
        var Range = Max - Min;
        var Rand = Math.random();
        return(Min + Math.round(Rand * Range));
    }
    async test_timer_simulate_buysell_point(ktype, barObj) {
        console.log('test_timer_simulate_buysell_point, begin');
        //console.log('StrategyMacdClass on_bar, msg:', JSON.stringify(barObj));

        this.testObj1['test_count']++;
        if (this.testObj1['test_count'] > 5){
            this.testObj1['test_count'] = 0;

            var tradeObj = this.get_trade_obj('sell', 25, 8000);
            if (this.testObj1['order'] == 'sell'){
                this.testObj1['order'] = 'buy';
                tradeObj['order_position'] = 'buy';
                tradeObj['price'] = 25;
                //连续发送二次，测试重复性
                this.to_buy_point(this.symbol, this.ktype, tradeObj);
                this.to_buy_point(this.symbol, this.ktype, tradeObj);
                this.to_buy_point(this.symbol, this.ktype, tradeObj);
                this.to_buy_point(this.symbol, this.ktype, tradeObj);
            }
            else{
                this.testObj1['order'] = 'sell';
                tradeObj['order_position'] = 'sell';
                tradeObj['price'] = 32;
                this.to_sell_point(this.symbol, this.ktype, tradeObj);
                this.to_sell_point(this.symbol, this.ktype, tradeObj);
            }
        }

        console.log('test_timer_simulate_buysell_point end');
    }

};



