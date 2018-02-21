'use strict';
const BaseStrategy = require("../../prototype/strategyBaseClass");

//策略要继承基类
class StrategyMacdClass extends BaseStrategy {
    constructor(){
        super();
        console.log('constructor');
    }

    async on_tick(msgObj) {
        console.log('StrategyMacdClass onTick, task_id:', this.task_id);
        console.log('StrategyMacdClass onTick, msg:', msgObj);

    }

}
console.log('create worker StrategyMacdClass');

//导出模块
module.exports = new StrategyMacdClass();


