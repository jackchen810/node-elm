'use strict';
const emitter = require("../trader/event/event.js");

module.exports = class BaseOrder {
    constructor(){
        this.task_id = '';
        this.emitter = '';
        this.symbol = '';
        this.ktype = '';
        console.log('BaseStrategyComponent');

        //监听事件some_event
        //emitter.on('onTick', this.onTick);
    }

    //onInit  ----不需要用户修改
    async onInit(emitter, task_id, symbol, ktype){
        this.task_id = task_id;
        this.emitter = emitter;
        this.symbol = symbol;
        this.ktype = ktype;
        //console.log('BaseStrategyComponent onInit');
        return;
    }

}


