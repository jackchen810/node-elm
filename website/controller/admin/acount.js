'use strict';

const DB = require('../../../models/models');
const BaseComponent = require('../../../prototype/baseComponent');
const crypto = require('crypto');
const dtime = require('time-formater');



class Account extends BaseComponent {
	constructor() {
		super()
		this.login = this.login.bind(this);
		this.register = this.register.bind(this);
		this.changePassword = this.changePassword.bind(this);
		this.revoke = this.revoke.bind(this);
		this.restore = this.restore.bind(this);
		this.getAllAdmin = this.getAllAdmin.bind(this);
		this.logout = this.logout.bind(this);
	    //	this.updateAvatar = this.updateAvatar.bind(this);


		//本地调试, 设置管理员用户及密码
        //if (process.env.NODE_ENV == 'development') {
            this.addDefaultAccount('admin', '123456')
            console.log('add default account')
        //}
	}

    Md5(password) {
        const md5 = crypto.createHash('md5')
        return md5.update(password).digest('hex')
    }

	async login(req, res, next){
		var user_account = req.body.user_account;
		var user_password = req.body.user_password;


        try {
            if(!user_account) {
                throw new Error('账号名错误');
            }else if(!user_password){
                throw new Error('密码错误');
            }
        }catch(err){
            console.log(err.message, err);
            res.send({ret_code: 1, ret_msg: err.message, extra: ''});
            return;
        }

		try {
			const query = await DB.AccountTable.findOne({user_account});
			if(!query) {
                console.log('该用户不存在');
                res.send({ret_code: 1, ret_msg: '用户不存在', extra: ''});
                return;
            }

			if(user_password != query.user_password_md5) {
				console.log('用户登录密码错误', query.user_password_md5);
				res.send({ret_code: 1, ret_msg: '密码错误', extra: ''});
				return;
			}

            if(query.user_status === 1){
                console.log('用户被冻结');
                res.send({ret_code:1011, ret_msg: '你已经被冻结', extra: ''});
                return;
            }

            console.log('登录成功');

            var updatestr = {
                'login_logs': [],
            };

            //复制数组，logs记录上下线日志
            updatestr['login_logs'] = query['login_logs'].slice();
            updatestr['login_logs'].push(dtime().format('YYYY-MM-DD HH:mm:ss'));
            if (updatestr['login_logs'].length > 10){
                updatestr['login_logs'].shift();  //删除数组第一个元素
            }
            await DB.AccountTable.findByIdAndUpdate(query['_id'], updatestr).exec();

            // update session
            req.session.user_account = query.user_account;
            req.session.user_type = query.user_type;

            res.send({ret_code: 0, ret_msg: '欢迎你', extra: query.user_type});

		}catch(err) {
			console.log('登录失败', err);
			res.send({ret_code: 1, ret_msg: '登录失败', extra: ''});
			return;
		}
	}


	async register(req, res, next){
		var user_account = req.body.user_account;
		var user_password = req.body.user_password;
		var user_email = req.body.user_email;
		var user_phone = req.body.user_phone;
		var user_type = 1;   //用户
		var user_status = 0;
		var user_city = req.body.user_city;

		try {
			if(!user_account) {
				throw new Error('账号名错误');
			}else if(!user_password){
				throw new Error('密码错误');
			}
		}catch(err){
			console.log(err.message, err);
			res.send({ret_code: 1, ret_msg: 'GET_ERROR_PARAM', extra: err.message});
			return;
		}


        try{
            const admin = await DB.AccountTable.findOne({user_account});
            if(admin) {
                console.log('用户已经存在');
                res.send({ret_code: 1, ret_msg: '用户已经存在', extra: ''});
                return;
            }

            //const newpassword = this.encryption(user_password);
            const newAdmin = {
                user_account: user_account,
                user_password: user_password,
                user_password_md5: this.Md5(user_password),
                user_email: user_email,
                user_phone: user_phone,
                user_create_time: dtime().format('YYYY-MM-DD HH:mm'),
                user_last_login_time: dtime().format('YYYY-MM-DD HH:mm'),
                user_type: user_type,
                user_status: user_status,
                user_city: user_city,
                user_device_count: 0,
                user_online_count: 0,
                login_logs:[]
            };

            await DB.AccountTable.create(newAdmin);
            res.send({ret_code: 0, ret_msg: '注册成功', extra: ''})

        }catch(err){
            console.log('注册失败', err);
            res.send({ret_code: 1, ret_msg: '注册失败', extra: ''})
        }
	}

