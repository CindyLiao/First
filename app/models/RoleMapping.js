/**
 * Created by yuzaizai on 2016/11/7.
 */
// 模型编译
var  mongoose = require('mongoose');
var RoleMappSchema = require('../schemas/RoleMapping');
var RoleMapp = mongoose.model('RoleMapp',RoleMappSchema);

module.exports = RoleMapp;