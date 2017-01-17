
/**
 * Created by yuzaizai on 2016/4/17.
 */
var mongoose = require('mongoose');
var MappSchema = require('../schemas/Mapping');
var Mapp = mongoose.model('Mapp',MappSchema);

module.exports = Mapp;