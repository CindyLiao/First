
/**
 * Created by yuzaizai on 2016/4/17.
 */
var mongoose = require('mongoose');
var MovieSchema = require('../schemas/Movie');
var Movie = mongoose.model('Movie',MovieSchema);

module.exports = Movie;