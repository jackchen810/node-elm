'use strict';

module.exports = class BaseMarket {
    constructor(){

        this.create_bar_min = this.create_bar_min.bind(this);
        this.to_download = this.to_download.bind(this);

        this.all_symbols = new Set();   //任务标的集合

        // ktypeMap  每个k线类型记录标的列表， 一些全局变量的存储
        // 需要定时获取tick的symbol 列表，不能重复，采用set 方式
        this.ktypeMap = new Map(); // 空Map
        this.ktypeMap.set('1', {'symbol_list' : [], 'bar_obj' : {}});
        this.ktypeMap.set('5', {'symbol_list' : [], 'bar_obj' : {}});
        this.ktypeMap.set('15', {'symbol_list' : [], 'bar_obj' : {}});
        this.ktypeMap.set('30', {'symbol_list' : [], 'bar_obj' : {}});
        this.ktypeMap.set('60', {'symbol_list' : [], 'bar_obj' : {}});

        //console.log('timerMap:', this.timerMap);
        this.tradeing = false;


        //标的集合
        //this.symbol_set = new Set();
        console.log('BaseMarket');

    }

    //on_init  ----不需要用户修改
    async on_init(emitter, task_id, symbol, ktype){
        this.task_id = task_id;
        this.emitter = emitter;
        this.symbol = symbol;
        this.ktype = ktype;
        //console.log('BaseStrategyComponent on_init');
        return;
    }

    //检查交易标志
    check_tradeing_flag(am_open_time, am_close_time, pm_open_time, pm_close_time){

        var today = new Date().toLocaleDateString();
        //console.log('today:', today);

        var t0 = Date.now();
        var t1 = new Date(today +  ' ' + am_open_time).getTime();
        var t2 = new Date(today +  ' ' + am_close_time).getTime();
        var t3 = new Date(today +  ' ' + pm_open_time).getTime();
        var t4 = new Date(today +  ' ' + pm_close_time).getTime();
        if ((t0 >= t1 && t0 < t2) || (t0 >= t1 && t0 < t2)) {
            this.tradeing = true;
        }
        else{
            this.tradeing = false;
        }

        //console.log('check_tradeing_flag:', this.tradeing, t1, t2, t3, t4);
        return this.tradeing;
    }



    //根据tick数据，计算k线数据
    //tickObj tick对象
    //
    async create_bar_min(tickObj, ktype, barCallback) {
        //console.log('create_bar_min:', ktype, 'tick:', JSON.stringify(tickObj));

        var time_array = tickObj['time'].split(':');
        var tick_minute = Number(time_array[1]);

        var ktypeDict = this.ktypeMap.get(ktype);
        var barObj = ktypeDict['bar_obj']

        //判断是否是空对象
        if (Object.keys(barObj).length == 0){
            barObj['code'] = '';
            barObj['date'] = tickObj['date'] + ' ' +  tickObj['time'].substring(0, 5);  //bar数据兼容tushare
            barObj['time'] = tickObj['time'];
            barObj['_before_minute'] = tick_minute;
            barObj['_begin_volume'] = tickObj['volume'];
        }

        //console.log('_before_minute:', barObj['_before_minute'], 'tick_minute:', tick_minute);
        //根据ktype 调用对应的回调 例如:5分钟，调用5分回调
        if (tick_minute != barObj['_before_minute'] && Number(tick_minute) % Number(ktype) == 0) {

            //回调函数
            barCallback(barObj);

            barObj['open'] = tickObj['price'] ;
            barObj['close'] = tickObj['price'];
            barObj['high'] = tickObj['price'];
            barObj['low'] = tickObj['price'];
            barObj['date'] = tickObj['date'];
            barObj['time'] = tickObj['time'];

            //记录上一个成交量
            barObj['_begin_volume'] = tickObj['volume'];
            barObj['volume'] = '0';
            barObj['_before_minute'] = tick_minute;
        }
        else{
            barObj['open'] = barObj['open'] ;
            barObj['close'] = tickObj['price'];
            barObj['high'] = (barObj['high'] > tickObj['price']) ? barObj['high'] : tickObj['price'];
            barObj['low'] = (barObj['low'] < tickObj['price']) ? barObj['low'] : tickObj['price'];

            barObj['code'] = tickObj['code'];
            barObj['name'] = tickObj['name'];
            barObj['price'] = tickObj['price'];
            barObj['volume'] = barObj['volume'] ? ((Number(tickObj['volume']) - Number(barObj['_begin_volume'])).toString()): '0';
            //console.log('volume:',Number(tickObj['volume']), 'begin', Number(barObj['_begin_volume']));
            //barObj['date'] = tickObj['date'];
            //barObj['time'] = tickObj['time'];
        }

    }

    async to_download(ktype, autype, symbol) {
        throw new Error('to_download 需要用户实现');
    }

}


