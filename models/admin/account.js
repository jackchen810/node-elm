'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountSchema = new Schema({
	user_account: String,
	user_password: String,
    user_password_md5: String,
	user_id: Number,
    user_email: String,
	user_phone: String,
	user_create_time: String,
	user_last_login_time: String,
	//user_admin: String,
	user_type: Number, //0:管理员, 1:用户
	user_status: Number, //0:用户正常,1:用户冻结
	user_avatar: {type: String, default: 'default.jpg'},
    login_logs: Array,   //一些上下线的日志信息，辅助定位问题，记录5条
	user_city: String,
});

accountSchema.index({user_id: 1});
const AccountTable = mongoose.model('AccountTable',accountSchema);
module.exports = AccountTable;
