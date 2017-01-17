/**
 * Created by yuzaizai on 2016/11/22.
 */
// 模式编译成模型
var mongoose = require('mongoose');
var OrganDepSchema = require('../schemas/OrganDep');
var OrganDep = mongoose.model('OrganDep',OrganDepSchema);

module.exports = OrganDep;







