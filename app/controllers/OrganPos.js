/**
 * Created by yuzaizai on 2016/11/22.
 */
var OrganPos = require('../models/OrganPos.js');
var Organ = require('../models/Organization.js');
var request = require('request');




// 添加组织职位 通过uri获取组织职位信息（Json格式数据）
exports.addOrganPos = function (req,res) {
    var _organization = req.session.organization;
    var _userId =req.session.user._id.toString(); // toString()!!!!!
    var posArray = new Array();
    // 判断该组织是否已经加载过组织职位
    OrganPos.find({organName:_organization.organName,userId:_userId},function(err, positions){
        if ( err ) {
            res.render('Error',{
                message: "组织职位读取出错"+err
            })
        }
        if( positions != null && positions.length > 0 ) {
            res.render('OrganPosList',{
                positions: positions
            })
        } else {
            // 根据Uri访问组织职位
            try{
                request.get({url:_organization.posUri},function (error,poStr){
                    var _posBody = poStr.body; // 获取html页面中的body中的数据
                    var _posObj = JSON.parse(_posBody); // 转成json对象格式
                    // 若数据为空或访问异常
                    if (_posObj.positions.length <=0 || error ) {
                        res.render('Error',{
                            message: "组织职位为空或访问职位Uri出错"+error
                        })
                    }
                    var index = 0; // 记录save函数执行完多少次。
                    //遍历positions中的所有数据 ！！！！组织Uri返回的对象命名统一为positions
                    for ( var i=0;i< _posObj.positions.length; i++) {
                        var organPos = new OrganPos();
                        organPos.empId = _posObj.positions[i].empId; // !!!属性名需一致
                        organPos.depId = _posObj.positions[i].orgId;
                        organPos.depName= _posObj.positions[i].orgName;
                        organPos.posId = _posObj.positions[i].id;
                        organPos.posName = _posObj.positions[i].posName;
                        organPos.roleId = _posObj.positions[i].roleId;
                        organPos.roleName = _posObj.positions[i].roleName;
                        organPos.userId = _userId;
                        organPos.organName = _organization.organName;
                        organPos.save(function ( error, organPos){
                            if ( error || organPos == null) {
                                console.log("controllers:OrganPos,method:addOrganPos,组织职位存入出错"+error);
                            }
                            if ( organPos ) {
                                console.log('save OrganPos'+organPos);
                                posArray.push(organPos);
                                if ( index == _posObj.positions.length-1 ) { // 若遍历完成
                                    res.render('OrganPosList',{
                                        positions: posArray
                                    })
                                }
                                index++;
                            }
                        });
                    }
                })
            } catch ( e ) {
                console.log("controllers:OrganPos,method:addOrganPos,访问组织职位Uri出错"+e);
                res.render('Error',{
                    message: "访问组织职位Uri出错"+e
                })
            }
        }
    });
};


exports.organPosList = function (req,res) {
    var _userId = req.session.user._id.toString();
    var _organName = req.params.name;
    OrganPos.find({organName:_organName,userId:_userId},function(error,positions){
        if ( error ) {
            console.log("organposList"+error);
            res.render('Error',{
                message: "组织职位查询出错"+error
            })
        }
        if (positions!=null &&  positions.length >0) {
            res.render('OrganPosList',{
                positions: positions
            })
        } else {
            Organ.findOne({organName:_organName},function(error,organ){
                if (error || organ == null ) {
                    console.log("organposList:Organ.findOne()"+error);
                    res.render('Error',{
                        message: "组织查询出错"+error
                    })
                }
                req.session.organization = organ;
                res.redirect('/organpos/addOrganPos');
            })
        }
    })
};

