/**
 * Created by yuzaizai on 2016/4/17.
 */
var mongoose = require('mongoose');
var OrganRoleSchema = require('../schemas/organRole');
var OrganRole = mongoose.model('OrganRole',OrganRoleSchema);

module.exports = OrganRole;