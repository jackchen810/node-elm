'use strict';

const AdminModel = require('../../models/admin/account');

class Check {
	constructor(){
		
	}
	async checkSuperAdmin(req, res, next){

        //本地调试
        if (process.env.NODE_ENV == 'local') {
            next();
            return;
        }

        const user_account = req.session.user_account;

        console.log('user_account:', user_account);
        const admin = await AdminModel.findOne({user_account: user_account});
        if (!admin || admin.user_type != 0) {
            res.send({ret_code: 1010,	ret_msg: '权限不足', extra: ''});
            return;
        }

		next()
	}
	async checkAdminStatus(req, res, next){

        //本地调试
        if (process.env.NODE_ENV == 'local') {
            next();
            return;
        }

        const user_account = req.session.user_account;
        //console.log('req.session:', req.session);
        //console.log('user_account:', req.session.user_account);
        //console.log('baseUrl:',  req.baseUrl);
        //console.log('originalUrl:', req.originalUrl);
        if (req.baseUrl == '/api/admin/login' || req.baseUrl == '/api/admin/register'
            || req.originalUrl == '/') {
            console.log('login:', req.baseUrl,  req.originalUrl);
            next()
            return;
        }

        // session 超时后数据清除，不允许再访问
        if (!user_account) {
            res.send({ret_code: 2000, ret_msg: '会话超时', extra: ''});
            return;
        }

        const admin = await AdminModel.findOne({user_account: user_account});
        if (!admin) {
            res.send({ret_code: 1011, ret_msg: '用户不存在', extra: ''});
            return;
        }


        if (admin.user_status != 0) {
            res.send({ret_code: 1012, ret_msg: '你已经被冻结', extra: ''});
            return;
        }

        //设置cookie
        res.setHeader("Set-Cookie", ["user_type="+admin.user_type, "user_account="+admin.user_account]);
        next()
	}
}

module.exports = new Check()
