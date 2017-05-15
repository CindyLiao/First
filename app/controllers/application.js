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
    var _empId = req.session.user.empId;
    var userId = req.session.user._id.toString();
    Appli.find({userId:userId},function(err,applis) {
        // 从服务管理中心根据员工ID（empId）获取其注册过的服务和流程，若存在则更新，不存在则添加
        if (_empId != undefined && _empId != null) {
            var uri = "http://127.0.0.1:8080/SSH_Prototype_J2EE_5.0/getAllAvaService.action?userId=" + _empId;
            request.get({url: uri}, function (errInfo, appRegister) {
                if (errInfo) {
                    console.log("从服务中心获取服务列表错误！" + uri + errInfo);
                    res.render('Error',{
                       message:"从服务中心获取服务列表异常！"
                    });
                }
                try {
                    var appRegisterString = appRegister.body;
                }catch(  e ) {
                    res.render('Error',{
                        message:"从服务中心获取服务列表异常！"
                    });
                }
                console.log(appRegister.body);
                var appRegisterObj = appRegisterString != null && appRegisterString != undefined ? JSON.parse(appRegisterString) : null;
                if (appRegisterObj != null) {
                    var services = appRegisterObj.services;
                    services.forEach(function (service) {
                        var app = new Object();
                        app["appName"] = service.name;
                        app["uri"] = service.appRoleUrl + service.id;
                        app["userId"] = userId;
                        Appli.update({appName: service.name, uri: service.appRoleUrl + service.id}, app, {
                            safe: true,
                            upsert: true
                        }, function (updateErr, application) {
                            if (updateErr) {
                                console.log("application:appList:request.get" + uri + "应用更新失败" + updateErr);
                            }
                            console.log("application:appList:request.get" + uri + "Appli.update" + application);
                        })
                    })
                }
            });
        }
        if(err){

            console.log("appList"+err);
        }
        res.render("ApplicationList",{
                applis:applis
        })

    });

};