/**
 * Created by yuzaizai on 2016/11/2.
 */
var Mapp = require('../models/Mapping');
var Appli = require('../models/Application');
var request = require('request');


exports.selectMappingByUserId = function(req,res) {
    var userId = req.session.user._id.toString();
    Mapp.find({userId:userId},function(err,mapps){
        if(err) {
            console.log("showRoleMapping.js:selectMappingByUserId"+err);
        }
        res.render('Mapping',{
            mapps:mapps
        })

    })
};

exports.registerMapping = function(req,res) {   // 映射的注册，目前规定是一个用户只能注册一个组织系统
    var userId = req.session.user._id.toString();
    var _map = req.body.mapping;
    Mapp.find({userId:userId,appName:_map.appName},function(err,mapp){ // 判断该应用系统是否已经建立过映射
        if(err) {
            console.log("showRoleMapping.js:registerMapping"+err);
        }
        if (mapp.length>0) {
            console.log(_map.appName+"已经创建了映射");
            res.redirect('/map/userMappings');
        } else {
            _map.mapState = 0;
            mapp = new Mapp(_map);
            mapp.save(function(err,map) {
                if(err) {
                    console.log("showRoleMapping.js:registerMapping"+err);
                }
                if (mapp) {
                    res.redirect('/map/userMappings');
                }
            })
        }
    });
    console.log(_map);
};

exports.showRegisterMapping = function(req,res) {
    var userId = req.session.user._id.toString();
    Appli.find({userId:userId},function(err,applis) {
        if(err) {
            console.log("showRoleMapping.js:showRegisterMapping"+err);
        }
        res.render('RegisterMapping',{
            applis:applis
        })
    })
};
