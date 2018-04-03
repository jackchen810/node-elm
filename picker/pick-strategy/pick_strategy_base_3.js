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
    3倍
    每股净资产
    每股未分配利润
    每股公积金
    */
    async select_by_basic_policy(close, basic_record, weight) {

        var base = basic_record['bvps'] + basic_record['perundp'] + basic_record['reservedPerShare'];
        if (close < (weight * base)) {
            var code = basic_record['code'];
            console.log(code);
            var new_records = {
                "code": code,
                "close": close,
                "weight": weight,
                "base": base,
                "bvps": basic_record['bvps'],
                "perundp": basic_record['perundp'],
                "reservedPerShare": basic_record['reservedPerShare']
            };

            await DB.SelectResultTable.create(new_records);
        }

    }

    async select_by_basic(){

        // 创建迭代器对象, 遍历列表
        var queryList = await DB.BasicsTable.find().exec();
        console.log('select_by_basic', queryList.length);

        for (var i = 0; i < queryList.length; i++) {
            var code = queryList[i]['code']


            var mytime = new Date();
            for (var m = 0; m < 5; m++) {

                //往前找有数据的天，最多5天
                mytime.setDate(mytime.getDate() - m);

                //今天的收盘价
                var wherestr = {'date': dtime(mytime).format('YYYY-MM-DD')};
                var today_record = await DB.KHistory(this.ktype, code).findOne(wherestr).exec();
                if (today_record != null) {
                    //基本面3倍选股
                    var close = today_record['close'];

                    console.log(code, close, dtime(mytime).format('YYYY-MM-DD'));
                    await select_by_basic_policy(close, queryList[i], 1);
                    break;
                }
                //保存数据
            }
        }

        this.to_end({task_id : this.task_id});
    }

}
console.log('create worker PickBase3Class');



