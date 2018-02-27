'use strict';

module.exports = class BaseMarket {
    constructor(){

        this.create_bar_min = this.create_bar_min.bind(this);

        this.all_symbols = new Set();   //任务标的集合

        // ktypeMap  每个k线类型记录标的列表
        this.ktypeMap = new Map(); // 空Map
        this.ktypeMap.set('1', {'symbol_list' : [], 'bar_obj' : {}});
        this.ktypeMap.set('5', {'symbol_list' : [], 'bar_obj' : {}});
        this.ktypeMap.set('15', {'symbol_list' : [], 'bar_obj' : {}});
        this.ktypeMap.set('30', {'symbol_list' : [], 'bar_obj' : {}});
        this.ktypeMap.set('60', {'symbol_list' : [], 'bar_obj' : {}});

        //console.log('timerMap:', this.timerMap);

        //标的集合
        //this.symbol_set = new Set();
        console.log('BaseMarket');

    }



    //onInit  ----不需要用户修改
    async onInit(emitter, task_id, symbol, ktype){
        this.task_id = task_id;
        this.emitter = emitter;
        this.symbol = symbol;
        this.ktype = ktype;
        //console.log('BaseStrategyComponent onInit');
        return;
    }


    async create_bar_min(tickObj, ktype, barCallback) {
        console.log('create_bar_min:', ktype, JSON.stringify(tickObj));

        var time_array = tickObj['time'].split(':');
        var tick_minute = time_array[1];

        var ktypeDict = this.ktypeMap.get(ktype);
        var barObj = ktypeDict['bar_obj'];

        //判断是否是空对象
        if (Object.keys(barObj).length == 0){
            barObj['_minute'] = tick_minute;
        }

        console.log('tick_minute:', barObj['_minute'], tick_minute % Number(ktype) );
        barCallback(barObj);
        if (tick_minute != barObj['_minute'] && tick_minute % Number(ktype) == 0) {
            //回调函数
            barCallback(barObj);

            barObj['open'] = tickObj['price'] ;
            barObj['close'] = tickObj['price'];
            barObj['high'] = tickObj['price'];
            barObj['low'] = tickObj['price'];
            barObj['_minute'] = tick_minute;
        }
        else{
            barObj['open'] = barObj['open'] ;
            barObj['close'] = tickObj['price'];
            barObj['high'] = (barObj['high'] > tickObj['price']) ? barObj['high'] : tickObj['price'];
            barObj['low'] = (barObj['low'] < tickObj['price']) ? barObj['low'] : tickObj['price'];

            barObj['symbol'] = tickObj['symbol'];
            barObj['name'] = tickObj['name'];
            barObj['price'] = tickObj['price'];
            barObj['volume'] = barObj['volume'] + tickObj['volume'];
            barObj['date'] = tickObj['date'];
            barObj['time'] = tickObj['time'];
        }

    }


}


