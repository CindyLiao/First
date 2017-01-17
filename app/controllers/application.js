/**
 * Created by yuzaizai on 2016/5/24.
 */
var Appli = require('../models/Application');
var BusiRole = require('../models/BusinessRole');
var request = require('request');

//show applicatlion signup
exports.showSignup = function (req,res) {
    res.render('RegisterApp',{
        title: "应用注册页面"
    })
};

exports.appSignup = function(req,res) {
    var _application = req.body.application;
    Appli.findOne({appName:_application.appName},function(err,appli){
        if (err){
            console.log(err);
        }
        if (appli){//判断应用名是否已经存在
            console.log(_application.appName+"已经存在！");
            return res.redirect('/app/ShowSignup');
        } else { //不存在则将保存应用组织信息
            appli = new Appli(_application);
            appli.save(function(err,appli){
                if (err) {
                    console.log(err);
                }
                if(appli){
                    req.session.appli = appli;
                    res.redirect('/busirole/addBusiRole');
                }
            });
        }
    });
    console.log(_application);
};

exports.appList = function(req,res) {
    var userId = req.session.user._id.toString();
    Appli.find({userId:userId},function(err,applis) {
        if(err){
            console.log("appList"+err);
        }
        res.render("ApplicationList",{
                applis:applis
        })

    });

};