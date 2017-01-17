var  mongoose = require('mongoose');
var BusiRoleSchema = require('../schemas/BusinessRole');
var BusiRole = mongoose.model('BusiRole',BusiRoleSchema);

module.exports = BusiRole;