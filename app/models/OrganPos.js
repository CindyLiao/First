/**
 * Created by yuzaizai on 2016/11/22.
 */

var mongoose = require('mongoose');
var OrganPosSchema = require('../schemas/OrganPos');
var OrganPos = mongoose.model('OrganPos',OrganPosSchema);

module.exports = OrganPos;