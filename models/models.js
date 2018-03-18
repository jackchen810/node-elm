
import {TaskTable} from "../models/task/task.js";
import {StrategyTable} from "../models/strategy/strategy.js";
import {RiskctrlTable} from "../models/riskctrl/riskctrl.js";
import {LogTable} from "../models/log/log.js";
import {BacktestResultTable} from "./backtest/backtest_result.js";
import {SelectResultTable} from "./select/select_result.js";
import {TaskPlanTable} from "../models/history/task_plan.js";
import {OrderTable} from "../models/order/order.js";
import {MarketTable} from "../models/market/market.js";
//import {BasicsTable} from "../models/basics/basics.js";
import KTable from "../models/history/history.js";

import AdminModel from '../models/admin/admin';


//mqtt 命令
function DB() {
    //this.RomTable = RomTable;
    this.TaskTable = TaskTable;
    //this.SysinfoTable = SysinfoTable;
    this.StrategyTable = StrategyTable;
    this.RiskctrlTable = RiskctrlTable;
    this.LogTable = LogTable;
    this.BacktestResultTable = BacktestResultTable;
    this.SelectResultTable = SelectResultTable;

    this.TaskPlanTable = TaskPlanTable;
    this.OrderTable = OrderTable;
    this.MarketTable = MarketTable;

    this.AdminModel = AdminModel;
    //this.BasicsTable = BasicsTable;
    this.KHistory = KTable;

}


export default new DB();