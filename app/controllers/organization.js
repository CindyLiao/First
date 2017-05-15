/**
 * Created by yuzaizai on 2016/5/25.
 */

var Organ = require('../models/Organization');
var User = require('../models/User');
var OrganDep = require('../models/OrganDep');
var OrganPos = require('../models/OrganPos');
var OrganRole = require('../models/OrganRole');
var RoleMapp = require('../models/RoleMapping');
var Mapp = require('../models/Mapping');
var request = require('request');
var _ = require('underscore');
var Cache = require('memory-cache');
var express = require('express');
var app = express();
var Promise = require('promise');
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var Util = require('util');
var HashMap = require('../models/HashMap');
//show signup

exports.showsignup = function(req,res) {
    res.render('SignupOrgan',{
        title: '组织注册页面'
    })
};
//do signup
exports.organsignup = function(req,res){
    var _organization = req.body.organization;
    var _userId = req.session.user._id.toString();
    // 目前的策略，为不导致映射统计过于复杂，则限制每个用户只能注册一个组织系统
    Organ.findOne({userId:_userId},function(err,org){
        if (err){
            console.log(err);
        }
        if ( org ) {//判断组织是否已经存在
            console(_organization.organName+"已经存在！");
            return res.redirect('/user/userpage');
        } else { //不存在则将保存组织信息
            organ = new Organ(_organization);
            organ.save(function(err,organ){
                if (err) {
                    console.log(err);
                }
               if(organ){
                   req.session.organization = organ;
                   res.redirect('/organpos/addOrganPos');
               }
            });
        }
    });
    console.log(_organization);
};


//organList
exports.organList = function(req,res) {
  var user = req.session.user;
  var _id = user.type == "user"?user.belongTo:user._id;  // 如果为普通用户则查找其上属admin的
  Organ.find({userId:_id},function(err,organs){
        if ( err ) {
            console.log(err);
        }
        if( organs ) {
            res.render('organizationList',{
                title:"组织信息管理",
                organs:organs
            });
        }

  });
};

exports.registerOrgan = function ( req,res) {
    res.render('RegisterOrgan',{
        title: '组织注册页面'
    })
};


exports.editOrgan = function (req,res) {
    var _userId = req.session.user._id.toString();
    Organ.findOne({userId:_userId}, function(error, organ) { // 查找该用户的组织注册信息
        if ( error ) {
            console.log("controller:Organization,method: editOrgan"+error);
            res.render('Error', {
                message:'组织信息查找失败'+error
            })
        }
        if ( organ == null || organ.length ==0 ) {
            // 若该用户未注册过组织信息，跳转至组织注册页
            res.redirect('/organ/registerOrgan');
        }
        res.render('EditOrganInfo',{
            title:'组织信息编辑页',
            organ: organ
        })
    })
};

// 更新组织信息
exports.updateOrganInfo = function ( req, res ) {
    var _organName = req.params.organName;
    var _organization = req.body.organization;
    var _organ;
    Organ.findOne({organName:_organName}, function ( error,organ){
        if ( error ) {
            console.log("controller:Organization,method: updateOrganInfo"+error);
            res.render('Error', {
                message:'组织信息查找失败'+error
            })
        }
        if ( organ ) {
            _organ = _.extend(organ,_organization);//用新数据替换掉原有的数据
            _organ.save( function (err, org){
                if (err) {
                    console.log("controller:Organization,method: updateOrganInfo"+err);
                }
                res.redirect('/organ/organList');
            });
        }
    });

};

