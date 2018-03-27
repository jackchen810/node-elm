'use strict';
const BaseStrategy = require("../../prototype/strategyBaseClass");
// load the module and display its version
const talib = require('talib/build/Release/talib');


//策略要继承基类
module.exports = class StrategyMAClass extends BaseStrategy {
    constructor(strategy_name){
        super();
        this.on_bar = this.on_bar.bind(this);
        this.decimal = this.decimal.bind(this);
        this.talibSync = this.talibSync.bind(this);
        this.mybar = [];
        console.log('StrategyMacdClass constructor');
    }

    async on_tick(tickObj) {
        console.log('Strategy MA on_tick, task_id:', this.task_id, tickObj);
        //console.log('Strategy MA on_tick, msg:', tickObj);

        var tradeObj = this.get_trade_obj('buy', tickObj['price'], 100);
        this.to_buy('tick', tradeObj);

    }


    async on_bar(ktype, barObj) {
        console.log('Strategy MA on_bar, task_id:', this.task_id, JSON.stringify(barObj));
        //console.log('Strategy MA on_bar, msg:', JSON.stringify(barObj));

        this.mybar.push(barObj);

        //移除第一个元素，末尾加入一个
        if (this.mybar.length > 100) {
            this.mybar.shift();
        }

        //var open, high, low, close = this.mybar.map((obj) => {return obj['open'], obj['high'], obj['low'], obj['close']});
        var close = this.mybar.map((obj) => {return obj['close']});
        console.log(close.length);

        var MAobj = {
            name: "MA",
            startIdx: 0,
            endIdx: close.length - 1,
            inReal: close,
            optInTimePeriod : 60,
            optInMAType : 0,
        };

        //1. ma60
        console.log("0000:");
        MAobj['optInTimePeriod'] = 60;
        MAobj['startIdx'] = close.length - 1;
        var result60 = await this.talibSync(MAobj);

        //2. ma30
        console.log("1111:");
        MAobj['optInTimePeriod'] = 30;
        MAobj['startIdx'] = close.length - 1;
        var result30 = await this.talibSync(MAobj);

        //3. ma20
        console.log("2222:");
        MAobj['optInTimePeriod'] = 20;
        MAobj['startIdx'] = close.length - 1;
        var result20 = await this.talibSync(MAobj);


        //4. ma10
        console.log("3333:");
        MAobj['optInTimePeriod'] = 10;
        MAobj['startIdx'] = close.length - 1;
        var result10 = await this.talibSync(MAobj);


        //5. ma5
        console.log("4444:");
        MAobj['optInTimePeriod'] = 5;
        MAobj['startIdx'] = close.length - 1;
        var result5 = await this.talibSync(MAobj);

        // 同时执行p1和p2，并在它们都完成后执行then:
        var self = this;
        Promise.all([result60, result30, result20, result10, result5]).then(function (results) {
            console.log('all result, date:', barObj['date']); // 获得一个Array: ['P1', 'P2']
            console.log(results); // 获得一个Array: ['P1', 'P2']
            //console.log("Results, 0:", results[0]['nbElement']);

            var nbElement = result60['nbElement'];
            var outReal = result60['result']['outReal'];
            var ma60 = outReal[nbElement-1].toFixed(2);
            console.log("Results, ma60:", ma60);

            var nbElement = result30['nbElement'];
            var outReal = result30['result']['outReal'];
            var ma30 = outReal[nbElement-1].toFixed(2);
            console.log("Results, ma30:", ma30);

            var nbElement = result20['nbElement'];
            var outReal = result20['result']['outReal'];
            var ma20 = outReal[nbElement-1].toFixed(2);
            console.log("Results, ma20:", ma20);

            var nbElement = result10['nbElement'];
            var outReal = result10['result']['outReal'];
            var ma10 = outReal[nbElement-1].toFixed(2);
            console.log("Results, ma10:", ma10);

            var nbElement = result5['nbElement'];
            var outReal = result5['result']['outReal'];
            var ma5 = outReal[nbElement-1].toFixed(2);
            console.log("Results, ma5:", ma5);


            // diff 差值
            var diff5_10 = (ma5 - ma10).toFixed(2);
            var diff10_20 = (ma10 - ma20).toFixed(2);
            var diff20_30 = (ma20 - ma30).toFixed(2);
            var diff30_60 = (ma30 - ma60).toFixed(2);


            console.log("Results, diff:", diff5_10, diff10_20, diff20_30, diff30_60);

            var tradeObj = this.get_trade_obj('buy', barObj['price'], 100);
            self.to_buy(ktype, tradeObj);
        });
    }

    async on_buy_point(ktype, msgObj) {
        console.log('StrategyMacdClass on_buy_point, task_id:', this.task_id);
        console.log('StrategyMacdClass on_buy_point, msg:', JSON.stringify(msgObj));
        this.log('strategy', 1, JSON.stringify(msgObj));

    }

}
console.log('create worker StrategyMacdClass');



