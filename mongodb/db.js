'use strict';

//import mongoose from 'mongoose';
//import config from 'config-lite';
const mongoose = require('mongoose');
const config = require('config-lite');


mongoose.connect(config.url, {useMongoClient:true});
mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.once('open' ,() => {
	console.log('连接数据库成功, pid:', process.pid);
})

db.on('error', function(error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});

db.on('close', function() {
    console.log('数据库断开，重新连接数据库');
    mongoose.connect(config.url, {server:{auto_reconnect:true}});
});

///////////////////////////////////////////////////////////////
var url = "mongodb://localhost:27017/minute5";
const db_minute5 = mongoose.createConnection(url);
db_minute5.once('open' ,() => {
    console.log('连接数据库成功, pid:', process.pid);
})

db_minute5.on('error', function(error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});

db_minute5.on('close', function() {
    console.log('数据库断开，重新连接数据库');
    mongoose.connect(url, {server:{auto_reconnect:true}});
});


///////////////////////////////////////////////////////////////
var url = "mongodb://localhost:27017/minute15";
const db_minute15 = mongoose.createConnection(url);
db_minute15.once('open' ,() => {
    console.log('连接数据库成功, pid:', process.pid);
})

db_minute15.on('error', function(error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});

db_minute15.on('close', function() {
    console.log('数据库断开，重新连接数据库');
    mongoose.connect(url, {server:{auto_reconnect:true}});
});


///////////////////////////////////////////////////////////////
var url = "mongodb://localhost:27017/minute30";
const db_minute30 = mongoose.createConnection(url);
db_minute30.once('open' ,() => {
    console.log('连接数据库成功, pid:', process.pid);
})

db_minute30.on('error', function(error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});

db_minute30.on('close', function() {
    console.log('数据库断开，重新连接数据库');
    mongoose.connect(url, {server:{auto_reconnect:true}});
});


///////////////////////////////////////////////////////////////
var url = "mongodb://localhost:27017/minute60";
const db_minute60 = mongoose.createConnection(url);
db_minute60.once('open' ,() => {
    console.log('连接数据库成功, pid:', process.pid);
})

db_minute60.on('error', function(error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});

db_minute60.on('close', function() {
    console.log('数据库断开，重新连接数据库');
    mongoose.connect(url, {server:{auto_reconnect:true}});
});


///////////////////////////////////////////////////////////////
var url = "mongodb://localhost:27017/day";
const db_day = mongoose.createConnection(url);
db_day.once('open' ,() => {
    console.log('连接数据库成功, pid:', process.pid);
})

db_day.on('error', function(error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});

db_day.on('close', function() {
    console.log('数据库断开，重新连接数据库');
    mongoose.connect(url, {server:{auto_reconnect:true}});
});



//export default db;
//导出模块
module.exports = {};
exports.db = db;
exports.db_minute5 = db_minute5;
exports.db_minute15 = db_minute15;
exports.db_minute30 = db_minute30;
exports.db_minute60 = db_minute60;
exports.db_day = db_day;
module.exports = exports;
/*
module.exports = db;
module.exports = db_minute5;
module.exports = db_minute15;
module.exports = db_minute30;
module.exports = db_minute60;
module.exports = db_day;
*/