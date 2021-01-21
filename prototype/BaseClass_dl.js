'use strict';

module.exports = class BaseDownload {
    constructor(ktype){
        //记录任务id
        this.ktype = ktype;
    }

    //__init  ----不需要用户修改
    //task_type:
    async on_init(ktype){
        this.ktype = ktype;
        //console.log('111111', ktype);
        return;
    }

    async timer_callback(strategy_name){
        throw new Error('timer_callback 需要用户实现');
        return;
    }
};
