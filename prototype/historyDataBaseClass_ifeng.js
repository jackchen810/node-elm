'use strict';

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
    }


    async priceUrl(ktype, autype, symbol) {
        const _ktype = this.K_TYPE[ktype] ? this.K_TYPE[ktype] : this.K_TYPE.minute;
        const type = (_ktype === this.K_TYPE.minute ? ktype : autype);
        const codeStr = (_ktype === this.K_TYPE.minute ? 'scode' : 'code');
        return `http://api.finance.ifeng.com/${_ktype}/?${codeStr}=${symbol}&type=${type}`;
    };


    async download(ktype, autype, symbol) {
        return new Promise(async function(resovle, reject) {
            console.log('get %s, http url:', ktype, url, new Date());

            var url = this.priceUrl(ktype, autype, symbol);

            //get 请求外网
            http.get(url, function (req, res) {
                var data_str = '';
                req.on('data', function (chunk) {
                    data_str += chunk
                });

                req.on('end', function () {
                    var jsonObj = JSON.parse(data_str);
                    console.log('http data:', jsonObj);
                    return resovle();
                });

                req.on('error', function (e) {
                    console.log('problem with request: ' + e.message);
                    return resovle();
                });

            });
        });
    }

}

