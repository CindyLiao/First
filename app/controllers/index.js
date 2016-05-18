/**
 * Created by yuzaizai on 2016/4/24.
 */
var Movie = require('../models/Movie');
//index page
exports.index = function(req,res){
    Movie.fetch(function(err, movies){
        if (err) {
            console.log(err);
        }
        res.render('index', {
            title: ' 首页',
            movies: movies
        });
    });
};