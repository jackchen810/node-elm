'use strict';
var http = require('http');

module.exports = class HistoryDataBaseClass_ifeng {
    constructor(){

        this.url = 'http://hq.sinajs.cn/list=';
        this.baseUrl = 'http://hq.sinajs.cn/list=';
        this.K_TYPE = {
            day: 'akdaily',
            week: 'akweekly',
            month: 'akmonthly',
            minute: 'akmin',
        };

        //绑定，this
        this.price_url = this.price_url.bind(this);
        console.log(('5' in this.K_TYPE) ? this.K_TYPE[ktype] : this.K_TYPE.minute)
    }


    price_url(ktype, autype, symbol) {
        var _symbol = ('6' === symbol[0]) ? ('sh'+symbol) : ('sz'+symbol);
        var _ktype = (ktype in this.K_TYPE) ? this.K_TYPE[ktype] : this.K_TYPE.minute;
        var type = (_ktype === this.K_TYPE.minute ? ktype : autype);
        var codeStr = (_ktype === this.K_TYPE.minute ? 'scode' : 'code');
        return `http://api.finance.ifeng.com/${_ktype}/?${codeStr}=${_symbol}&type=${type}`;
    };

    //http://api.finance.ifeng.com/akdaily/?code=sh601989&type=last
    //http://api.finance.ifeng.com/akmin/?scode=sh601989&type=5
    //http://api.finance.ifeng.com/akmin/?scode=sz002500&type=5
    async download(ktype, autype, symbol) {
        var self = this;
        return new Promise(async function(resovle, reject) {
            var url = self.price_url(ktype, autype, symbol);

            console.log('get %s, http url:', ktype, url, new Date());

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
                        return resovle([]);
                    }

                    //console.log('http data:', jsonObj);
                    return resovle(jsonObj);
                });

                req.on('error', function (e) {
                    console.log('problem with request: ' + e.message);
                    return resovle([]);
                });

            });
        });
    }

}