exports.updateOrganResource = function (req,res) {
    // 从cache中更新组织数据
    var _userName = req.session.user.name;
    var _userId = req.session.user._id.toString();
    var _organNameHashMap = Cache.get(_userName);
    if ( Util.isNull(_organNameHashMap) ) {
        res.redirect('/organ/organList');
    }
    var _empList = _organNameHashMap.get('Employee')!=null?_organNameHashMap.get('Employee').toArray():null; // 获取员工更新信息；
    var _roleList = _organNameHashMap.get('Role')!=null? _organNameHashMap.get('Role').toArray():null;  // 获取角色更新信息
    var _depList =  _organNameHashMap.get('Department')!=null?_organNameHashMap.get('Department').toArray():null;  // 获取部门更新信息
    var _posList =  _organNameHashMap.get('Position')!=null?_organNameHashMap.get('Position').toArray():null;  // 获取职位更新信息
    var empPromise = new Promise(function(resolve,reject){
        executeEmpOpe(_userId,_empList,function(empRes){
            if ( empRes) {
                resolve("success");
            }else {
                reject("failed");
            }
        });
    });
    var rolePromise;  // 角色Promise
    var depPromise;   // 部门promise
    var posPromise;   // 职位promise
    var updateRoles;  // 更新的组织角色信息
    var updateDeps;   // 更新的组织部门信息
    var updatePos;   // 更新的组织职位信息
    Organ.findOne({userId:_userId},function(error,organ){
        if ( error  ) {
            err(error,"组织信息查找失败"+_userId);
        }
        if ( organ == null || organ.length ==0  ) {
            err(null,"请admin先添加组织信息");
        }
        rolePromise = new Promise(function(resolve,reject){
             executeRoleOpe(_roleList,organ.organName,_userId,function(_updateRoles,roleRes){
                 if ( roleRes ) {   // 更新角色信息
                     updateRoles = _updateRoles;
                     resolve("success");
                 } else {
                     reject("failed");
                 }
            });
        });
        depPromise = new Promise(function(resolve,reject){
             executeDepOpe(_depList,organ.organName,_userId, function (_updateDeps, depRes) {
                if(depRes) {  // 更新部门信息
                     updateDeps = _updateDeps;
                     resolve("success");
                 }else {
                     reject("failed");
                 }
             });
        });
        posPromise = new Promise( function (resolve,reject) {
            executePosOpe(_posList,organ.organName,_userId,function(_updatePos, posRes) {
                if (posRes) {   //  更新职位信息
                    updatePos = _updatePos;
                    resolve("success");
                } else {
                    reject("failed");
                }
            });
        });
        // 当empPromise、rolePromise、depPromise、posPromise都完成的时候，或者有一个发生异常时： resData：为一个各个Promise返回结果集
        Promise.all([empPromise,rolePromise,depPromise,posPromise]).then(function( resData ){
            server.listen(80);
            io.sockets.on('connection', function (socket) {
                console.log("socket connected:"+socket.id);
                //// 对分组中的用户发送信息 （包括自己）
             //   io.sockets.in('roles').emit('roles'+_userId, { updateRole: updateRoles }); // 发送角色更新信息

                socket.emit('roles'+_userId, { updateRole: updateRoles },function(data){  // 发送角色更新信息
                    if ( data == 200) {
                      //  updateRoles = null;
                        console.log("客户端接收角色更新信息成功！");
                    }
                });
                socket.emit('departments'+_userId, { updateDep: updateDeps },function(data){
                    if ( data == 200) {
                     //   updateDeps = null;
                        console.log("客户端接收部门更新信息成功！");
                    }
                });
                socket.emit('positions'+_userId, { updatePos: updatePos },function(data){
                    if ( data == 200) {
                      //  updatePos = null;
                        console.log("客户端接收职位更新信息成功！");
                    }
                });
               // io.socket.on(_userId,function(data){
               //     console.log("新加入"+data);
               //     socket.join(_userId);   //  以管理员分组，每个管理员和其添加的协作人为一组
               // });
               // socket.broadcast.to(_userId).emit('roles'+_userId,{updateRole:updateRoles}); // 对分组中的用户发信息
            });
            io.sockets.on('disconnection',function(socket){

            });
            Cache.del(_userName); // 从缓存中删除已经执行的数据
            console.log("updateOrganResource");
            res.redirect('/organ/organList');
        })

    });

};


// 更新员工信息
function executeEmpOpe(_belongUserId, _empList,callback) {
    if ( _empList == null || _empList.length ==0 ) {  // 若没有要更新的员工信息
        callback(true);
    }
    //  若员工更新信息不为空
    var index = 0;  // 计数器
    var _empListLen = _empList.length;
    _empList.forEach(function( item ) {
        var _empOpe = item[0];  // 获取某条记录最后的操作状态;save、update、delete
        var _empData = item[1];  // 获取某条记录最后的信息状态;
        if (_empOpe == "save" ) {  // 新增用户，不直接插入，需要admin用户选择添加
            index++;
            if ( index == _empListLen) {
                callback(true);
            }
        }
        var _user = new User();
        _user.name = _empData.name;
        _user.empId = _empData.id;
        _user.bcryptPassword(_empData.password,function(error,encryptPassword){
            if ( error ) console.log(error);
            if ( encryptPassword )
            _user.password = encryptPassword;
            User.findOne({belongTo:_belongUserId,empId:_user.empId},function(error,user){  // 根据admin用户id，和职工id查询
                if ( error) {
                    console.log("updateOrganResource:executeEmpOpe"+error);
                    callback(false);
                }
                if ( user == null || user.length ==0 ) {  // case1:如果该员工未被admin加入协作人员名单，则忽略该操作;case2:若delete操作，删除的是并没有持久化得数据则忽略该操作
                    index++;
                    if ( index == _empListLen) {
                        callback(true);
                    }
                } else {
                    if ( _empOpe == "update") {  // 员工的update和其它的不同，update必须是已被admin加入的员工信息
                        updateOpe(user,_user,User,function(upRes) {
                            if ( upRes ) {  // 若更新成功
                                index++;
                                if (index == _empListLen) {  // 若全部更新操作执行完毕
                                    callback(true);
                                }
                            } else {
                                callback(false);
                            }
                        });
                    }
                    if ( _empOpe == "delete") {
                        deleteEmpOpe(User, user._id, user.belongTo,function (delRes) {
                            if (delRes) {  // 若删除成功
                                index++;
                                if (index == _empListLen) {
                                    callback(true);
                                }
                            } else {
                                callback(false);
                            }
                        });
                    }
                }

            }); // user.findOne
        });

    })

}

