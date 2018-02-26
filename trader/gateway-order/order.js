'use strict';
const BaseOrder = require("../../prototype/orderBaseClass");

//策略要继承基类
class OrderClass extends BaseOrder {
    constructor(){
        super();
    }


}
console.log('create worker OrderClass');

//导出模块, 只允许单实例运行
module.exports = new OrderClass();


