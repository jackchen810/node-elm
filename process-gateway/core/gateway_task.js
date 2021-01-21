'use strict';
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const dtime = require('time-formater');
//const  GatewayTxHandle = require("../gateway_tx");
const DB = require('../../models/models.js');

class GatewayClass {
    constructor(){

        this.gatewayTaskMap = new Map(); // 空Map
    }


    async gateway_task_add(taskObj, response)  {
        console.log('[gateway] add task');


        //添加策略实例,
        var task_id = taskObj['task_id'];
        //var task_type = taskObj['task_type'];   // 自动交易：'trade'; 机器人模拟交易：'simulate'; 交易回测：'gateway'
        //var trade_symbol = taskObj['trade_symbol'];   //交易标的
        var riskctrl_name = taskObj['riskctrl_name'];        //获取表单数据，josn


        var script_fullname = path.join(__dirname, '../../', config.riskctrl_dir, riskctrl_name);
        console.log('script_fullname', script_fullname);

        // 创建实例
        var script_class = require(script_fullname);
        var ristctrl_instance = new script_class();
        //script_instance.timer_callback();
        taskObj['ristctrl_instance'] = ristctrl_instance;

        //map映射，push value
        this.gatewayTaskMap.set(task_id, taskObj); // 添加新的key-value
        this.task_id = task_id;

        //console.log('[gateway] this:', this);
        //console.log('[gateway] add gatewaygatewayTaskMap:', JSON.stringify(taskObj));
        console.log('[gateway] gatewayTaskMap size', this.gatewayTaskMap.size);

        //console.log('add task ok:', task);
        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        //response.send(msgObj, 'log_record', 'log', 'http');
        console.log('[gateway] add task ok');
    }


    async gateway_task_del(taskObj, response){
        console.log('[gateway] gateway_task_del');
        console.log('[gateway] tradeObj:', taskObj);

        var task_id = taskObj['task_id'];
        console.log('[gateway] task_id:', task_id);

        var taskItem = this.taskMap.get(task_id);
        if (typeof(taskItem) !== 'undefined') {
            //script_instance.timer_callback();
            //free ristctrl_instance
            taskItem['ristctrl_instance'] = null;

            //删除实例
            this.gatewayTaskMap.delete(task_id);
        }

        response.send(taskObj);
        console.log('[gateway] gateway_task_del ok');
    }


    ///处理trader 过来的数据
    /*
    *
    var trade_obj = {
        'task_id': key,
        'trade_symbol': taskObj['trade_symbol'],
        'trade_amount': taskObj['trade_amount'],
        'strategy_name': 'none',
        'order_position': 'buy',
        'buysell_point_at': dtime().format('YYYY-MM-DD HH:mm:ss'),   //时间
    };
    * */
    async gateway_buysell_point(buysell_type, tradeObj, response){
        console.log('[gateway] gateway_buysell_point', buysell_type);
        console.log('[gateway] tradeObj:', tradeObj);

        var task_id = tradeObj['task_id'];
        console.log('[gateway] task_id:', task_id);

        var mytime = new Date();


        var wherestr = {
            'task_id': task_id,
            'task_type': tradeObj['task_type'],
            'trade_symbol': tradeObj['trade_symbol'],
            'trade_ktype': tradeObj['trade_ktype'],
            'order_position': {$ne : 'none'},   ///买点或买点
        };

        //查询同一组交易记录的中最新的一条
        var queryList = await DB.TaskTable.find(wherestr).sort({sort_time:-1}).limit(1).exec();
        if (queryList != null) {
            await DB.TradePointTable.updateOne(query['_id'], updatestr, {upsert: true}).exec();
            return;
        }
        else{

        }

        var wherestr = {'task_id': task_id, 'order_point_at': tradeObj['order_point_at']};
        var updatestr = {
            'task_id': task_id,
            'task_type': tradeObj['task_type'],
            'trade_symbol': tradeObj['trade_symbol'],
            'trade_symbol_name': tradeObj['trade_symbol_name'],
            'trade_ktype': tradeObj['trade_ktype'],

            'order_position': tradeObj['order_position'],
            'order_point_at': tradeObj['order_point_at'],
            'strategy_name': tradeObj['strategy_name'],

            'trade_price': tradeObj['price'],
            'trade_amount': tradeObj['amount'],

            'create_at':dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
            'sort_time':mytime.getTime()
        };

        var point_item = await DB.TradePointTable.update(wherestr, updatestr, {upsert: true}).exec();
        if (point_item == null) {
            var msgObj = {ret_code: -1, ret_msg: '失败', extra: task_id};
            response.send(msgObj);
            return;
        }
        var msgObj = {ret_code: 0, ret_msg: 'SUCCESS', extra: task_id};
        response.send(msgObj);
        console.log('[gateway] gateway_buysell_point ok');
    }



}

//导出模块
module.exports = new GatewayClass();


