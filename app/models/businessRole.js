var  mongoose = require('mongoose');
var BusiRoleSchema = require('../schemas/businessRole');
var BusiRole = mongoose.model('BusiRole',BusiRoleSchema);

module.exports = BusiRole;