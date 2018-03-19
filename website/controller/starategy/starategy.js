'use strict';
import DB from "../../../models/models.js";
import config from 'config-lite';
const fs = require("fs");
const path = require('path');


class StrategyHandle {
    constructor(){

    }
    async list(req, res, next){
        console.log('strategy list');


        try {
            var path = config.strategy_dir;
            var files = fs.readdirSync(path);
            console.log('files', files);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:files});
        }
        catch (e) {
            console.log(e);
            res.send({ret_code: -1, ret_msg: 'FAILED', extra:e});
            return;
        }

        console.log('strategy list end');
    }


    async download(req, res) {
        console.log('rom download');

        //获取表单数据，josn
        var id = req.body['_id'];
        var file_name = req.body['file_name'];

        //参数有效性检查
        if (typeof(id) === "undefined" || typeof(file_name) === "undefined") {
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra: 'josn para invalid'});
            return;
        }

        //console.log('request fields: id:', id);
        //检查上下架状态
        try {
            var query = await DB.StrategyTable.findById(id).exec();
            console.log('query rom_status:', query['rom_status'] );
            if (query['rom_status'] == 'revoke') {  //下架状态
                res.send({ret_code: 1003, ret_msg: 'FAILED', extra: 'rom is revoked'});
                return;
            }
        }
        catch(err){
            await res.send({ret_code: -1, ret_msg: 'FAILED', extra:err});
            return;
        }

        // 实现文件下载
        var filePath = path.join(config.strategy_dir, file_name);
        res.download(filePath, file_name, function(err){
            if(err){
                //处理错误，可能只有部分内容被传输，所以检查一下res.headerSent
                res.send({ret_code: -1, ret_msg: 'FAILED', extra:err});
            }else{
                //减少下载的积分值之类的。
                //res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: 'download ok'});
            }
        });
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

        console.log('upload');
        //console.log(req);

        //生成multiparty对象，并配置上传目标路径
        /*
        fields： 是一个对象（上传名称和值），其属性名的字段名称和值是字段值的数组。
        files ：是一个对象（上传名称和服务器文件路径），其属性名的字段名称和值是文件对象的数组。
        */

        //var form = new multiparty.Form({uploadDir: config.strategy_dir});
        var fileName = '';
        var uploadedPath = '';
        var fileMatch = -1;
        var form = new formidable.IncomingForm({
            encoding: 'utf-8',
            keepExtensions: true,
            maxFieldsSize: 10 * 1024 * 1024,
            uploadDir: config.strategy_dir
        });

        var fields = {};   //各个字段值
        form.on('field', function (field, value) {
            //console.log('upload field: ', field, value);
            fields[field] = value;
        });

        form.on('file', function (field, file) {
            fileName = file.name;
            uploadedPath = file.path
            console.log('upload file: ', fileName, uploadedPath);
        });

        form.on('fileBegin', function () {
            console.log('begin upload...');
        });

        form.on('end', function () {
            console.log('upload end: ');
            //console.log(fields);

            //参数有效性检查
            if (typeof(fields.md5_value) === "alias_name" || fields.alias_name == "" ){
                res.send({ret_code: 1002, ret_msg: 'FAILED', extra: 'josn para invalid'});
                fs.unlinkSync(uploadedPath);
                return;
            }

            //文件和设备类型检查，读取文件前64字节
            var readable  = fs.createReadStream(uploadedPath, { start: 0, end: 80 });
            readable.on('data', function(chunk){
                fileMatch = chunk.indexOf(fields.dev_type.toUpperCase());
                console.log('read %d, match', chunk.length, fileMatch);
            });

            readable.on('end', async function(){
                console.log('read end');
                if (fileMatch < 0){
                    console.log('romfile is not match dev_type');
                    res.send({ret_code: 1008, ret_msg: 'FAILED', extra: '设备类型和文件不匹配'});
                    fs.unlinkSync(uploadedPath);
                    return;
                }

                var query = await DB.StrategyTable.findOne({'file_name': fileName}).exec();
                if (query != null){
                    console.log('the same file already exist');
                    res.send({ret_code: 1008, ret_msg: 'FAILED', extra: '同名文件已存在'});
                    fs.unlinkSync(uploadedPath);
                    return;
                }

                console.log('fs.rename');
                //重命名为真实文件名
                var dstPath = path.join(config.strategy_dir, fileName);
                fs.rename(uploadedPath, dstPath, function(err) {
                    if(err){
                        res.send({ret_code: -1, ret_msg: 'FAILED', extra: err});
                    } else {
                        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: 'upload ok'});

                        var mytime =  new Date();
                        //写入数据库
                        var romDocObj = {
                            "file_name": fileName,
                            "alias_name" : fields.alias_name,
                            "rom_status" : 'normal',  //上架
                            "create_date": dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
                            'sort_time':mytime.getTime(),
                        };

                        //console.log('romDocObj fields: ', romDocObj);
                        DB.StrategyTable.create(romDocObj);
                    }
                });
            });

        });

        form.on('error', function(err) {
            res.send({ret_code: -1, ret_msg: 'FAILED', extra:"上传出错"});
        });

        form.parse(req);
        console.log('upload ok');

    }

    async del(req, res, next) {

        console.log('rom delete');
        //console.log(req.body);

        //获取表单数据，josn
        var id = req.body['_id'];
        var file_name = req.body['file_name'];

        //参数有效性检查
        if(typeof(id)==="undefined" || typeof(file_name)==="undefined" ){
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
            return;
        }

        try{
            var query = await DB.StrategyTable.findByIdAndRemove (id);
            var filePath = path.join(config.strategy_dir, file_name);
            fs.unlink(filePath, function(err) {
                if (err){
                    res.send({ret_code: -1, ret_msg: 'FAILED', extra:err});
                }
                else{
                    res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:'delete ok'});
                }
            });
        }catch(err){
            res.send({ret_code: -1, ret_msg: 'FAILED', extra:err});
        }
        console.log('rom delete end');

    }


    async revoke(req, res, next){
        console.log('rom revoke');

        //获取表单数据，josn
        var id = req.body['_id'];
        //var file_name = req.body['file_name'];


        //参数有效性检查
        if(typeof(id)==="undefined"){
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
            return;
        }

        //console.log('_id: ', id);
        //设置下架状态
        var updatestr = {'rom_status': 'revoke'};
        var query = await DB.StrategyTable.findByIdAndUpdate(id, updatestr);
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: query});

    }


    async release(req, res, next) {
        console.log('rom release');

        //获取表单数据，josn
        var id = req.body['_id'];
        //var file_name = req.body['file_name'];

        //参数有效性检查
        if(typeof(id)==="undefined" ){
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
            return;
        }

        //console.log('romDocObj fields: ', romDocObj);
        //设置上架状态
        var updatestr = {'rom_status': 'normal'};
        var query = await DB.StrategyTable.findByIdAndUpdate(id, updatestr);
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: query});

    }


}

export default new StrategyHandle()



//await DB.TaskTable.findOneAndUpdate(wherestr, updatestr).exec();
//await 可以不调用.exec() 返回值
//如果没有转await 则必须调用.exec() 才能返回查询结果,不能通过返回值判断
//如果采用返回值得形式，必须的await

