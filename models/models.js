

const TaskTable = require('./task/trade_task.js');
const TradePointTable = require('./task/trade_point.js');
const StrategyTable = require('../models/strategy/strategy.js');
const RiskctrlTable = require('../models/riskctrl/riskctrl.js');
const LogTable = require('../models/log/log.js');
const TaskPlanTable = require('../models/history/task_plan.js');
const OrderTable = require('../models/order/order.js');
const MarketTable = require('../models/market/market.js');
const BasicsTable = require('../models/basics/basics.js');
const KTable = require('../models/history/history.js');
const BacktestResultTable = require('./backtest/backtest_result.js');
const BacktestTaskTable = require('./backtest/backtest_task.js');


const SelectResultTable = require('./pickstock/select_result.js');
const PickstockTaskTable = require('./pickstock/select_task.js');

const AdminModel = require('../models/admin/admin');



//mqtt 命令
function DB() {
    //this.RomTable = RomTable;
    this.TaskTable = TaskTable;
    this.TradePointTable = TradePointTable;
    //this.SysinfoTable = SysinfoTable;
    this.StrategyTable = StrategyTable;
    this.RiskctrlTable = RiskctrlTable;
    this.LogTable = LogTable;
    this.BacktestResultTable = BacktestResultTable;
    this.BacktestTaskTable = BacktestTaskTable;

    this.SelectResultTable = SelectResultTable;
    this.SelectTaskTable = PickstockTaskTable;

    this.TaskPlanTable = TaskPlanTable;
    this.OrderTable = OrderTable;
    this.MarketTable = MarketTable;

    this.AdminModel = AdminModel;
    this.BasicsTable = BasicsTable;
    this.KHistory = KTable;

}


module.exports = new DB();