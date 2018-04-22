'use strict'

const mongoose = require('mongoose');
const ScriptFileSchema = new mongoose.Schema({
    file_name: String,
    file_type: String,     //文件类型，'select'，'trade'， 'riskctrl'，'order'， 'market'
    file_status:String,  // 文件状态，冻结：revoke, 正常：normal
    bind_flag:String,  // 绑定标志：0:未绑定， 1:绑定
    user_account: String,  //策略所属用户帐号
    comment: String,  //备注说明

    create_at:{type: String, default: null},
});



const ScriptFileTable = mongoose.model('ScriptFileTable', ScriptFileSchema);
module.exports = ScriptFileTable;