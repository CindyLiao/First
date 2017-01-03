/**
 * Created by yuzaizai on 2016/5/25.
 */

var Organ = require('../models/Organization');
var request = require('request');
var OrganRole = require('../models/OrganRole');
var _ = require('underscore');
var Cache = require('memory-cache');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
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
    var _organNameHashMap = Cache.get(_userName);
    var _empList = _organNameHashMap.get('Employee')!=null?_organNameHashMap.get('Employee').toArray():null; // 获取员工更新信息；
    var _roleList = _organNameHashMap.get('Role')!=null? _organNameHashMap.get('Role').toArray():null;  // 获取角色更新信息
    var _depList =  _organNameHashMap.get('Department')!=null?_organNameHashMap.get('Department').toArray():null;  // 获取部门更新信息
    var _posList =  _organNameHashMap.get('Position')!=null?_organNameHashMap.get('Position').toArray():null;  // 获取职位更新信息
    if ( _empList!=null && _empList.length > 0  ) {    //  若员工更新信息不为空
        for ( var i=0; i<_empList.length;i++) {
            var ope = _empList[i][0];

        }
    }
    if ( _roleList!=null && _roleList.length > 0  ) {    // 若角色更新信息不为空

    }
    if ( _depList!=null && _depList.length > 0  ) {

    }
    if ( _posList!=null && _posList.length > 0  ) {

    }
    server.listen(80);
    io.sockets.on('connection', function (socket) {
        socket.emit('news', { hello: 'world' });
        socket.on('my other event', function (data) {
            console.log(data);
        });
    });
    var _userName = req.session.user.name;

    console.log("updateOrganResource");
    res.redirect('/organ/organList');
};

