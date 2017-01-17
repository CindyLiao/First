/**
 * Created by yuzaizai on 2016/12/28.
 */
var  mongoose = require('mongoose');
var  CacheDataSchema = require('../schemas/CacheData');
var  CacheData = mongoose.model('CacheData',CacheDataSchema);

module.exports = CacheData;