	async changePassword(req, res, next){
        console.log('[website] account changePassword');
	//	var user_account = req.body.user_account;
		var user_account = req.session.user_account;
		var user_password = req.body.user_password;
		var user_new_password =req.body.user_new_password;
		try{
			if(!user_account){
				throw new Error('请登录用户账号');
			}else if(!user_password) {
				throw new Error('请输入用户密码');
			}
		}catch(err){
			console.log(err.message, err);
			res.send({ret_code: 1,ret_msg: 'GET_ERROR_PARAM',extra: err.message});
			return;
		}
		//const password = this.encryption(user_password);

		try{
            var wherestr = {'user_account': user_account};
			const admin = await DB.AccountTable.findOne(wherestr);
			if(!admin) {
                console.log('用户不存在');
                res.send({ret_code: 1, ret_msg: '用户不存在', extra: ''});
                return;
            }
            if(user_password != admin.user_password_md5) {
				console.log('密码错误');
				res.send({ret_code: 1,ret_msg: '密码错误',extra: ''});
				return;
			}

            var updatestr = {
				'user_password': user_new_password,
                'user_password_md5': this.Md5(user_new_password),
			};

            await DB.AccountTable.findByIdAndUpdate(admin['_id'], updatestr);
            console.log('修改密码成功');
            res.send({ret_code: 0,ret_msg: '修改密码成功',extra: ''});

		}catch(err){
			console.log('修改用户密码失败');
			res.send({ret_code: 1,ret_msg: '修改用户密码失败',extra: ''});
			return;
		}
        console.log('[website] account changePassword end');
	}

	async revoke(req, res, next){
        console.log('[website] account revoke');
		try{
            var wherestr = {'user_account': req.body.user_account};
			const admin = await DB.AccountTable.findOne(wherestr);
			if(!admin){
				console.log('用户不存在');
                res.send({ret_code: 1,ret_msg: '用户不存在',extra: ''});
                return;
			}

			if(admin.user_type === 0){
				console.log('管理员不能冻结');
				res.send({ret_code: 1,ret_msg: '管理员不能冻结',extra:''});
				return;
			}

            var updatestr = {'user_status': 1};
            await DB.AccountTable.findByIdAndUpdate(admin['_id'], updatestr);
            res.send({ret_code: 0,ret_msg: '用户已冻结',extra: '',});
            console.log('用户已冻结');
		}catch(err){
			console.log('冻结用户失败', err);
			res.send({ret_code: 1,ret_msg: '冻结用户失败',extra: ''});
		}

        console.log('[website] account revoke end');
	}

	async restore(req, res, next){
        console.log('[website] account restore');
		try{
            var wherestr = {'user_account': req.body.user_account};
			const admin = await DB.AccountTable.findOne(wherestr);
			if(!admin){
				console.log('用户不存在');
				res.send({ret_code: 1,ret_msg: '用户不存在',extra: ''});
				return;
			}

			if(admin.user_type === 0){
				console.log('管理员不需要解冻');
				res.send({ret_code:1,ret_msg:'管理员不需要解冻',extra:''});
				return;
			}

            var updatestr = {'user_status': 0};
            await DB.AccountTable.findByIdAndUpdate(admin['_id'], updatestr);
            res.send({ret_code: 0,ret_msg: '用户已解冻',extra: ''});
            console.log('用户已解冻');
		}catch(err){
			console.log('解冻用户失败')
			res.send({ret_code: 1,ret_msg: '解冻用户失败',extra: ''})
		}

        console.log('[website] account restore end');
	}
	async logout(req, res, next){
        console.log('[website] account logout');
		try{
			delete req.session.user_account;
			delete req.session.user_type;
			res.send({ret_code: 0,ret_msg: '退出成功',extra: ''});
		}catch(err){
			console.log('退出失败', err);
			res.send({ret_code: 1,ret_msg: '退出失败',extra: ''});
		}
        console.log('[website] account end');
	}

	async getAllAdmin(req, res, next) {
        console.log('[website] account list');
        //console.log(req.body);

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
        //console.log('filter ', filter);
        var total = await DB.AccountTable.count(filter).exec();

        //参数有效性检查
        if(typeof(page_size)==="undefined" && typeof(current_page)==="undefined"){
            var queryList = await DB.AccountTable.find(filter).sort(sort);
            //console.log('queryList ', queryList);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:queryList, total:total});
        }
        else if (page_size > 0 && current_page > 0) {
            var skipnum = (current_page - 1) * page_size;   //跳过数
            var queryList = await DB.AccountTable.find(filter).sort(sort).skip(skipnum).limit(page_size);
            //console.log('queryList ', queryList);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:queryList, total:total});
        }
        else{
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'josn para invalid'});
        }

        console.log('[website] account list end');
	}



    async addDefaultAccount(user_account, user_password) {

        //await DB.AccountTable.findOneAndRemove({'user_account': user_account});

        try {
            const admin = await DB.AccountTable.findOne({'user_account': user_account});
            if (admin == null) {
                const newAdmin = {
                    'user_account': user_account,
                    'user_password': user_password,
                    'user_password_md5': this.Md5(user_password),
                    'user_email':'chenzejun',
                    'user_phone':'18211162033',
                    'user_create_time': dtime().format('YYYY-MM-DD HH:mm'),
                    'user_last_login_time': dtime().format('YYYY-MM-DD HH:mm'),
                    'user_type':0,
                    'user_status':0,
                    'user_city':'beijing',
                    'user_device_count': 0,
                    'user_online_count': 0,
                    'login_logs':[]
                };
                await DB.AccountTable.create(newAdmin);
            }
        } catch (err) {
            console.log('注册失败', err);
        }


    }


}

module.exports = new Account();

