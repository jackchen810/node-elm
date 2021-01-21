'use strict';
const DB = require('../../models/models.js');
const http = require('http');
const querystring = require('querystring');

//策略要继承基类
module.exports = class TushareBaseDataClass{
    constructor() {
        //tushare pro 网站要求 token
        this.host = 'api.tushare.pro';
        this.token = '537480ccc632aad14a862d29f8a7d86ba4e2849911e602c2d335d5c7';

        console.log('TushareDlDataClass constructor');


        //curl -X POST -d '{"api_name": "stock_basic", "token": "537480ccc632aad14a862d29f8a7d86ba4e2849911e602c2d335d5c7", "params": {"list_stauts":"L"}, "fields": "ts_code,name,area,industry,list_date"}' http://api.waditu.com
    }

    async write_2_db(json_obj) {

        console.log('[download] ready to download data', JSON.stringify(json_obj));

        var items = json_obj['data']['items'];
        if (typeof(items) === 'undefined') {
            console.log('[download] not return record');
            return;
        }

        console.log('[download] dl data item1:%s', JSON.stringify(items[0]));
        for (var i = 0; i < items.length; i++) {
            var item = items[i];

            //"2018-04-10 11:20:00" 记录转换为 '2018-04-10 11:20' 和tushare保持一致
            //day 数据也可以兼容
            //var date = item[0].substr(0, 16);
            //console.log('to date', date);

            //更新到设备数据库
            var wherestr = {'code': item[1]};
            var updatestr = {
                'code': item[1],
                'name': item[2],
                'area': item[3],

                'industry': item[4],
                'timeToMarket': item[6],

            };
            await DB.BasicsTable.update(wherestr, updatestr, {upsert: true}).exec();
        }
    }

    /*
    api_name：接口名称，比如stock_basic
    token ：用户唯一标识，可通过登录pro网站获取
    params：接口参数，如daily接口中start_date和end_date

    fields：字段列表，用于接口获取指定的字段，以逗号分隔，如"open,high,low,close"...
    */


    async to_download() {
        var self = this;

        var p = new Promise(function (resolve, reject) {        //做一些异步操作

            console.log('[tushare] get base data, http url:', self.url, new Date());
            //post 请求外网
            var post_data = {
                "api_name": "stock_basic",
                "token": self.token,
                "params": {"list_status":"L"},
                "fields": ""
            };

            ////数据以url param格式发送
            //var content = querystring.stringify(post_data);
            //数据以json格式发送
            var content = JSON.stringify(post_data);

            console.log('[tushare] length:', content.length);
            var options = {
                hostname: self.host,
                port: 80,
                path: '/',
                method: 'POST',
                headers: {
                    //"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8",
                    "Content-Type": "application/json", // for json data
                    "Content-Length": content.length,
                },
            };

            var req = http.request(options, function (res) {
                console.log('response.statusCode: ' + res.statusCode);
                console.log('response.headers: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                var res_data='';
                res.on('data', function(chunk){
                    res_data += chunk;
                });
                res.on('end', function(){
                    var resstr = eval("'" + res_data + "'");
                    console.log("\n--->>\nresult:",resstr)
                    //var obj = JSON.parse(resstr);
                    self.write_2_db(JSON.parse(resstr));
                });
            });
            req.on('error', function (e) {
                console.log('problem with request: ' + e.message);
            });
            // write data to request body
            // 写入数据到请求主体
            req.write(content);
            req.end();
        });

        return p;
    }

/*
    async to_download2() {
        //提交预约登记信息
        console.log('[tushare] to_download2, http url:', this.url);
        //post 请求外网
        var post_data = {
            "api_name": "stock_basic",
            "token": "537480ccc632aad14a862d29f8a7d86ba4e2849911e602c2d335d5c7",
            "params": {"list_status":"L"},
            "fields": ""
        };

        //var content = querystring.stringify(post_data);
        var content = JSON.stringify(post_data); //数据以json格式发送
        console.log('[tushare] length:', content.length);
        var options = {
            host: 'api.tushare.pro',
            port: '80',
            path: '/',
            method:'POST',
            headers: {
                //"Content-Type":"application/x-www-form-urlencoded",
                "Content-Type": "application/json", // for json data
                "Content-Length": content.length,
            },
        };

        var req = http.request(options, function (res) {
            console.log('response.statusCode: ' + res.statusCode);
            console.log('response.headers: ' + JSON.stringify(res.headers));

            res.setEncoding('utf-8');

            var res_data='';
            res.on('data', function(chunk){
                res_data += chunk;
            });
            res.on('end', function(){
                console.log("\n--->>\nresult:",res_data)
            });
        });
        req.on('error', function (e) {
            console.log('problem with request: ' + e.message);
        });
        // write data to request body
        // 写入数据到请求主体
        req.write(content);
        req.end();


        console.log('req.headers: ' + JSON.stringify(req.outputData));
    }
*/
    /* 实例入口，根据时间调用 */
    async timer_callback() {
        console.log('timer_callback:');
        this.to_download();
        //this.to_download2();
    }

};