/**
 * Created by yuzaizai on 2016/11/2.
 */
var Mapp = require('../models/Mapping');
var Appli = require('../models/Application');
var request = require('request');
var OrganPos = require('../models/OrganPos');
var RoleMapp = require('../models/RoleMapping');


exports.selectMappingByUserId = function(req,res) {
    var userId = req.session.user._id.toString();
    Mapp.find({userId:userId},function(err,mapps){
        if(err) {
            console.log("showRoleMapping.js:selectMappingByUserId"+err);
        }
        res.render('Mapping',{
            title:"映射管理页",
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

// 统计映射量,admin用户
exports.statistic = function ( req,res ) {
    var _userId = req.session.user._id.toString();
    OrganPos.find({userId:_userId},function(findErr,organPosList){
        if ( findErr ) {
            console.log("Mapping.js:statistic"+findErr);
            res.render('Error',{
                message: findErr
            });
        }
        var i = 0;
        var organPosMappCount = new Array();
        organPosList.forEach(function(organPos) {
            RoleMapp.find({organPosId:organPos._id.toString()},function(mapFindErr, roleMappList ){
                if ( mapFindErr ) {
                    console.log("Mapping.js:statistic"+mapFindErr);
                    res.render('Error',{
                        message: mapFindErr
                    });
                }
                var posMappCount = new Object();
                posMappCount["name"] = organPos.posName;
                posMappCount["value"] = roleMappList != null && roleMappList.length > 0 ? roleMappList.length:0;
                posMappCount["color"] = "#b5bcc5";
                organPosMappCount.push(posMappCount);
                i++;
                if ( i == organPosList.length ) {
                    var sortMapArray = organPosMappCount.sort(sortMethod);
                    res.render('Statistic',{
                        title:"映射统计信息",
                        statisticData: sortMapArray
                    })
                }
            });
        });
    });


};

// 根据映射关系分析组织关系
exports.analysis = function ( req,res ) {
    res.render('Statistic', {
        title: "映射统计信息"
    });
};


function sortMethod(a,b) { //定义array数组的排序方式，从大到小排序
    return -(a.value - b.value);  // 若a 大于b 则返回小于0，则a出现在b前面
}