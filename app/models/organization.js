/**
 * Created by yuzaizai on 2016/5/24.
 */
/**
 * Created by yuzaizai on 2016/4/17.
 */
var mongoose = require('mongoose');
var OrganSchema = require('../schemas/organization');
var Organ = mongoose.model('Organ',OrganSchema);

module.exports = Organ;