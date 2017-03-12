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
    request.get({url:appli.uri},function(error,roleNames){  // 根据访问接口获取业务角色
        console.log(roleNames.body);
        var body = roleNames.body;
        var obj = JSON.parse(body);
        var len = obj.roles.length;
        var roles = obj.roles;
        var index = 0;
        if ( len > 0  ) {
            roles.forEach( function (role) {
                var busirole = new BusiRole();  // 获取业务角色
                busirole.roleId = role.roleId;
                busirole.name = role.roleName;
                busirole.appName = appli.appName;
                busirole.userId = userId;
                _busiRoles.push(busirole);
                // 更新业务角色，若不存在则插入，存在则更新至最新的数据
                BusiRole.update( { userId:userId,roleId:busirole.roleId,appName:appli.appName,name:busirole.name},
                    busirole, {safe:true,upsert:true} , function ( updateError, busiRole){
                        index ++;
                        if ( updateError ) {
                            res.render( 'Error' , {
                                message: "业务角色更新出错！"
                            });
                            console.log ( "addBusiRole"+updateError);
                        }
                        if ( index == len ) {
                            res.render('BusiRoleList',{
                                roles:_busiRoles
                            })
                        }
                    })
            });
        }

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