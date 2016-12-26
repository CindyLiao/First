/**
 * Created by yuzaizai on 2016/5/27.
 */
var OrganRole = require('../models/OrganRole');
var Organ = require('../models/Organization');
var request = require('request');


exports.addOrganRole = function(req,res) {
    var organ = req.session.organization;
    var userId = req.session.user._id.toString();
    var organRoles = new Array();
    // 访问组织的URL
    try {
        request.get({url:organ.roleUri},function(error,roleNames){
            console.log(roleNames.body);
            var body = roleNames.body; // 获取html页面中的body中的数据
            var obj = JSON.parse(body); // 将body中的字符串格式的数据转成Json对象
            var len = obj.roles.length; // 遍历roles中的所有数据 ！！！！组织Uri返回的对象命名统一为roles
            var i=0;
            var index = 0; // 记录save函数执行完多少次。
            for(;i<len;i++) {    // json获取组织角色列表，json格式必须为roles：{roleName：}
                var organrole = new OrganRole();
                organrole.roleId = obj.roles[i].roleId;
                organrole.name = obj.roles[i].roleName;
                organrole.organName = organ.organName;
                organrole.userId = userId;
                organrole.save(function (error, or) {
                    if (error) {
                        console.log("addOrganRole"+error);
                        res.render('Error',{
                            message: "组织角色存入数据库出错"+error
                        })
                    }
                    if ( or ) {
                        console.log(or);
                        organRoles.push(or);
                        if ( index == len -1 ) {
                            res.render('OrganRoleList',{
                                roles: organRoles
                            })
                        }
                        index++;
                    }

                });
            }
        });
    } catch ( e ) {
        res.render('Error',{
            message: "无法获取到组织资源数据"+e
        })
    }
};

//organroleList
exports.organroleList = function(req,res) {
     var _organName = req.params.name;
     var _userId = req.session.user._id.toString();
     OrganRole.find({organName:_organName,userId:_userId},function(error,roles){
         if(error) {
             console.log(error);
             res.render('Error',{
                 message: error
             })
         }
         if (roles.length>0 ) {
             res.render('OrganRoleList',{
                 roles:roles
             })
         } else { // 若组织角色未被加载过，则加载该组织角色
             Organ.findOne({organName:_organName},function(err,organ){
                 if(err) {
                     res.render('Error',{
                         message: "加载组织角色出错"+err
                     })
                 }
                 if(organ) {
                     var organRoles = new Array();
                     // 访问组织的URL
                     try {
                         request.get({url:organ.roleUri},function(error,roleNames){
                             console.log(roleNames.body);
                             var body = roleNames.body; // 获取html页面中的body中的数据
                             var obj = JSON.parse(body); // 将body中的字符串格式的数据转成Json对象
                             var len = obj.roles.length; // 遍历roles中的所有数据 ！！！！组织Uri返回的对象命名统一为roles
                             var i=0;
                             var index = 0; // 记录save函数执行完多少次。
                             for(;i<len;i++) {    // json获取组织角色列表，json格式必须为roles：{roleName：}
                                 var organrole = new OrganRole();
                                 organrole.roleId = obj.roles[i].roleId;
                                 organrole.name = obj.roles[i].roleName;
                                 organrole.organName = organ.organName;
                                 organrole.userId = _userId;
                                 organrole.save(function (error, or) {
                                     if (error) {
                                         console.log("addOrganRole"+error);
                                         res.render('Error',{
                                             message: "组织角色存入数据库出错"+error
                                         })
                                     }
                                     if ( or ) {
                                         console.log(or);
                                         organRoles.push(or);
                                         if ( index == len -1 ) {
                                             res.render('OrganRoleList',{
                                                 roles: organRoles
                                             })
                                         }
                                         index++;
                                     }

                                 });
                             }
                         });
                     } catch ( e ) {
                         res.render('Error',{
                             message: "无法获取到组织资源数据"+e
                         })
                     }
                 }
             })
         }

    })
};


exports.getAllRolesByOrganName = function( req,res ) {
    var _organName =  req.params.organName;
    var _userId = req.session.user._id.toString();
    OrganRole.find({userId:_userId,organName:_organName}, function(error,organRoles){
        if(error) {
            console.log(error);
            res.render('Error',{
                message: error
            })
        }
        res.json(organRoles);
    })
};
