/**
 * Created by yuzaizai on 2016/4/24.
 */
var User = require('../models/User');


//show Signup
exports.showSignup = function(req,res) {
    res.render('Signup',{
        title: '注册页面'
    })
};

//show Signin
exports.showSignin = function(req,res) {
    res.render('Signin',{
        title: '登录页面'
    })
};

//signin
exports.signin= function(req,res){
    var _user=req.body.user;
    var name=_user.name;
    var password= _user.password;
    User.findOne({name:name},function(err,user){
        if (err){
            console.log(err);
        }
        if(!user) {
            res.redirect("/signup");
        }
        else {
            user.comparePassword(password,function(err,isMatch){
                if(err){
                    console.log(err);
                }
                if(isMatch){
                    req.session.user = user;
                    res.redirect('/user/userpage');
                } else {
                    res.redirect('/signin');
                }
            });
        }
    })
};


//signup
exports.signup = function(req,res){
    var _user = req.body.user;

    User.findOne({name:_user.name},function(err,user){
        if (err){
            console.log(err);
        }
        if (user){
            return res.redirect('/signin');
        } else {
            user = new User(_user);
            user.save(function(err,user){
                if (err) {
                    console.log(err);
                }
                else {
                    req.session.user = user;
                    res.redirect('/organ/showsignup');
                }

            });
        }
    });
    console.log(_user);
};

// midware for user
exports.signinRequired = function(req, res, next) {
    var user = req.session.user;

    if (!user) {
        return res.redirect('/signin')
    }
    req.session.user = user;
    next();
};
exports.adminRequired = function(req, res, next) {
    var user = req.session.user;

    if (user.role <= 10) {
        return res.redirect('/signin')
    }
    next()
};
//logout
exports.logout = function(req,res){
    delete req.session.user;
  //  app.locals.user=null;
    res.redirect('/');
};

//userlist page
exports.list = function(req,res){
    User.fetch(function(err,users){
        if (err) {
            console.log(err);
        }
        res.render('UserList',{
            title:'用户管理页',
            users: users
        })
    })
};

// userPage
exports.userPage = function(req,res) {
   res.render('UserPage',{
       title: '用户详情页'
   })
};