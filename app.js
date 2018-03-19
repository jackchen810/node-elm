'use strict';
import express from 'express';
import db from './mongodb/db.js';

import config from 'config-lite';
import web_router from './website/routes/entry_index.js';

import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import winston from 'winston';
import expressWinston from 'express-winston';
import path from 'path';
import history from 'connect-history-api-fallback';
import https from 'https'
const fork = require('child_process').fork;
const fs = require("fs");


//excel导入文件存放位置， 不存在则创建
fs.exists(config.device_dir, function(exists) {
    console.log(exists ? "设备excel目录存在" : "设备excel目录不存在", config.device_dir);
    if (!exists) fs.mkdirSync(config.device_dir);
});

//脚本存放位置， 不存在则创建
fs.exists(config.script_dir, function(exists) {
    console.log(exists ? "脚本目录存在" : "脚本目录不存在", config.script_dir);
    if (!exists) fs.mkdirSync(config.script_dir);
});

const app = express();

app.all('*', (req, res, next) => {
	res.header("Access-Control-Allow-Origin", req.headers.origin || '*');
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  	res.header("Access-Control-Allow-Credentials", true); //可以带cookies
    //res.setHeader("Set-Cookie", ["type=ninja", "language=javascript"]);
	res.header("X-Powered-By", '3.2.1')
	if (req.method == 'OPTIONS') {
	  	res.send(200);
	} else {
		//console.log('method:', req.method)
		/*
        req.on('data', function (data) {
            console.log('entry, url:', req.hostname + req.path, ';body data', data.toString());
        });
        */
	    next();
	}
});

// app.use(Statistic.apiRecord)
//连接数据库
const MongoStore = connectMongo(session);

// 使用中间件解析body
// body-parser 能处理 text/plain, application/json和application/x-www-form-urlencoded的数据，解析完放到req.body里。
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(session({
	  	name: config.session.name,
		secret: config.session.secret,
		resave: true,
		saveUninitialized: false,
		cookie: config.session.cookie,
		store: new MongoStore({
	  	url: config.url
	})
}))
app.use(function(req, res, next){
	req.session._garbage = Date();
	req.session.touch();
	next();
});

//注册路由分发
web_router(app);


app.use(history());

//通过 Express 内置的 express.static 可以方便地托管静态文件，例如图片、CSS、JavaScript 文件等。
app.use(express.static('./public'));
//app.listen(config.port);

//本地调试, 使用http
if (process.env.NODE_ENV == 'local') {
    app.listen(config.port);
    console.log('Http listening at ' + config.port);

    //添加行情接口
    //var market = require("./trader/gateway-market/market_sina.js");
/*
    var worker = fork('./trader/worker_main.js') //创建一个工作进程
    worker.on('message', function(m) {//接收工作进程计算结果
        if ('object' === typeof m && m.type === 'fibo') {
            worker.kill();//发送杀死进程的信号
        }
    });

    var obj = {
        'symbol': '600089',
        'ktype': '60',
        'task_id': '111111111',
        'strategy_name': 'strategy_macd',
        'riskctrl_name': 'riskctrl',
    }
    worker.send({type: 'task', action: 'add', data:obj});

    // 10分钟钟后
    setInterval(function(){
        var obj = {
            'symbol': '600089',
            'ktype': '60',
        }
        worker.send({type: 'tick', action: 'on', data:obj});
    }, 5000);
*/
}
else{
    app.use(express.static(path.join(__dirname,'./public/dist')))
    app.get('*',function(req,res){
        const html = fs.readFileSync(path.resolve(__dirname,'./public/dist/index.html'),'utf8');
        res.send(html);
    });

    var options = {
        key:fs.readFileSync(path.join(__dirname,config.ssl.key),'utf8'),
        cert:fs.readFileSync(path.join(__dirname,config.ssl.cert),'utf8')
    };
    https.createServer(options,app).listen(config.ssl.port);
}




