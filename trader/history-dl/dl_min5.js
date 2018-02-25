'use strict';
import WorkerHnd from "../worker/worker_agent";
import DB from "../../models/models.js";

const HistoryDataBaseClass_ifeng = require("../../prototype/historyDataBaseClass_ifeng");

console.log('new min5 HistoryDataBaseClass_ifeng');
var dl = new HistoryDataBaseClass_ifeng();
dl.download('5', 'fq', '002500');


