
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const events = require("events");
const PickerTx = require('../picker_tx.js');

class PickerClass {
    constructor(){
        this.task_id = '';
        this.strategyList = new Array();
        this.strategyList[0] = ['obj1', 'obj2'];

        this.taskMap = new Map(); // 空Map

        //this.on_tick = this.on_tick.bind(this);
        //this.on_bar = this.on_bar.bind(this);
    }

}

//导出模块
module.exports = new PickerClass();


