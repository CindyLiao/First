/**
 * Created by yuzaizai on 2016/4/24.
 */
var User = require('../models/User');
var request = require('request');
var CryptoJS = require('crypto-js');
var OrganPos = require('../models/OrganPos');

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
            _user.type = "admin";
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

exports.getCollabUser = function(req,res) {
    var _collabUserUri=req.body.user.collabUserUri;
    var _user = req.session.user;
    _user.collabUserUri  = _collabUserUri;
    if ( _user) {
        // 更新字段collabUserUri
        User.where({_id:_user._id}).update({collabUserUri:_collabUserUri},function(error,user){
            if (error) {
                res.render('Error',{
                    message:"用户信息更新出错！"+error
                })
            }
            if (user) {
                request.get({url:_collabUserUri},function (err, EmpList) {
                    if (err) {
                        res.render('Error',{
                            message:_collabUserUri+"用户信息读取出错！"+err
                        })
                    }
                    var _empsListString = EmpList.body; // json格式的Employees对象数组 {"employees"，[{"empId":"123","name":"test1","password":"123456"}]}
                    var empObjects = JSON.parse(_empsListString); // 将json字符串转成对象
                    var _empListArray = new Array();
                    if ( empObjects.employees ) {
                        var _index =0;
                        var _empLen = empObjects.employees.length;
                        for ( var i=0; i < _empLen ; i++ ) {
                            OrganPos.find({empId:empObjects.employees[_index].empId},function(error,positions) {
                                var _userNew = new Object();
                                _userNew.name = empObjects.employees[_index].name;
                                _userNew.empId = empObjects.employees[_index].empId;
                                _userNew.belongTo = _user._id.toString();
                                if (error) {
                                    res.render('Error',{
                                        message:_collabUserUri+"用户职位信息读取出错！"+error
                                    })
                                }
                                if (positions != null  && positions.length > 0 ) {
                                    _userNew.position = positions;
                                    _empListArray.push(_userNew);
                                }
                                if ( _index == _empLen-1 ) {
                                    res.render('showCollaboration',{
                                        empList: _empListArray
                                    })
                                }
                                _index++;
                            })
                        }

                    }
                })
            }
        });
    }
};

exports.registerCollabUser = function (req,res) {
    var keyHex = CryptoJS.enc.Utf8.parse("127.0.0.1");  // 密钥127.0.0.1
// direct decrypt ciphertext
    var decrypted = CryptoJS.DES.decrypt({  // 解密
        ciphertext: CryptoJS.enc.Base64.parse(empObjects.employees[i].password)
    }, keyHex, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    _userNew.password = decrypted.toString(CryptoJS.enc.Utf8);
};
