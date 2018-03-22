'use strict';
const config = require('config-lite');
const fs = require("fs");
const path = require('path');
const schedule = require('node-schedule');
const dtime = require('time-formater');
const DB = require('../../../models/models');
const WebsiteHnd = require('../../../website/website_entry.js');

class BacktestHandle {
    constructor(){
        //绑定，this
        this.start = this.start.bind(this);

    }
    async start(req, res, next){
        console.log('backtest start');

        //获取表单数据，josn
        var strategy_name = req.body['strategy_name'];
        var stock_symbol = req.body['stock_symbol'];        //获取表单数据，josn
        var stock_name = req.body['stock_name'];        //获取表单数据，josn
        var backtest_time = req.body['backtest_time'];        //获取表单数据，josn

        console.log('backtest_time', backtest_time);
        console.log('stock_name', stock_name);
        console.log('strategy_name', strategy_name);
        console.log('backtest_time-0', dtime(backtest_time[0]).format('YYYY-MM-DD HH:mm:ss'));
        console.log('backtest_time-1', dtime(backtest_time[1]).format('YYYY-MM-DD HH:mm:ss'));




        var updatestr = {
            'task_id': task_id,
            'task_status': 'stop',   // 运行状态
            'trade_symbol': trade_symbol,   ///index=0的使用交易symbol
            'trade_ktype': stock_ktype,   ///index=0的使用交易symbol
            'symbol_name': '',   //标的名称
            'strategy_list': strategy_list,   //对象数组
            'strategy_name': strategy_name,   //策略名称
            'riskctrl_name': riskctrl_name,   //风控名称
            'market_gateway': market_gateway,   //交易网关名称
            'order_gateway': order_gateway,   //交易网关名称
            'create_at':dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
            'sort_time':mytime.getTime()
        };

        var task_item = await DB.TaskTable.create(updatestr);
        if (task_item == null){
            res.send({ret_code: -1, ret_msg: 'FAILED', extra:'任务添加数据库失败'});
            return;
        }

        console.log('strategy_list:', strategy_list);
        var message = {
            'task_id': task_id,
            'trade_symbol': trade_symbol,
            'trade_ktype': stock_ktype,
            'strategy_list': strategy_list,   //策略名称
            'riskctrl_name': riskctrl_name,   //风控名称
            'market_gateway': market_gateway,   //行情网关名称
            'order_gateway': order_gateway,   //交易网关名称
        }

        new WebsiteHnd('task', 'add').send(message);

        //res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:task_id});
        res.send({ret_code: -1, ret_msg: 'SUCCESS', extra:''});

        console.log('backtest start end');
    }




}

module.exports = new BacktestHandle()



//await DB.TaskTable.findOneAndUpdate(wherestr, updatestr).exec();
//await 可以不调用.exec() 返回值
//如果没有转await 则必须调用.exec() 才能返回查询结果,不能通过返回值判断
//如果采用返回值得形式，必须的await

