'use strict';
//import StrategyComponent from "../../prototype/strategyComponent";
const BaseStrategy = require("../../prototype/strategyBaseClass");

//策略要继承基类
class StrategyClass extends BaseStrategy {
    constructor(){
        super();
    }

    async on_tick(msgObj) {
        console.log('StrategyClass, msg:', msgObj);
    }

    async on_bar(ktype, msgObj) {
        console.log('StrategyClass, msg:', msgObj);
    }

}
console.log('create worker StrategyClass');

//导出模块
module.exports = new StrategyClass();


