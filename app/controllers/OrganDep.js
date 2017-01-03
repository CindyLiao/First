/**
 * Created by yuzaizai on 2016/11/22.
 */
 var OrganDep = require('../models/OrganDep');
 var Organ = require('../models/Organization');
var request = require('request');


exports.getAllDepByOrganName = function (req,res) {
   var _organName = req.params.organName;
   OrganDep.find({organName: _organName},function(error,departs){
      if ( error ) {
         console.log("controllers:OrganDep,method: getAllDepByOrganName"+ error);
      }
      if ( departs != null && departs.length>0 ) {
         res.json( departs);
      }
   })
};

exports.organDepList = function ( req,res ) {
   var _organName = req.params.organName;
   var _userId = req.session.user._id.toString();
   OrganDep.find({organName:_organName,userId:_userId},function(error,departs){
      if(error) {
         console.log(error);
         res.render('Error',{
            message: error
         })
      }
      if (departs.length>0 ) {
         res.render('OrganDepList',{
            departments:departs
         })
      } else { // 若组织角色未被加载过，则加载该组织角色
         Organ.findOne({organName:_organName},function(err,organ){
            if(err) {
               res.render('Error',{
                  message: "加载组织部门出错"+err
               })
            }
            if(organ) {
               var organdeps = new Array();
               // 访问组织的URL
               try {
                  request.get({url:organ.depUri},function(error,departNames){
                     console.log(departNames.body);
                     var body = departNames.body; // 获取html页面中的body中的数据
                     var obj = JSON.parse(body); // 将body中的字符串格式的数据转成Json对象
                     var len = obj.departments.length; // 遍历roles中的所有数据 ！！！！组织Uri返回的对象命名统一为departments
                     var index = 0; // 记录save函数执行完多少次。
                     for(var i=0 ;i<len;i++) {    // json获取组织角色列表，json格式必须为roles：{roleName：}
                        var organdep = new OrganDep();
                        organdep.depId = obj.departments[i].id;
                        organdep.depName = obj.departments[i].depName;
                        organdep.parentDepId = obj.departments[i].parentDepId; // 属性名确定
                        organdep.organName = _organName;
                        organdep.userId = _userId;
                        organdep.save(function (error, or) {
                           if (error) {
                              console.log("addOrganDep"+error);
                              res.render('Error',{
                                 message: "组织部门存入数据库出错"+error
                              })
                           }
                           if ( or ) {
                              console.log(or);
                              organdeps.push(or);
                              if ( index == len -1 ) {
                                 res.render('OrganDepList',{
                                    departments: organdeps
                                 })
                              }
                              index++;
                           }

                        });
                     }
                  });
               } catch ( e ) {
                  res.render('Error',{
                     message: "无法获取到组织部门资源数据"+e
                  })
               }
            }
         })
      }

   })
};
