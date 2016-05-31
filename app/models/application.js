/**
 * Created by yuzaizai on 2016/5/24.
 */
var mongoose = require('mongoose');
var AppliSchema = require('../schemas/application');
var Appli = mongoose.model('Appli', AppliSchema);

module.exports = Appli;