
import {TaskTable} from "../models/task/task.js";
import {StrategyTable} from "../models/strategy/strategy.js";
import {RiskctrlTable} from "../models/riskctrl/riskctrl.js";
import {LogTable} from "../models/log/log.js";
import {BacktestResultTable} from "./backtest/backtest_result.js";
import {SelectResultTable} from "./select/select_result.js";
import {DayTable, WeekTable, MonthTable, Min5Table, Min15Table, Min30Table, Min60Table} from "../models/history/history.js";
import {TaskPlanTable} from "../models/history/task_plan.js";
import {OrderTable} from "../models/order/order.js";
import {MarketTable} from "../models/market/market.js";

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

    this.DayTable = DayTable;
    this.WeekTable = WeekTable;
    this.MonthTable = MonthTable;
    this.Min5Table = Min5Table;
    this.Min15Table = Min15Table;
    this.Min30Table = Min30Table;
    this.Min60Table = Min60Table;

    this.TaskPlanTable = TaskPlanTable;
    this.OrderTable = OrderTable;
    this.MarketTable = MarketTable;

    this.AdminModel = AdminModel;
    this.getNowFormatDate = getNowFormatDate;

}

function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
        + " " + date.getHours() + seperator2 + date.getMinutes()
        + seperator2 + date.getSeconds();
    return currentdate;
}

export default new DB();