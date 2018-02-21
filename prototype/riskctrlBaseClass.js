'use strict';

module.exports = class BaseRiskctrl {
    constructor(){
        //记录任务id
        this.task_id = '';
        this.emitter = '';
        this.symbol = '';
        this.ktype = '';

        //bind
        this.on_buy = this.on_buy.bind(this);
        this.on_sell = this.on_sell.bind(this);
    }

    //onInit  ----不需要用户修改
    async onInit(emitter, task_id, symbol, ktype){
        this.task_id = task_id;
        this.emitter = emitter;
        this.symbol = symbol;
        this.ktype = ktype;

        console.log('task_id:', this.task_id);

        //监听事件some_event，  主策略产生的 买卖事件
        //this.emitter.on('on_buy', this.on_buy());
        //bind()最简单的用法是创建一个函数，使这个函数不论怎么调用都有同样的this值。
        this.emitter.on('on_buy', this.on_buy);
        return;
    }



    //on_buy  监听买单
    async on_buy(ktype, msgObj){
        throw new Error('riskctrl on_buy 需要用户实现');
        return;
    }

    //on_buy  监听买单
    async on_sell(ktype, msgObj){
        throw new Error('riskctrl on_sell 需要用户实现');
        return;
    }


    //发送 内部单子
    async send(symbol, ktype, msgObj){
        console.log('on_buy');
        //1. 发送event:task_id 事件， 任务更新使用
        this.emitter.emit('on_buy', symbol, ktype, msgObj);
        return;
    }
}


