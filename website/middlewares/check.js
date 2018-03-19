'use strict';

import AdminModel from '../../models/admin/admin'

class Check {
	constructor(){
		
	}
	async checkSuperAdmin(req, res, next){

        //本地调试
        if (process.env.NODE_ENV == 'local') {
            next();
            return;
        }

        const admin_id = req.session.admin_id;
		if (!admin_id || !Number(admin_id)) {
			res.send({
				ret_code: 1001,
				ret_msg: 'ERROR_SESSION',
				extra: '亲，您还没有登录',
			});
			return;
		}else{
			const admin = await AdminModel.findOne({user_id: admin_id});
			if (!admin || admin.user_type != 0) {
				res.send({
					ret_code: 1010,
					ret_msg: 'HAS_NO_ACCESS',
					extra: '权限不足',
				});
				return;
			}
		}
		next()
	}
	async checkAdminStatus(req, res, next){
		const admin_id = req.session.admin_id;
		if (!admin_id || !Number(admin_id)) {
			res.send({
				ret_code: 1001,
				ret_msg: 'ERROR_SESSION',
				extra: '亲，您还没有登录',
			});
			return;
		}else{
			const admin = await AdminModel.findOne({user_id: admin_id});
			if (!admin || admin.user_status != 0) {
				res.send({
					ret_code: 1011,
					ret_msg: 'ERROR_ADMIN_STATUS',
					extra: '你已经被冻结',
				});
				return;
			}
		}
		next()
	}
}

export default new Check()
