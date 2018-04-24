'use strict';
const DB = require('../../../models/models.js');
const dtime = require('time-formater');
const config = require('config-lite');

const fs = require("fs");
const path = require('path');
const multiparty = require('multiparty');
const formidable = require('formidable');

class ScriptFileHandle {
    constructor(){
        //绑定，this
        this.list = this.list.bind(this);
        this.del = this.del.bind(this);
        this.upload = this.upload.bind(this);
        this.download = this.download.bind(this);
        this.sync = this.sync.bind(this);
        this.sync_file = this.sync_file.bind(this);
        this.all_file = this.all_file.bind(this);
    }


    async all_file(req, res, next){
        console.log('[website] file list');

        try {
            var path = this.get_dest_fullname('select');
            var select = fs.readdirSync(path);
            var path = this.get_dest_fullname('trade');
            var trade = fs.readdirSync(path);
            var path = this.get_dest_fullname('riskctrl');
            var riskctrl = fs.readdirSync(path);
            var path = this.get_dest_fullname('order');
            var order = fs.readdirSync(path);
            var path = this.get_dest_fullname('market');
            var market = fs.readdirSync(path);
            var objList ={
                'select': select,
                'trade': trade,
                'riskctrl': riskctrl,
                'order': order,
                'market': market,
            }
            //console.log('files', files);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:objList});
        }
        catch (e) {
            console.log(e);
            res.send({ret_code: -1, ret_msg: 'FAILED', extra:e});
            return;
        }

        console.log('[website] file list end');
    }