//  更新角色信息
function executeRoleOpe(_roleList,organName,userId,callback) {
    if ( _roleList == null || _roleList.length ==0 ) {  // 若没有要更新的角色信息
        callback( null,true );
    }
    var _updateRole = new Array();
    var _roleListLen = _roleList.length;
    var index =0 ; // 计算执行的次数
    // 若角色更新信息不为空
    _roleList.forEach(function(item) {
        var _roleOpe = item[0];
        var _roleData = item[1];
        var _organRole = new OrganRole();
        _organRole.roleId = _roleData.id;
        _organRole.name = _roleData.roleName;
        _organRole.organName = organName;
        _organRole.userId = userId;
        OrganRole.findOne({userId:userId,organName:organName,roleId:_organRole.roleId},function(error,organRole){
            executeOpe(error,organRole,_roleOpe,_organRole,OrganRole,function(opeRes) {
                if ( opeRes ) {
                    index++;
                    _updateRole.push(_organRole);
                    if ( index == _roleListLen ) {
                        callback(_updateRole,true);
                    }
                } else {
                    callback(_updateRole,false);
                }
            });
        });
    });

}


// 更新部门信息
function executeDepOpe(_depList,organName,userId,callback) {
    if ( _depList == null || _depList.length ==0 ) {
        callback(null, true );
    }
    var _updateDep = new Array();
    var index =0;  // 计数器
    var _depListLen = _depList.length;
    // 若部门更新信息不为空
    _depList.forEach(function( item ) {
        var _depOpe = item[0];
        var _depData = item[1];
        var _organDep = new OrganDep();
        _organDep.depId = _depData.id;
        _organDep.depName = _depData.depName;
        _organDep.parentDepId = _depData.parentDepId;
        _organDep.organName = organName;
        _organDep.userId = userId;
        OrganDep.findOne({userId:userId,organName:organName,depId:_organDep.depId},function(findErr,organDep){  // 根据用户Id、组织信息以及部门Id查找唯一部门记录
           executeOpe(findErr,organDep,_depOpe,_organDep,OrganDep,function(depRes){
               if ( depRes) {
                   index++;
                   _updateDep.push(_organDep);  // 记录更新的组织部门信息
                   if ( index == _depListLen ) {
                       callback(_updateDep,true);
                   }
               } else {
                   callback(_updateDep,false);
               }
           })
        })
    });
}

// 更新职位信息
function executePosOpe( _posList,organName,userId,callback ) {
    if ( _posList == null || _posList.length ==0 ) {
        callback( null,true );
    }
    var _updatePos = new Array();
    var index =0 ;
    var _posListLen = _posList.length;
    // 若职位更新信息不为空
    _posList.forEach(function( item ) {
        var _posOpe = item[0];
        var _posData = item[1];
        var _organPos = new OrganPos();
        _organPos.empId = _posData.empId;
        _organPos.posId = _posData.id;
        _organPos.posName = _posData.posName;
        _organPos.roleId = _posData.roleId;
        _organPos.roleName = _posData.roleName;
        _organPos.depId = _posData.depId;
        _organPos.depName = _posData.depName;
        _organPos.organName = organName;
        _organPos.userId = userId;
        OrganPos.findOne({userId:userId,organName:organName,posId:_organPos.posId},function( findErr,organPos){
            executeOpe(findErr,organPos,_posOpe,_organPos,OrganPos,function(posRes){
                if ( posRes) {
                    _updatePos.push(_organPos);
                    index++;
                    if ( index == _posListLen) {
                        callback(_updatePos,true);
                    }
                } else {
                    callback(_updatePos,false);
                }
            })
        })
    });

}


