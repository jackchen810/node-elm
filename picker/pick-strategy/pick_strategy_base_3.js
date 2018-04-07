'use strict';
// load the module and display its version
const PickstockBaseStrategy = require("../../prototype/pickStrategyBaseClass");
const dtime = require('time-formater');
const DB = require('../../models/models');

//策略要继承基类
module.exports = class PickBase3Class extends PickstockBaseStrategy{

    constructor(task_id){
        super(task_id);
        console.log('PickBase3Class constructor');
        this.select_by_basic();
    }

    /*
    3倍, weight 倍数
    每股净资产
    每股未分配利润
    每股公积金
    */
    async select_by_basic_policy(close, basic_record, weight) {

        var total = Number(basic_record['bvps']) + Number(basic_record['perundp']) + Number(basic_record['reservedPerShare']);

        //console.log('bvps', basic_record['bvps']);
        //console.log('perundp', basic_record['perundp']);
        //console.log('reservedPerShare', basic_record['reservedPerShare']);
        //console.log('total', total);
        var base = Math.round(total*100)/100;
        console.log('code:', basic_record['code'], 'close:', close, 'base:', base);

        if (close < (weight * base)) {
            var code = basic_record['code'];
            //console.log(code);
            var new_records = {
                "task_id": this.task_id,
                "stock_symbol": code,
                "symbol_name": basic_record['name'],
                "stock_ktype": this.ktype,
                "close": close,
                "weight": weight,
                "base": base,
                "strategy_name": 'pick_strategy_base_3.js',
                "bvps": basic_record['bvps'],
                "perundp": basic_record['perundp'],
                "reservedPerShare": basic_record['reservedPerShare']
            };

            console.log('found:', code);
            await DB.PickResultTable.create(new_records);
        }

    }

    async select_by_basic(){

        //清除结果
        await DB.PickResultTable.remove();

        // 创建迭代器对象, 遍历列表
        var queryList = await DB.BasicsTable.find().exec();
        console.log('select_by_basic', queryList.length, this.ktype);

        for (var i = 0; i < queryList.length; i++) {
            var code = queryList[i]['code'];
            //console.log('queryList[%d].code', i, code);

            //今天的收盘价
            var barList = await DB.KHistory(this.ktype, code).find().sort({'date': -1});
            if (barList.length > 0) {
                //基本面3倍选股
                var close = barList[0]['close'];   //最新收盘价
                //console.log('barList:', i, code, close, barList[0]['date']);
                await this.select_by_basic_policy(close, queryList[i], 1);
            }
        }

        this.to_end({task_id : this.task_id});
    }

}
console.log('create worker PickBase3Class');



