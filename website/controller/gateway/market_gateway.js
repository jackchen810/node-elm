'use strict';
const DB = require('../../../models/models.js');
const config = require('config-lite');
const dtime = require('time-formater');
const fs = require("fs");
const path = require('path');


class MarketGatewayHandle {
    constructor(){
        //绑定，this
        this.list = this.list.bind(this);
        this.del = this.del.bind(this);
        this.upload = this.upload.bind(this);
        this.download = this.download.bind(this);
    }
    async list(req, res, next){
        console.log('market gateway list');

        try {
            var path = config.market_gateway_dir;
            var files = fs.readdirSync(path);
            console.log('files', files);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:files});
        }
        catch (e) {
            console.log(e);
            res.send({ret_code: -1, ret_msg: 'FAIL', extra:e});
            return;
        }

        console.log('market gateway list end');
    }


    async del(req, res, next){
        console.log('[website] market gateway del');
        //获取表单数据，josn
        var file_name = req.body['file_name'];

        // 如果没有定义排序规则，添加默认排序
        if(!file_name){
            //console.log('sort undefined');
        }

        console.log('file_name:', file_name);
        var wherestr = {'file_name': file_name};
        await DB.MarketTable.remove(wherestr).exec();

        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:file_name});
        console.log('[website] market gateway del end');
    }


    async download(req, res, next) {
        console.log('[website] market gateway download');

        //获取表单数据，josn
        var id = req.body['_id'];
        var file_name = req.body['file_name'];

        //参数有效性检查
        if (typeof(id) === "undefined" || typeof(file_name) === "undefined") {
            res.send({ret_code: 1002, ret_msg: '参数错误', extra: 'josn para invalid'});
            return;
        }

        //console.log('request fields: id:', id);
        //检查上下架状态
        try {
            var query = await DB.MarketTable.findById(id).exec();
            console.log('query file_status:', query['file_status'] );
            if (query['file_status'] == 'revoke') {  //下架状态
                res.send({ret_code: 1003, ret_msg: '策略已下架', extra: file_name});
                return;
            }

            // 实现文件下载
            if (query['file_name'] != file_name){
                res.send({ret_code: 1016, ret_msg: 'FAILED', extra: '文件名称错误'});
                return;
            }
        }
        catch(err){
            await res.send({ret_code: -1, ret_msg: 'FAILED', extra:err});
            return;
        }

        //直接返回路径，通过访问文件进行下载
        var access_path = '/pick-strategy/' + file_name;
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:{'access_path':access_path}});

        console.log('[website] market gateway download end');
    }

    //1.fs.writeFile(filename,data,[options],callback); 创建并写入文件
    /**
     * filename, 必选参数，文件名
     * data, 写入的数据，可以字符或一个Buffer对象
     * [options],flag 默认‘2’,mode(权限) 默认‘0o666’,encoding 默认‘utf8’
     * callback  回调函数，回调函数只包含错误信息参数(err)，在写入失败时返回。
     */


    //2.readFile(filename,[options],callback); 读取文件内容
    //字符串方式读取文件
    /**
     * filename, 必选参数，文件名
     * [options],可选参数，可指定flag 默认为‘r’，encoding 默认为null，在读取的时候，需要手动指定
     * callback 读取文件后的回调函数，参数默认第一个err,第二个data 数据
     */
    async upload(req, res){

        console.log('[website] market gateway upload');
        //console.log(req);

        //生成multiparty对象，并配置上传目标路径
        /*
        fields： 是一个对象（上传名称和值），其属性名的字段名称和值是字段值的数组。
        files ：是一个对象（上传名称和服务器文件路径），其属性名的字段名称和值是文件对象的数组。
        */

        //var form = new multiparty.Form({uploadDir: config.firmware_dir});
        var fileName = '';
        var uploadedPath = '';
        var fileMatch = -1;
        var form = new formidable.IncomingForm({
            encoding: 'utf-8',
            keepExtensions: true,
            maxFieldsSize: 10 * 1024 * 1024,
            uploadDir: config.pick_strategy_dir
        });

        var fields = {};   //各个字段值
        form.on('field', function (field, value) {
            //console.log('upload field: ', field, value);
            fields[field] = value;
        });

        form.on('file', function (field, file) {
            fileName = file.name;
            uploadedPath = file.path;
            console.log('upload file: ', fileName, uploadedPath);
        });

        form.on('fileBegin', function () {
            console.log('begin upload...');
        });

        form.on('end', async function () {
            console.log('upload end: ');
            console.log(fields);

            //参数有效性检查
            if (!fields.file_name){
                res.send({ret_code: 1002, ret_msg: '参数错误', extra: ''});
                fs.unlinkSync(uploadedPath);
                return;
            }

            var query = await DB.MarketTable.findOne({'file_name': fileName}).exec();
            if (query != null){
                console.log('the same file already exist');
                res.send({ret_code: 1008, ret_msg: '失败：同名文件已存在', extra: ''});
                fs.unlinkSync(uploadedPath);
                return;
            }

            console.log('file.rename');
            //重命名为真实文件名
            var dstPath = path.join(config.pick_strategy_dir, fileName);
            fs.rename(uploadedPath, dstPath, function(err) {
                if(err){
                    res.send({ret_code: -1, ret_msg: 'FAILED', extra: err});
                } else {
                    res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: 'upload ok'});

                    var mytime =  new Date();
                    //写入数据库
                    var romDocObj = {
                        "file_name": fileName,
                        "user_account": fields.user_account,
                        "comment": fields.comment,
                        "file_status" : 'normal',  //上架
                        "create_date": dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
                    };

                    //console.log('romDocObj fields: ', romDocObj);
                    DB.MarketTable.create(romDocObj);
                }
            });
        });

        form.on('error', function(err) {
            res.send({ret_code: -1, ret_msg: 'FAILED', extra:"上传出错"});
        });

        form.parse(req);
        console.log('[website] market gateway upload end');

    }

    async revoke(req, res, next){
        console.log('[website] market gateway revoke');

        //获取表单数据，josn
        var id = req.body['_id'];
        //var file_name = req.body['file_name'];


        //参数有效性检查
        if(typeof(id)==="undefined"){
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'用户输入参数无效'});
            return;
        }

        //console.log('_id: ', id);
        //设置下架状态
        var updatestr = {'file_status': 'revoke'};
        var query = await DB.MarketTable.findByIdAndUpdate(id, updatestr);
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: query});
        console.log('[website] market gateway revoke end');

    }


    async release(req, res, next) {
        console.log('[website] market gateway release');

        //获取表单数据，josn
        var id = req.body['_id'];
        //var file_name = req.body['file_name'];

        //参数有效性检查
        if(typeof(id)==="undefined" ){
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'用户输入参数无效'});
            return;
        }

        //console.log('romDocObj fields: ', romDocObj);
        //设置上架状态
        var updatestr = {'file_status': 'normal'};
        var query = await DB.MarketTable.findByIdAndUpdate(id, updatestr);
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: query});
        console.log('[website] market gateway release end');

    }

    async get_bindobj(req, res, next){
        console.log('[website] market gateway get bindobj');

        //更新到设备数据库， 设备上线，下线
        var wherestr = {'is_bind': 'true'};
        var query = await DB.MarketTable.findOne(wherestr).exec();
        if (query == null) {
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:''});
            return;
        }

        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:query['file_name']});
        console.log('[website] market gateway bindobj end');
    }

    async bind(req, res, next){
        console.log('[website] market gateway bind');

        //获取表单数据，josn
        var file_name = req.body['file_name'];
        var is_bind = req.body['is_bind'];        //绑定的行情接口
        var mytime = new Date();

        await DB.MarketTable.update({'is_bind': 'false'}).exec();

        //更新到设备数据库， 设备上线，下线
        var wherestr = {'file_name': file_name};
        var updatestr = {'is_bind': is_bind};
        var query = await DB.MarketTable.findOneAndUpdate(wherestr, updatestr).exec();
        if (query == null) {
            res.send({ret_code: -1, ret_msg: '文件不存在', extra:''});
        }


        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:'ok'});
        console.log('[website] market gateway bind end');
    }


}

module.exports = new MarketGatewayHandle()



//await DB.TaskTable.findOneAndUpdate(wherestr, updatestr).exec();
//await 可以不调用.exec() 返回值
//如果没有转await 则必须调用.exec() 才能返回查询结果,不能通过返回值判断
//如果采用返回值得形式，必须的await

