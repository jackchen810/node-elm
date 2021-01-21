'use strict';
var http = require('http');

module.exports = class DownloadBaseClass_ifeng {
    constructor(ktype){
        //ktype
        this.ktype = ktype;

        this.K_TYPE = {
            day: 'akdaily',
            week: 'akweekly',
            month: 'akmonthly',
            minute: 'akmin',
        };

        //绑定，this
        this.convert_to_url = this.convert_to_url.bind(this);
        console.log(('5' in this.K_TYPE) ? this.K_TYPE['5'] : this.K_TYPE.minute)
    }

    /*
    *  ktype支持下面类型：
    *  5， 15， 30， 60，day，week，month
    * */

    convert_to_url(ktype, autype, symbol) {
        var _symbol = ('6' === symbol[0]) ? ('sh'+symbol) : ('sz'+symbol);
        var _ktype = (ktype in this.K_TYPE) ? this.K_TYPE[ktype] : this.K_TYPE.minute;
        var type = (_ktype === this.K_TYPE.minute ? ktype : autype);
        var codeStr = (_ktype === this.K_TYPE.minute ? 'scode' : 'code');
        return `http://api.finance.ifeng.com/${_ktype}/?${codeStr}=${_symbol}&type=${type}`;
    };

    //http://api.finance.ifeng.com/akmin/?scode=sh601989&type=5
    //http://api.finance.ifeng.com/akmin/?scode=sz002500&type=15
    //http://api.finance.ifeng.com/akmin/?scode=sz002500&type=30
    //http://api.finance.ifeng.com/akmin/?scode=sz002500&type=60
    //http://api.finance.ifeng.com/akdaily/?code=sz002500&type=fq
    //http://api.finance.ifeng.com/akdaily/?code=sz002500&type=last
    //day format: {"record":[["2015-04-20","20.800","20.800","19.140"   ...
    //minute format: {"record":[["2018-04-10 11:20:00","5.54","5.55","5.53",   ...
    async to_download(ktype, autype, symbol) {
        var self = this;

        var p = new Promise(function (resolve, reject) {        //做一些异步操作
            var url = self.convert_to_url(ktype, autype, symbol);

            console.log('[ifeng] get %s, http url:', ktype, url, new Date());
            //get 请求外网
            http.get(url, function (req, res) {
                var data_str = '';
                req.on('data', function (chunk) {
                    data_str += chunk
                });

                req.on('end', function () {
                    try{
                        var jsonObj = JSON.parse(data_str);
                    }
                    catch(err) {
                        return resolve([]);
                    }

                    //console.log('http data:', jsonObj);
                    //回调函数
                    return resolve(jsonObj);
                });

                req.on('error', function (e) {
                    console.log('problem with request: ' + e.message);
                    return resolve([]);
                });

            });
        });

        return p;
    }

    async timer_callback(strategy_name){
        throw new Error('timer_callback 需要用户实现');
        return;
    }



};

