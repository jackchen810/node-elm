'use strict'

const mongoose = require('mongoose');
const PickstockStrategySchema = new mongoose.Schema({
    file_name: String,
    user_account: String,  //策略所属用户帐号
    file_status:String,  // 文件状态，冻结：revoke, 正常：normal
    comment: String,  //备注说明

    create_at:{type: String, default: null},
});



const PickStrategyTable = mongoose.model('PickStrategyTable', PickstockStrategySchema);
module.exports = PickStrategyTable;