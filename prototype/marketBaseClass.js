'use strict';
const emitter = require("../trader/event/event.js");
var schedule = require('node-schedule');

module.exports = class BaseMarket {
    constructor(){
        this.uri = '';
        this.baseUrl = '';


        this.timer_callback_min1 = this.timer_callback_min1.bind(this);


        // key: stock_type  每个k线类型起一个定时器实例
        this.timerMap = new Map(); // 空Map
        this.timerMap.set('1', {
            'symbol_set':new Set(),
            'url':'',
            'timer_job_cron': '',
            'timer_job_handle': '',
            'timer_callback':this.timer_callback_min1});
        this.timerMap.set('5', {
            'symbol_set':new Set(),
            'url':'',
            'timer_job_cron': '',
            'timer_job_handle': '',
            'timer_callback':this.timer_callback_min5});
        this.timerMap.set('15', {
            'symbol_set':new Set(),
            'url':'',
            'timer_job_cron': '',
            'timer_job_handle': '',
            'timer_callback':this.timer_callback_min15});
        this.timerMap.set('30', {
            'symbol_set':new Set(),
            'url':'',
            'timer_job_cron': '',
            'timer_job_handle': '',
            'timer_callback':this.timer_callback_min30});
        this.timerMap.set('60', {
            'symbol_set':new Set(),
            'url':'',
            'timer_job_cron': '',
            'timer_job_handle': '',
            'timer_callback':this.timer_callback_min60});

        //console.log('timerMap:', this.timerMap);

        //标的集合
        //this.symbol_set = new Set();
        console.log('BaseMarket');

    }

    //定时器注册函数
    async timer_register_callback(timer, ktype, job_cron, callback_func) {
        if (timer.has(ktype)) {
            var timerDict = timer.get(ktype);
            timerDict['timer_job_cron'] = job_cron;
            timerDict['timer_callback'] = callback_func;
            return 0
        }
        else{
            this.timerMap.set(ktype, {
                'symbol_set':new Set(),
                'url':'',
                'timer_job_cron': job_cron,
                'timer_job_handle': '',
                'timer_callback':callback_func});
            return -1;
        }

    }

    async timer_callback_min1() {
        throw new Error('timer_callback_min1 需要用户实现');
    }

    async timer_callback_min5() {
        throw new Error('timer_callback_min5 需要用户实现');
    }
    async timer_callback_min15() {
        throw new Error('timer_callback_min15 需要用户实现');
    }
    async timer_callback_min30() {
        throw new Error('timer_handle_min30 需要用户实现');
    }
    async timer_callback_min60() {
        throw new Error('timer_handle_min60 需要用户实现');
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


