/**
 * Created by yuzaizai on 2016/5/24.
 */
var User = require('../models/application');

var request = require('request');

//show applicatlion signup
exports.showSignup = function (req,res) {
    res.render('appSignup',{
        title: "应用注册页面"
    })
};

exports.appSignup = function(req,res) {
    var _application = req.body.application;
    Organ.findOne({appName:_application.appName},function(err,appli){
        if (err){
            console.log(err);
        }
        if (appli){//判断应用是否已经存在
            return res.redirect('/');
        } else { //不存在则将保存组织信息
            appli = new Organ(_application);
            appli.save(function(err,appli){
                if (err) {
                    console.log(err);
                }
                if(appli){
                    req.session.appli = appli;
                    res.redirect('/approle/addAppRole');
                }
            });
        }
    });
    console.log(_organization);

};