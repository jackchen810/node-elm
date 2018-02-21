'use strict';

const events = require("events");

//创建事件监听的一个对象
const emitter = new events.EventEmitter();
console.log('create worker events');
module.exports = emitter;
//export default emitter;