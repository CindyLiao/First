/**
 * Created by yuzaizai on 2016/4/24.
 */

var Movie = require('../models/movie');
var _ = require('underscore');

//detail page
exports.detail = function(req,res){
    var id = req.params.id;
    Movie.findById(id,function(err,movie){
        res.render('detail',{
            title: '详情页',
            movie: movie
        })
    })

};

//admin update movie
exports.update = function(req,res) {
    var id = req.params.id;
    if(id) {
        Movie.findById(id,function(err,movie){
            res.render('admin',{
                title:'后台更新页面',
                movie:movie
            })
        })
    }
};
//admin post movie
exports.save= function(req,res){
    var id = req.body.movie._id;
    var movieObj = req.body.movie;
    var _movie;
    if(id!= '') { //如果数据已经存在
        Movie.findById(id,function(err,movie){
            if (err) {
                console.log(err);
            }
            _movie = _.extend(movie,movieObj);//用新数据替换掉原有的数据
            _movie.save(function(err,movie){ //保存更新后的数据
                if (err) {
                    console.log(err);
                }
                res.redirect('/movie/'+movie._id);//数据更新完毕之后跳转到展示页面
            })
        })
    } else { //如果数据不存在，则创建新的数据
        _movie = new Movie ({
            doctor: movieObj.docotr,
            title: movieObj.title,
            country: movieObj.country,
            language: movieObj.language,
            year: movieObj.year,
            poster: movieObj.poster,
            summary: movieObj.summary,
            flash: movieObj.flash
        });
        _movie.save(function(err,movie){ //保存更新后的数据
            if (err) {
                console.log(err);
            }
            res.redirect('/movie/'+movie._id);//数据更新完毕之后跳转到展示页面
        })
    }
};

//list page
exports.list = function(req,res){
    Movie.fetch(function(err,movies){
        if (err) {
            console.log(err);
        }
        res.render('list',{
            title: '表单页',
            movies: movies
        })
    });

};

//list delete movie
exports.del = function(req,res){
    var id = req.query.id;
    if(id) {
        Movie.remove({_id: id},function(err,movie) {
            if(err) {
                console.log(err)
            } else {
                res.json({success: 1})
            }
        })
    }
};

//admin new page
exports.new = function(req,res){
    res.render('admin',{
        title: ' 录入页',
        movie: {
            docotr: '',
            country: '',
            title: '',
            year: '',
            poster: '',
            language: '',
            flash: '',
            summary: ''
        }
    })
};
