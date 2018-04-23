'use strict';
const mongoose = require('mongoose');
const TaskTable = require('./task/trade_task.js');
const TradePointTable = require('./task/trade_point.js');
const LogTable = require('../models/log/log.js');
const TaskPlanTable = require('./download/task_plan.js');
const BasicsTable = require('../models/basics/basics.js');
const KTable = require('./download/history.js');
const BacktestResultTable = require('./backtest/backtest_result.js');
const BacktestTaskTable = require('./backtest/backtest_task.js');


const PickResultTable = require('./pickstock/select_result.js');
const PickTaskTable = require('./pickstock/select_task.js');

const AccountTable = require('./admin/account.js');
const SystemSetupTable = require('../models/config/system_setup.js');
const ScriptFileTable = require('../models/files/script_file.js');


//mqtt 命令
function DB() {
    //this.RomTable = RomTable;
    this.TaskTable = TaskTable;
    this.TradePointTable = TradePointTable;
    //this.SysinfoTable = SysinfoTable;
    //this.RiskctrlTable = RiskctrlTable;
    this.LogTable = LogTable;
    this.BacktestResultTable = BacktestResultTable;
    this.BacktestTaskTable = BacktestTaskTable;

    this.PickResultTable = PickResultTable;
    this.PickTaskTable = PickTaskTable;

    this.TaskPlanTable = TaskPlanTable;
    this.SystemSetupTable = SystemSetupTable;
    this.ScriptFileTable = ScriptFileTable;

    this.AccountTable = AccountTable;
    this.BasicsTable = BasicsTable;
    this.KHistory = KTable;

    this.guid = () => mongoose.Types.ObjectId();
/*
    this.guid=function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });*/

}


module.exports = new DB();