    async all_doc(req, res, next){
        console.log('[website] all doc list');

        try {
            var queryList = await DB.ScriptFileTable.find();
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:queryList});
        }
        catch (e) {
            res.send({ret_code: -1, ret_msg: 'FAILED', extra:[]});
            return;
        }
        console.log('[website] all doc list end');
    }

    async file_list(req, res, next){
        console.log('[website] file list');
        //获取表单数据，josn
        var page_size = req.body['page_size'];
        var current_page = req.body['current_page'];
        var sort = req.body['sort'];
        var filter = req.body['filter'];

        // 如果没有定义排序规则，添加默认排序
        if(typeof(sort)==="undefined"){
            //console.log('sort undefined');
            sort = {"sort_time":-1};
        }

        // 如果没有定义排序规则，添加默认排序
        if(typeof(filter)==="undefined"){
            //console.log('filter undefined');
            filter = {};
        }

        //console.log('sort ', sort);
        console.log('filter ', filter);
        var total = await DB.ScriptFileTable.count(filter).exec();

        //参数有效性检查
        if(typeof(page_size)==="undefined" && typeof(current_page)==="undefined"){
            var queryList = await DB.ScriptFileTable.find(filter).sort(sort);
            var fileList = [];
            for (var i = 0; i < queryList.length; i++){
                fileList.push(queryList[i].file_name);
            }
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:fileList, total:total});
        }
        else if (page_size > 0 && current_page > 0) {
            var skipnum = (current_page - 1) * page_size;   //跳过数
            var queryList = await DB.ScriptFileTable.find(filter).sort(sort).skip(skipnum).limit(page_size);
            var fileList = [];
            for (var i = 0; i < queryList.length; i++){
                fileList.push(queryList[i].file_name);
            }
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:fileList, total:total});
        }
        else{
            res.send({ret_code: 1002, ret_msg: '参数错误', extra:''});
        }

        console.log('[website] file list end');
    }


    async list(req, res, next){
        console.log('[website] script list');
        //获取表单数据，josn
        var page_size = req.body['page_size'];
        var current_page = req.body['current_page'];
        var sort = req.body['sort'];
        var filter = req.body['filter'];

        // 如果没有定义排序规则，添加默认排序
        if(typeof(sort)==="undefined"){
            //console.log('sort undefined');
            sort = {"sort_time":-1};
        }

        // 如果没有定义排序规则，添加默认排序
        if(typeof(filter)==="undefined"){
            //console.log('filter undefined');
            filter = {};
        }

        //console.log('sort ', sort);
        console.log('filter ', filter);
        var total = await DB.ScriptFileTable.count(filter).exec();

        //参数有效性检查
        if(typeof(page_size)==="undefined" && typeof(current_page)==="undefined"){
            var queryList = await DB.ScriptFileTable.find(filter).sort(sort);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:queryList, total:total});
        }
        else if (page_size > 0 && current_page > 0) {
            var skipnum = (current_page - 1) * page_size;   //跳过数
            var queryList = await DB.ScriptFileTable.find(filter).sort(sort).skip(skipnum).limit(page_size);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:queryList, total:total});
        }
        else{
            res.send({ret_code: 1002, ret_msg: '参数错误', extra:'josn para invalid'});
        }

        console.log('[website] script list end');
    }


    async del(req, res, next){
        console.log('[website] script del');
        //获取表单数据，josn
        var file_name = req.body['file_name'];
        var file_type = req.body['file_type'];
        var user_account = req.body['user_account'];

        // 如果没有定义排序规则，添加默认排序
        if(!file_name){
            //console.log('sort undefined');
        }

        console.log('file_name:', file_name);
        var wherestr = {'file_name': file_name, 'file_type': file_type, 'user_account': user_account};
        await DB.ScriptFileTable.remove(wherestr).exec();

        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:file_name});
        console.log('[website] script del end');
    }


    async download(req, res, next) {
        console.log('[website] script download');

        //获取表单数据，josn
        var id = req.body['_id'];
        var file_name = req.body['file_name'];
        var file_type = req.body['file_type'];

        //参数有效性检查
        if (typeof(id) === "undefined" || typeof(file_name) === "undefined") {
            res.send({ret_code: 1002, ret_msg: '参数错误', extra: 'josn para invalid'});
            return;
        }

        //console.log('request fields: id:', id);
        //检查上下架状态
        try {
            var query = await DB.ScriptFileTable.findById(id).exec();
            //console.log('query file_status:', query['file_status']);
            if (query['file_status'] == 'revoke') {  //下架状态
                res.send({ret_code: 1003, ret_msg: '策略已下架', extra: file_name});
                return;
            }

            // 实现文件下载
            if (query['file_name'] != file_name){
                res.send({ret_code: 1016, ret_msg: '文件名称错误', extra: file_name});
                return;
            }
        }
        catch(err){
            await res.send({ret_code: -1, ret_msg: 'FAILED', extra:err});
            return;
        }

        //直接返回路径，通过访问文件进行下载
        //var access_path = '/pick-strategy/' + file_name;
        //console.log('query access_path:', access_path);
        var my_path = this.get_dest_fullname(file_type).split("/");
        var access_path = '/' + my_path.pop() + '/' + file_name;
        //console.log('query my_path:', my_path);
        console.log('query access_path:', access_path);
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:{'access_path':access_path}});

        console.log('[website] script download end');
    }

    get_dest_fullname(file_type){

        var basePath = '';
        if (file_type == 'select'){
            basePath = config.pick_strategy_dir;
        }
        else if(file_type == 'trade'){
            basePath = config.strategy_dir;
        }
        else if(file_type == 'riskctrl'){
            basePath = config.riskctrl_dir;
        }
        else if(file_type == 'order'){
            basePath = config.order_gateway_dir;
        }
        else if(file_type == 'market'){
            basePath = config.market_gateway_dir;
        }
        return basePath;
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
    async upload(req, res, next){

        console.log('[website] script upload');
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
            uploadDir: config.firmware_dir
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

        var self = this;
        form.on('end', async function () {
            console.log('upload end: ');
            console.log(fields);

            //参数有效性检查
            if (!fields.file_name){
                res.send({ret_code: 1002, ret_msg: '参数错误', extra: ''});
                fs.unlinkSync(uploadedPath);
                return;
            }

            var wherestr = {
                'file_name': fileName,
                'file_type':fields.file_type,
                'user_account':fields.user_account
            };
            var query = await DB.ScriptFileTable.findOne(wherestr).exec();
            if (query != null){
                console.log('the same file already exist');
                res.send({ret_code: 1008, ret_msg: '失败：同名文件已存在', extra: ''});
                fs.unlinkSync(uploadedPath);
                return;
            }

            console.log('file.rename');
            //重命名为真实文件名
            var dstPath = path.join(self.get_dest_fullname(fields.file_type), fileName);
            //console.log(dstPath);
            fs.rename(uploadedPath, dstPath, function(err) {
                if(err){
                    res.send({ret_code: -1, ret_msg: 'FAILED', extra: err});
                } else {
                    res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: 'upload ok'});

                    //写入数据库
                    var docObj = {
                        "file_name": fileName,
                        "file_type": fields.file_type,
                        "file_status" : 'normal',  //上架
                        "user_account": fields.user_account,
                        "comment": fields.comment,
                        "create_date": dtime().format('YYYY-MM-DD HH:mm:ss'),
                    };

                    //console.log('docObj fields: ', docObj);
                    DB.ScriptFileTable.create(docObj);
                }
            });
        });

        form.on('error', function(err) {
            res.send({ret_code: -1, ret_msg: 'FAILED', extra:"上传出错"});
        });

        form.parse(req);
        console.log('[website] script upload end');

    }

    async revoke(req, res, next){
        console.log('[website] script revoke');

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
        var query = await DB.ScriptFileTable.findByIdAndUpdate(id, updatestr);
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: query});
        console.log('[website] script revoke end');

    }


    async release(req, res, next) {
        console.log('[website] script release');

        //获取表单数据，josn
        var id = req.body['_id'];
        //var file_name = req.body['file_name'];

        //参数有效性检查
        if(typeof(id)==="undefined" ){
            res.send({ret_code: 1002, ret_msg: '用户输入参数无效', extra:''});
            return;
        }

        //console.log('docObj fields: ', docObj);
        //设置上架状态
        var updatestr = {'file_status': 'normal'};
        var query = await DB.ScriptFileTable.findByIdAndUpdate(id, updatestr);
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: query});
        console.log('[website] script release end');

    }

    async sync_file(user_account, path) {

        var file_type = '';
        if (path == config.pick_strategy_dir){
            file_type = 'select';
        }
        else if(path == config.strategy_dir){
            file_type = 'trade';
        }
        else if(path == config.riskctrl_dir){
            file_type = 'riskctrl';
        }
        else if(path == config.order_gateway_dir){
            file_type = 'order';
        }
        else if(path == config.market_gateway_dir){
            file_type = 'market';
        }


        //删除文件目录中不存在的记录
        var files = fs.readdirSync(path);
        var queryList = await DB.ScriptFileTable.find({file_type: file_type});
        for (var i = 0; i < queryList.length; i++){

            var file_name = queryList[i].file_name;

            // 判断文件目录下是否有该文件，如果没有就删除数据库记录
            for(var m = 0; m < files.length; m++){
                if (file_name == files[i]){  //找到文件
                    break;
                }
            }

            //没有找到， 删除数据库记录
            if (m == files.length){
                //console.log('docObj fields: ', docObj);
                await DB.ScriptFileTable.findByIdAndRemove(queryList[i]._id);
            }
        }

        //添加文件目录下的文件到数据库中
        for (var i = 0; i < files.length; i++){
            //console.log('ready to add file_name: ', files[i]);
            var wherestr = {'file_name': files[i], file_type: file_type};
            var query = await DB.ScriptFileTable.findOne(wherestr);
            if (query != null){
                continue;
            }

            //写入数据库
            var docObj = {
                "file_name": files[i],
                "file_type": file_type,
                "file_status" : 'normal',  //上架
                "user_account": user_account,
                "comment": 'sync',
                "create_date": dtime().format('YYYY-MM-DD HH:mm:ss'),
            };

            //console.log('docObj fields: ', docObj);
            await DB.ScriptFileTable.create(docObj, function(error){
                console.log("保存成功", error);
            });
            //console.log('add ok file_name: ', docObj);
        }

    }

    async sync(req, res, next) {
        console.log('[website] script sync');
        var user_account = req.session.user_account;

        await this.sync_file(user_account, config.pick_strategy_dir);
        await this.sync_file(user_account, config.strategy_dir);
        await this.sync_file(user_account, config.riskctrl_dir);
        await this.sync_file(user_account, config.order_gateway_dir);
        await this.sync_file(user_account, config.market_gateway_dir);

        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: ''});
        console.log('[website] script sync end');
    }
}

module.exports = new ScriptFileHandle()



//await DB.TaskTable.findOneAndUpdate(wherestr, updatestr).exec();
//await 可以不调用.exec() 返回值
//如果没有转await 则必须调用.exec() 才能返回查询结果,不能通过返回值判断
//如果采用返回值得形式，必须的await