// 执行查找函数的回调函数 ope:为具体操作，oblObj为更新时旧数据，newObj为要待更新的数据
function executeOpe(findErr,oldObj,ope,newObj,model,callback) {
    if (findErr) {
        console.log(findErr, "查找出错！");
        callback(false);
    }
    if (ope == "update") {   // update 操作有两种可能1：organDep为空即要更新的内容未被持久化到数据库中，这种情况则直接保存，2：organDep不为空，则更新原有数据
        updateOpe(oldObj, newObj,model, callback);
    }
    if ( !Util.isNullOrUndefined(oldObj)) {  // 若要更改的该条记录不在表中1、save操作，2、delete操作之前未持久化得数据，
        if (ope == "delete") {   // delete 操作是删除数据库中的已有数据，
            deleteOpe(model, oldObj._id,callback)
        }
    }else {
        if (ope == "save") {  // save则是添加数据库中不存在的数据
            saveOpe(newObj, callback); // 若角色信息持久化成功
        } else {  //  若delete操作，删除的是未被持久化到数据库中的数据，则跳过该数据
            callback(true);
        }
    }
}

// 执行保存操作obj:执行对象
function saveOpe ( obj, callback) {
    if ( obj == null ) {
        callback( false);
    }
    obj.save(function ( error,saveObj ) {
        if ( error) {
            console.log(error,saveObj+"持久化出错!");
            callback( false);
        }
        if ( !Util.isNullOrUndefined(saveObj) ) {
            console.log("updateOrganResource:save"+saveObj);
            callback(true);
        } else {
            callback(false);
        }
    })



}

// 执行更新操作 oldObj已持久化的对象，newObject：要更新的信息
function updateOpe(oldObj,newObj,model,callback) {
    if ( newObj == null ) {
        callback(false);
    }
    if ( !Util.isNullOrUndefined(oldObj) && !Util.isNullOrUndefined(model)) { // 若更新数据库中的数据
        newObj._id = oldObj._id;
        model.update({_id:oldObj._id},newObj,{safe : true},function(updateErr,updatedObj){   // 全量更新
            if ( updateErr || Util.isNullOrUndefined( updatedObj)) {
                console.log("updateOpe"+updateErr);
                callback(false);
            }
            if ( !Util.isNullOrUndefined(updatedObj)){
                if (model.prototype.hasOwnProperty("posName") && newObj.posName != oldObj.posName) {  // 如果更新的是职位信息，则要同步将该职位的映射关系更新
                    RoleMapp.update({organPosId:newObj._id},{$set: {organPosName:newObj.posName}},{multi:true},function(upErr,result){  // 批量更新映射关系
                        if ( upErr ) {
                            console.log("updateOpe:映射关系更新失败！"+upErr);
                            callback( false );
                        }
                        console.log("updateOpe:映射关系更新成功！"+result);
                        callback(true);
                    })
                } else {
                    console.log("updateOpe:更新成功！"+updatedObj);
                    callback(true);
                }
            }
        })
    } else {  //  若要更新的数据未被持久化，则将最新的数据持久化到数据库中
        saveOpe(newObj,callback);
    }
}


// 执行删除操作obj：执行对象,id:要删除的对象的id
function deleteOpe ( model,id,callback) {
    if( Util.isNullOrUndefined(obj)|| Util.isNullOrUndefined(id) ) {
        callback(false);
    }
    model.remove({_id:id},function(removeErr,removeObj){
        if ( removeErr ) {
            console.log("deleteOpe:failed"+removeErr+id);
            callback(false);
        }
        if ( !Util.isNullOrUndefined( removeObj) ) {  // 若删除成功
            if (model.prototype.hasOwnProperty("posName")) {  // 如果删除的是职位信息，则要同步将该职位的映射关系删除
                RoleMapp.remove({organPosId:id},function(reErr,reResult) {
                    if ( reErr ) callback(false);
                    console.log("deleteOpe:同步删除映射关系成功！"+reResult);
                    callback ( true);
                })
            } else {
                console.log("deleteOpe:success"+removeObj+id);
                callback(true);
            }
        } else {
            callback(false);
        }
    })
}

// 删除职工的操作，在删除职工的同时，该职工原建立的映射移交给其所属的admin用户
function deleteEmpOpe(model,id,belongTo,callback) {
    if( Util.isNullOrUndefined(obj)|| Util.isNullOrUndefined(id) ) {
        callback(false);
    }
    model.remove({_id:id},function(removeErr,removeObj){
        if ( removeErr ) {
            console.log("deleteOpe:failed"+removeErr+id);
            callback(false);
        }
        if ( !Util.isNullOrUndefined( removeObj) ) {  // 若删除成功
            Mapp.update({userId:id},{$set:{userId:belongTo}},{multi:true},function(upErr,result){  // 将该用户建立的映射移交给其所属的admin管理
                if( upErr )  console.log("Failed update user.belongTo;"+upErr);
                console.log("用户移交映射管理操作成功！"+result);
                callback(true);
            });
        } else {
            callback(false);
        }

    })
}
// 错误信息
function err ( error,message ) {
    if ( error != null ) {
        res.render('Error',{
            message: message+error
        })
    }
}



