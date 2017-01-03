/**
 * Created by yuzaizai on 2016/5/29.
 */
var BusiRole = require('../models/BusinessRole');
var Appli = require('../models/Application');
var request = require('request');

exports.addBusiRole = function(req,res) {
    var appli = req.session.appli;
    var userId = req.session.user._id.toString();
    var _busiRoles = new Array();
    request.get({url:appli.uri},function(error,roleNames){
        console.log(roleNames.body);
        var body = roleNames.body;
        var obj = JSON.parse(body);
        var len = obj.roles.length;
        var i=0;
        for(;i<len;i++) {
            var busirole = new BusiRole();  // 获取业务角色
            busirole.name = obj.roles[i].roleName;
            busirole.appName = appli.appName;
            busirole.userId = userId;
            _busiRoles.push(busirole);
            BusiRole.find({userId:userId,appName:appli.appName,name:busirole.name},function (error,busiRole){ //查找该业务角色是否已经存在
               if ( error ) {
                    res.render('Error',{
                        message:"数据库查询出错！"+error
                    })
               }
               if (busiRole == null || busiRole.length==0 ) {  // 若业务角色不存在，则存储
                   _busiRoles.save(function (error, bs) {
                       if (error) {
                           console.log(error);
                       }
                       console.log(bs);
                   });
               }
            });

        }
        res.render('BusiRoleList',{
            roles:_busiRoles
        })
    })

};

//busiroleList
exports.busiroleList = function(req,res) {
    var _appName = req.params.name;
    var _userId = req.session.user._id.toString();
    BusiRole.find({userId:_userId,appName:_appName},function(error,roles){
        if(error) {
            console.log(error);
        }
        if (roles.length>0 ) {
            res.render('BusiRoleList',{
                roles:roles
            })
        } else {
            Appli.findOne({appName:_appName},function(err,app){
                if(err) {
                    console.log(err);
                }
                if(app) {
                    req.session.appli = app;
                    res.redirect('/busirole/addBusiRole');
                }
            })
        }

    })
};