'use strict';

const express = require('express');
const Admin = require('../controller/admin/admin');
const Check = require('../middlewares/check');
const router = express.Router()

console.log("enter route of admin");

router.all('/login', /*Check.checkAdminStatus,*/ Admin.login);
router.all('/register',Check.checkSuperAdmin, Admin.register);
router.all('/logout', Check.checkAdminStatus,Admin.singout);
router.all('/change',/* Check.checkSuperAdmin,*/ Admin.changePassword);
router.all('/reset', Check.checkSuperAdmin, Admin.resetPassword);
router.all('/revoke',Check.checkSuperAdmin, Admin.revoke);
router.all('/restore',Check.checkSuperAdmin, Admin.restore);
router.all('/all', Check.checkSuperAdmin, Admin.getAllAdmin);
router.all('/query', Check.checkSuperAdmin, Admin.getQueryAdmin);
router.all('/info',Check.checkAdminStatus, Admin.getAdminInfo);
//router.all('/count', Admin.getAdminCount);
//router.all('/update/avatar/:admin_id', Admin.updateAvatar);

module.exports = router
