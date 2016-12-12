/**
 * Created by yuzaizai on 2016/11/7.
 */
var request = require('request');
var RoleMapp = require('../models/RoleMapping');
var Mapp =  require('../models/Mapping');
var OrganPos = require('../models/OrganPos');
var BusiRole = require('../models/BusinessRole');
var HashMap = require('../models/HashMap.js');


// 映射关系的显示
exports.showRoleMapping = function (req,res) {
    var _mapId = req.params.mapId;  // 获取参数映射id
    var _organName = req.params.organName;
    var _appName = req.params.appName;
    var idMap = new Array();
    //var mappingArray = new Array();
    RoleMapp.find({mapId:_mapId},function(err,rolemapps){   // 查询映射关系
        if(err) {
            console.log("controller:roleMapping,methodName:showRoleMapping"+err);
        }
        if (rolemapps!=null && rolemapps.length >0 ) {
            for (  var i=0;i<rolemapps.length; i++ ) {
                var subIdMap = new Array();
                subIdMap.push(rolemapps[i].organPosId);
                subIdMap.push(rolemapps[i].busiRoleId);
                idMap.push(subIdMap);
            }
            OrganPos.find({organName:_organName},function(error,organpos){ // 查询组织职位和应用角色信息
                if(error) {
                    console.log("controller:roleMapping,methodName:showRoleMapping"+error);
                }
                if ( organpos) {
                    BusiRole.find({appName:_appName},function(error,busiRoles){
                        if(error) {
                            console.log("controller:roleMapping,methodName:showRoleMapping"+error);
                        }
                        if( busiRoles ) {
                            res.render('ShowRoleMapping',{
                                title:'映射关系显示页|整体映射关系显示',
                                organPos:organpos,
                                busiRoles:busiRoles,
                                idMap: idMap
                            })
                        }
                    })
                }
            })

        }
    })
};

exports.selectShowRoleMapping = function (req,res) {
    var _mapId = req.params.mapId;  // 获取参数映射id
    var idMap = new Array();
    var mappingArray = new Array();
    RoleMapp.find({mapId:_mapId},function(err,rolemapps){   // 查询映射关系
        if(err) {
            console.log("controller:roleMapping,methodName:showRoleMapping"+err);
        }
        if (rolemapps!=null && rolemapps.length >0 ) {
            var index =0 ;
            for (  var i=0;i<rolemapps.length;i++) {
                var subIdMap = new Array();
                subIdMap.push(rolemapps[i].organPosId);
                subIdMap.push(rolemapps[i].busiRoleId);
                idMap.push(subIdMap);
                OrganPos.findById({_id:rolemapps[i].organPosId},function(error,organpos){
                    if(error) {
                        console.log("controller:roleMapping,methodName:showRoleMapping"+error);
                    }
                    if ( organpos) {
                        var objMap = new Object();
                        objMap["organPosId"] = rolemapps[index].organPosId;
                        objMap["busiRoleId"] = rolemapps[index].busiRoleId;
                        objMap["organPosName"] = rolemapps[index].organPosName;
                        objMap["busiRoleName"] = rolemapps[index].busiRoleName;
                        objMap["depName"] = organpos.depName;
                        objMap["organRoleName"] = organpos.roleName;
                        mappingArray.push(objMap);
                        if ( index == rolemapps.length-1) {
                            res.render('ShowRoleMapping',{
                                title:'映射显示页',
                                rolemapps:mappingArray,
                                idMap: idMap
                            })
                        }
                        index++;
                    }
                })
            }

        }
    })
};
// 编辑映射关系
exports.editRoleMapping = function(req,res) {
    var _mapId = req.params.mapId;  // 获取参数映射id
      Mapp.findById({_id:_mapId},function(err,map){ // 根据id查询map值获取组织名和应用名
          var  _organName="", _appName="";
          if ( err ) {
              console.log("controller:roleMapping,methodName:editRoleMapping"+err);
          }
          if ( map ) {
              _organName = map.organName;
              _appName = map.appName;
              BusiRole.find({appName:_appName},function(err,busiRoles){
                  if(err || busiRoles == null) {
                      console.log("controller:roleMapping,methodName:editRoleMapping"+err);
                      res.render('Error',{
                          message:"应用名称："+_appName+"数据库访问出错！"
                      })
                  }
                  if( busiRoles != null && busiRoles.length > 0 ) {
                      OrganPos.find({organName:_organName},function(err,organPos) {
                          if (err || organPos == null) {
                              console.log("controller:roleMapping,methodName:editRoleMapping" + err);
                              res.render('Error',{
                                  message:"组织名称："+_organName+"数据库访问出错！"
                              })
                          }
                          res.render('EditRoleMapping', {
                              title: '映射编辑选择页|'+_organName+'与应用'+_appName,
                              mapId: _mapId,
                              organName: _organName,
                              appName: _appName,
                              organPos: organPos,
                              busiRoles: busiRoles
                          })
                      });
                  } else {
                      console.log("controller:roleMapping,methodName:editRoleMapping");
                      res.render('Error',{
                          message:"应用名称："+_appName+"未添加任何应用角色"
                      })
                  }
              }); // busiRole.find
          }
      }); // Mapp.find

};

// 入参为业务角色的id，获取该id对应的组织角色列表
exports.busiRoleMappingList = function(req,res) {
    var _busiRoleId = req.params.id;
    var _mapId = req.params.mapId;
    var _organName = req.params.organName;
    var _busiRoleName = req.params.busiRoleName;
    var _mappedOrganRole = new HashMap();  // hash对象，key 为组织角色的id，value为组织角色名称
    // 根据组织名和应用名获取组织角色和应用角色列表
    OrganPos.find({organName:_organName},function(err,organPos) {
        if(  err ) {
            console.log("controller:roleMapping,methodName:busiRoleMappingList"+err);
            res.render('Error',{
                message:"组织名称："+_organName+"数据库读取出错</br>"+err
            })
        }
        if ( organPos == null || organPos.length == 0 ) {
            res.render('Error',{
                message:"组织名称："+_organName+"未添加任何组织角色</br>"+err
            })
        }
         // 若组织角色不为空
        RoleMapp.find({mapId:_mapId,busiRoleId:_busiRoleId},function(err,rolemapps) { // 根据映射Id和指定的映射业务角色Id查询相关联的组织角色信息
            if ( err || rolemapps == null) {
                console.log("controller:roleMapping,methodName:busiRoleMappingList"+err);
            }
            if ( rolemapps!=null && rolemapps.length>0) {  // 若该角色的映射不为空
                var len = rolemapps.length;
                var index = 0;
                while (index < len) {
                    _mappedOrganRole.put(rolemapps[index].organPosId,rolemapps[index].organPosName);
                    index++;
                }
                var _markedOrganPosLists = new Array();  // 返回页面对象,Array中的对象包含组织名称，和指定角色对象是否有映射关系
                var organRolesLen = organPos.length;
                var i =0;
                while ( i < organRolesLen ) {
                    var _markedOrganPos = new Object();  // 返回对象列表，对象包含两个属性1、组织名称2、是否关联该业务角色
                    _markedOrganPos['posName'] = organPos[i].posName; // 组织职位名称
                    _markedOrganPos['roleName'] = organPos[i].roleName;
                    _markedOrganPos['depName'] = organPos[i].depName;
                    _markedOrganPos['organName'] = organPos[i].organName;
                    _markedOrganPos['organPosId'] = organPos[i]._id.toString(); // 组织职位Id !!!在mongodb中组织角色Id为object，此处需要转换成String
                    if ( _mappedOrganRole.get(organPos[i]._id.toString()) ) { // 判断该组织角色与业务角色是否关联
                        _markedOrganPos['isMapped'] = true;
                    } else {
                        _markedOrganPos['isMapped'] = false;
                    }
                    _markedOrganPosLists.push(_markedOrganPos);
                    i++;
                }
                res.render('EditBusiRoleMappingById',{
                    title:_busiRoleName+"的映射关系",
                    busiRoleId:_busiRoleId,
                    busiRoleName: _busiRoleName,
                    mapId: _mapId,
                    markedOrganPosLists: _markedOrganPosLists
                });
            } else  {
                res.render('EditBusiRoleMappingById',{
                    title:_busiRoleName+"的映射关系",
                    busiRoleId:_busiRoleId,
                    busiRoleName: _busiRoleName,
                    mapId: _mapId,
                    organPos: organPos
                });
            }
        }); //Rolemap find()
        //res.json({busiRoleId:_busiId,organRoles:organRoles});
    }); // organRole.find()
};

// 查找指定组织职位的映射关系 ！！！！！和busiRoleMappingList方法相同。
exports.organPosMappingList = function(req,res) {
    var _organPosId = req.params.id;
    var _mapId = req.params.mapId;
    var _appName = req.params.appName;
    var _depName = req.params.depName;
    var _organRoleName = req.params.organRoleName;
    var _organPosName = req.params.organPosName;
    var _mappedBusiRole = new HashMap();  // hash对象，key 为业务角色的id，value为业务角色名称
    // 根据组织名和应用名获取组织角色和应用角色列表
    BusiRole.find({appName:_appName}, function (error,busiRoles) {
        if( error )  {
            console.log("controller:roleMapping,methodName:organPosMappingList"+error);
            res.render('Error',{
                message:"应用名称："+_appName+"数据库读取出错！</br>"+error
            })
        }
        if ( busiRoles == null || busiRoles.length == 0 ) {
            console.log("controller:roleMapping,methodName:organPosMappingList"+_appName+"业务角色为空");
            res.render('Error',{
                message:"应用名称："+_appName+"未添加任何业务角色！</br>"+error
            })
        }
        // 根据映射Id和组织职位id查询该组织职位和那些应用角色有映射关系
        RoleMapp.find({mapId:_mapId,organPosId:_organPosId},function(error,rolemaps){
            if ( error ) {
                console.log("controller:roleMapping,methodName:organPosMappingList"+error);
                res.render('Error',{
                    message:"映射Id"+_mapId+"角色映射查询出错！</br>"+error
                })
            }
            if ( rolemaps == null || rolemaps.length ==0 ) {  // 若该组织职位之前没有映射记录，则直接跳转至映射编辑页面
                res.render('EditOrganPosMappingById',{
                    title:_depName+_organRoleName+ _organPosName+"的映射关系",
                    organPosId:_organPosId,
                    organPosName: _organPosName,
                    mapId: _mapId,
                    busiRoles: busiRoles
                });
            }
            // 映射的长度
            var lenOfRoleMaps = rolemaps.length;
            var i =0;
            while ( i < lenOfRoleMaps ) {  // 遍历角色映射关系
                // 将映射的业务角色Id和名称放入map中，方便后续查找
                _mappedBusiRole.put(rolemaps[i].busiRoleId,rolemaps[i].busiRoleName);
                i++;
            }
            var _markedBusiRoleLists = new Array();
            var lenOfBusiRoles = busiRoles.length;
            var j =0;
            while (j < lenOfBusiRoles ) {
                var _markedBusiRoleList = new Object();
                _markedBusiRoleList['busiRoleName'] = busiRoles[j].name; // 应用名称
                _markedBusiRoleList['busiRoleId'] = busiRoles[j]._id.toString();
                if ( _mappedBusiRole.get(busiRoles[j]._id.toString())) {
                    _markedBusiRoleList['isMapped'] = true;
                } else {
                    _markedBusiRoleList['isMapped'] = false;
                }
                _markedBusiRoleLists.push(_markedBusiRoleList);
                j++;
            }
            res.render('EditOrganPosMappingById',{
                title: _depName+_organRoleName+_organPosName+"的映射关系",
                organPosId:_organPosId,
                organPosName: _organPosName,
                mapId: _mapId,
                markedBusiRoleLists: _markedBusiRoleLists
            });
        }); // RoleMapp.find()

    })
};

// 组织角色与业务角色的映射
exports.organRoleMappingList = function (req,res) {
    var _organRoleId = req.params.id;
    var _mapId = req.params.mapId;
    var _appName = req.params.appName;
    var _organRoleName = req.params.organRoleName;
    var _userId = req.session.user._id.toString();
    var _role2PosMapping = new Array();
    // 根据应用名获取应用角色列表
    BusiRole.find({appName:_appName}, function (error,busiRoles) {
        if (error) {
            console.log("controller:roleMapping,methodName:organRoleMappingList" + error);
            res.render('Error', {
                message: "应用名称：" + _appName + "数据库读取出错！</br>" + error
            })
        }
        if (busiRoles == null || busiRoles.length == 0) {
            console.log("controller:roleMapping,methodName:organRoleMappingList" + _appName + "业务角色为空");
            res.render('Error', {
                message: "应用名称：" + _appName + "未添加任何业务角色！</br>" + error
            })
        }
        // 根据组织角色获取所有的相关的组织职位
        OrganPos.find({roleName:_organRoleName,userId:_userId},function(err,organRolePos){
            if ( err ) {
                console.log("controller:roleMapping,methodName:organRoleMappingList" + err);
                res.render('Error', {
                    message: error
                })
            }
            // 遍历所有的业务角色，并查找该组织角色所包含的职位与业务角色之间的关系
            if ( organRolePos != null && organRolePos.length>0 ) {
                var organRole2busiRoleListMapped =  new Array(); // 返回的业务角色对应的职位映射信息集合
                var index =0;
                var busiRolesLen = busiRoles.length;
                for ( var i=0; i<busiRolesLen ; i++ ) {
                    // 根据业务角色查找映射关系
                    RoleMapp.find({mapId:_mapId,busiRoleName:busiRoles[i].name},function(error,appRoleMappings){
                        if (error) {
                            console.log("controller:roleMapping,methodName:organRoleMappingList" + error);
                            res.render('Error', {
                                message: "应用角色：" + _appName + "数据库读取出错！</br>" + error
                            })
                        }
                        var organRolePosLen = organRolePos.length;
                        var busiRoleMapp = new Object(); // 建立新的业务角色对象：包含id，name，组织角色包含的职位
                        busiRoleMapp['_id'] = busiRoles[index]._id.toString();
                        busiRoleMapp['busiRoleName'] = busiRoles[index].name;
                        var organRolePosMap = new HashMap(); // 将该组织角色所包含的职位放入map中，方便后续查找
                        for ( var k =0; k < organRolePosLen ;k++) { // 重新构造信息的组织职位对象，并将组织职位信息放入hashmap中
                            var organRole2Pos = new Object(); // 建立信息组织职位对象，包含属性:职位id，name,与该业务角色的映射关系
                            organRole2Pos["_id"] = organRolePos[k]._id.toString();
                            organRole2Pos['posName'] = organRolePos[k].posName;
                            organRole2Pos['depName'] = organRolePos[k].depName;
                            organRole2Pos['isMapped'] = false; // 初始构造默认为未与业务角色映射
                            organRolePosMap.put(organRolePos[k]._id.toString(),organRole2Pos);
                        }
                        // 若该业务角色存在映射关系，则查找该业务角色与该组织角色所包含的职位之间的映射关系
                        if( appRoleMappings !=null && appRoleMappings.length >0 ) {
                            var theNumOfMapped =0;
                            // 遍历该业务角色的映射关系
                            for ( var j =0; j<appRoleMappings.length; j++ ) {
                                if ( organRolePosMap.get(appRoleMappings[j].organPosId.toString())) { // 如果该业务角色与该组织角色所包含的职位之间存在映射关系
                                    // 记录该映射关系
                                    var organRoleP = organRolePosMap.get(appRoleMappings[j].organPosId.toString());
                                    organRoleP.isMapped = true;
                                    theNumOfMapped++; // 记录该组织角色包含的职位被映射的次数
                                    organRolePosMap.put(organRoleP._id.toString(),organRoleP); // 改变映射值再放入map中

                                    _role2PosMapping.push(appRoleMappings[j]);    // 存在map中方便之后更新关系时的查找
                                }
                                // 若该业务角色所映射的职位不在该组织角色所包含的范围内则不做任何事情
                            }
                            busiRoleMapp['isMapped'] = theNumOfMapped == organRolePosLen;// 若该组织角色所有的职位都被该业务角色所映射则mapped的值为true，否则为false
                            busiRoleMapp['organRolePosList'] = organRolePosMap.toArray(); // 将map转成数组放入该业务角色的属性中

                        } else { // 否则直接将该组织角色所包含的职位放入该业务角色中标记为未映射
                            busiRoleMapp['isMapped']= false;
                            busiRoleMapp['organRolePosList'] = organRolePosMap.toArray();
                        }
                        organRole2busiRoleListMapped.push(busiRoleMapp);
                        if ( index == busiRolesLen -1 ) {
                            res.render('EditOrganRoleMappingList',{
                                title: _organRoleName+"的映射编辑",
                                organRole2busiRoleLists: organRole2busiRoleListMapped,
                                role2PosMapping: _role2PosMapping,
                                mapId: _mapId
                            })
                        }
                        index ++;
                    });
                }

            }
        })

    });
};

// 组织部门与应用角色的映射关系的查询  // 与组织角色与应用角色的映射关系类似
/*逆向查询 所有应用角色->部门对应的职位->部门所拥有的职位与应用角色的映射关系（1：n）HashMap->部门所拥有的职位与所有应用角色的映射关系
1、先根据应用名称查询所对应的应用角色列表
2、根据部门名称与用户名查询该部门所拥有的所有职位
3、遍历应用角色并查询应用角色的映射关系得到与该应用角色映射的职位列表
4、遍历应用角色与职位所有的映射关系，如果该职位存在于部门职位列表中则标记为已映射，否则标记为未映射
5、当所有的部门职位列表都在改应用角色已映射的职位列表中则将该应用角色标记为已映射，否则标记为未映射
6、同时记录该部门拥有的所有的职位与应用角色已有的映射关系
 */
/*
return 值：organDep2busiRoleLists<Object>
Object: id: 应用角色id、name:应用角色名称,organDepPosList:组织部门所有的职位列表对象集，isMapped:是否与该部门映射
 organDepPosList：isMapped：是否与该应用角色映射，organPos：组织部门所有的职位列表集
 */
exports.organDepMappingList = function ( req,res) {
    var _mapId = req.params.mapId;
    var _appName = req.params.appName;
    var _organDepName = req.params.organDepName;
    var _userId = req.session.user._id.toString();
    var _role2PosMapping = new Array();
    // 根据应用名获取应用角色列表
    BusiRole.find({appName:_appName}, function (error,busiRoles) {
        if (error) {
            console.log("controller:roleMapping,methodName:organDepMappingList" + error);
            res.render('Error', {
                message: "应用名称：" + _appName + "数据库读取出错！</br>" + error
            })
        }
        if (busiRoles == null || busiRoles.length == 0) {
            console.log("controller:roleMapping,methodName:organDepMappingList" + _appName + "业务角色为空");
            res.render('Error', {
                message: "应用名称：" + _appName + "未添加任何业务角色！</br>" + error
            })
        }
        // 根据组织部门名称获取所有的相关的组织职位
        OrganPos.find({depName:_organDepName,userId:_userId},function(err,organDepPos){
            if ( err ) {
                console.log("controller:roleMapping,methodName:organDepMappingList" + err);
                res.render('Error', {
                    message: error
                })
            }
            // 遍历所有的业务角色，并查找该组织部门所包含的职位与业务角色之间的关系
            if ( organDepPos != null && organDepPos.length>0 ) {
                var organDep2busiRoleListMapped =  new Array(); // 返回的业务角色对应的职位映射信息集合
                var index =0;
                var busiRolesLen = busiRoles.length;
                for ( var i=0; i<busiRolesLen ; i++ ) {
                    // 根据业务角色查找映射关系
                    RoleMapp.find({mapId:_mapId,busiRoleName:busiRoles[i].name},function(error,appRoleMappings){
                        if (error) {
                            console.log("controller:roleMapping,methodName:organDepMappingList" + error);
                            res.render('Error', {
                                message: "应用角色：" + _appName + "数据库读取出错！</br>" + error
                            })
                        }
                        var organDepPosLen = organDepPos.length;
                        var busiRoleMapp = new Object(); // 建立新的业务角色对象：包含id，name，组织角色包含的职位
                        busiRoleMapp['_id'] = busiRoles[index]._id.toString();
                        busiRoleMapp['busiRoleName'] = busiRoles[index].name;
                        var organDepPosMap = new HashMap(); // 将该组织部门所包含的职位放入map中，方便后续查找
                        for ( var k =0; k < organDepPosLen ;k++) { // 重新构造新的组织职位对象，并将组织职位信息放入hashmap中
                            var organDep2Pos = new Object(); // 建立信息组织职位对象，包含属性:职位id，name,与该业务角色的映射关系
                            organDep2Pos["_id"] = organDepPos[k]._id.toString();
                            organDep2Pos['posName'] = organDepPos[k].posName;
                            organDep2Pos['roleName'] = organDepPos[k].roleName;
                            organDep2Pos['isMapped'] = false; // 初始构造默认为未与业务角色映射
                            organDepPosMap.put(organDepPos[k]._id.toString(),organDep2Pos);
                        }
                        // 若该业务角色存在映射关系，则查找该业务角色与该组织部门所包含的职位之间的映射关系
                        if( appRoleMappings !=null && appRoleMappings.length >0 ) {
                            var theNumOfMapped =0; // 记录该组织角色包含的职位被映射的次数
                            // 遍历该业务角色的映射关系
                            for ( var j =0; j<appRoleMappings.length; j++ ) {
                                if ( organDepPosMap.get(appRoleMappings[j].organPosId.toString())) { // 如果该业务角色与该组织角色所包含的职位之间存在映射关系
                                    // 记录该映射关系
                                    var organDep = organDepPosMap.get(appRoleMappings[j].organPosId.toString());
                                    organDep.isMapped = true;
                                    theNumOfMapped++;
                                    organDepPosMap.put(organDep._id.toString(),organDep); // 改变映射值再放入map中
                                    _role2PosMapping.push(appRoleMappings[j]);    // 存储映射关系，并返回方便之后更新关系
                                }
                                // 若该业务角色所映射的职位不在该组织部门所包含的职位集合内则不做任何事情
                            }
                            busiRoleMapp['isMapped'] = theNumOfMapped == organDepPosLen;// 若该组织部门所有的职位都被该业务角色所映射则mapped的值为true，否则为false
                            busiRoleMapp['organDepPosList'] = organDepPosMap.toArray(); // 将map转成数组放入该业务角色的属性中

                        } else { // 否则直接将该组织角色所包含的职位放入该业务角色中标记为未映射
                            busiRoleMapp['isMapped']= false;
                            busiRoleMapp['organDepPosList'] = organDepPosMap.toArray();
                        }
                        organDep2busiRoleListMapped.push(busiRoleMapp);
                        if ( index == busiRolesLen -1 ) {
                            res.render('EditOrganDepMappingList',{
                                title: _organDepName+"的映射编辑",
                                organDep2busiRoleLists: organDep2busiRoleListMapped,
                                role2PosMapping: _role2PosMapping,
                                mapId: _mapId
                            })
                        }
                        index ++;
                    });
                }

            }
        })

    });
};

// 根据业务角色删除映射关系
exports.delBusiRoleMapping = function(req,res,next ) {
    // 先查询该业务角色是否已经建立过映射，有则删除业务角色已有的映射关系，没有则next进行添加
    var _mapId = req.params.mapId;
    var _busiRoleId = req.params.busiRoleId;
    var _busiRoleName = req.params.busiRoleName;
    RoleMapp.find({mapId:_mapId,busiRoleId:_busiRoleId},function (error , rolemapps) { // 查询
        if ( error ) {
            console.log("controller:roleMapping,methodName:delBusiRoleMapping"+error);
            res.render('Error',{
                message:"映射Id"+_mapId+"业务角色名"+_busiRoleName+"角色映射查询出错！</br>"+error
            })
        }
        if ( rolemapps == null || rolemapps.length ==0 ) {
            next();  // 若该业务角色未建立过映射关系,则直接跳转至next,添加映射关系
        }
        if ( rolemapps != null && rolemapps.length > 0 ) {  // 若该业务角色已经建立过映射关系则先删除
            for(var j = 0; j < rolemapps.length; j++ )  {
                RoleMapp.remove({_id:rolemapps[j]._id},function(error,rolemap){
                    if ( error ) {
                        console.log("controller:roleMapping,methodName:delBusiRoleMapping"+error);
                        res.render('Error',{
                            message:"映射Id"+_mapId+"业务角色名"+_busiRoleName+"删除映射关系出错！</br>"+error
                        })
                    }
                })
            }  // 删除完毕
            next(); // next 转至添加
        }
    });
};

// 添加特定业务角色与多个组织职位的映射关系
exports.addBusiRoleMapping = function (req,res,next ) {
    var _mapId = req.params.mapId;
    var _busiRoleId = req.params.busiRoleId;
    var _busiRoleName = req.params.busiRoleName;
    var  string = req.params.mappedOrganPos;
    var _mappedOrganPos = JSON.parse( string );  // 将json字符串格式转换成对象
    var i =0 ; // 索引
    while ( i < _mappedOrganPos.length) {  // 遍历该组织角色对象
        var roleMapp = new RoleMapp({
            mapId: _mapId,
            organPosName: _mappedOrganPos[i].posName,
            busiRoleName: _busiRoleName,
            organPosId: _mappedOrganPos[i]._id.toString(),
            busiRoleId: _busiRoleId,

        });
        roleMapp.save( function(error,rolemap) {
            if ( error ) {
                console.log("controller:roleMapping,methodName:addBusiRoleMapping"+error);
                res.render('Error',{
                    message:"映射Id"+_mapId+"业务角色名"+_busiRoleName+"存入数据库出错！</br>"+error
                })
            }
            console.log(rolemap);
        });
        i++;
    }
    next();
};

//根据组织职位 删除映射关系 和delBusiRoleMapping相同
exports.delOrganPosMapping = function(req,res,next ) {
    // 先查询该组织职位是否已经建立过映射，有则删除组织职位已有的映射关系，没有则next进行添加
    var _mapId = req.params.mapId;
    var _organPosId = req.params.organPosId;
    var _organPosName = req.params.organPosName;
    RoleMapp.find({mapId:_mapId,organPosId:_organPosId},function (error , rolemapps) { // 查询
        if ( error ) {
            console.log("controller:roleMapping,methodName:delOrganPosMapping"+error);
            res.render('Error',{
                message:"映射Id"+_mapId+"组织职位名"+_organPosName+"角色映射查询出错！</br>"+error
            })
        }
        if ( rolemapps == null || rolemapps.length ==0 ) {
            next();  // 若该组织角色未建立过映射关系,则直接跳转至next,添加映射关系
        }
        if ( rolemapps != null && rolemapps.length > 0 ) {  // 若该组织角色已经建立过映射关系则先删除
            for(var j = 0; j < rolemapps.length; j++ )  {
                RoleMapp.remove({_id:rolemapps[j]._id},function(error,rolemap){
                    if ( error ) {
                        console.log("controller:roleMapping,methodName:delOrganRoleMapping"+error);
                        res.render('Error',{
                            message:"映射Id"+_mapId+"组织职位名"+_organPosName+"删除映射关系出错！</br>"+error
                        })
                    }
                })
            }  // 删除完毕
            next(); // next 转至添加
        }
    });
};

// 添加特定组织职位与多个业务角色的映射关系
exports.addOrganPosMapping = function (req,res,next ) {
    var _mapId = req.params.mapId;
    var _organPosId = req.params.organPosId;
    var _organPosName = req.params.organPosName;
    var  string = req.params.mappedBusiRoles;
    var _mappedBusiRoles = JSON.parse( string );  // 将json字符串格式转换成对象
    var i =0 ; // 索引
    while ( i < _mappedBusiRoles.length) {  // 遍历该组织角色对象
        var roleMapp = new RoleMapp({
            mapId: _mapId,
            organPosName: _organPosName,
            busiRoleName: _mappedBusiRoles[i].name,
            organPosId: _organPosId,
            busiRoleId: _mappedBusiRoles[i]._id
        });
        roleMapp.save( function(error,rolemap) {
            if ( error ) {
                console.log("controller:roleMapping,methodName:addOrganPosMapping"+error);
                res.render('Error',{
                    message:"映射Id"+_mapId+"组织职位名"+_organPosName+"存入数据库出错！</br>"+error
                })
            }
            console.log(rolemap);
        });
        i++;
    }
    next();
};

// 组织角色与业务角色映射的更新
exports.updateOrganMapping = function ( req,res,next ) {
    var role2PosOldString = req.params.role2PosOldString;
    var role2PosNewString = req.params.role2PosNewString;
    var role2PosOldObj = JSON.parse(role2PosOldString);
    var role2PosNewObj = JSON.parse(role2PosNewString);
    var role2PosOldMap = new HashMap();
    if ( role2PosOldObj!= null && role2PosOldObj.length > 0 ) {
        for (var j = 0; j < role2PosOldObj.length;j++ ) {
            var oldKey = role2PosOldObj[j].busiRoleId+role2PosOldObj[j].organPosId; // map 的Key值为业务角色id和组织职位id
            role2PosOldMap.put(oldKey,role2PosOldObj[j]);  // 将来原组织角色映射关系放入hashmap中便于之后的查找
        }
    }
    for ( var i=0;i<role2PosNewObj.length;i++) {
        var isExist = false;
        var newKey = role2PosNewObj[i].busiRoleId+role2PosNewObj[i].organPosId;
        if ( role2PosOldMap.get(newKey) )  {  // 如果该映射之前存在
            role2PosOldMap.remove(newKey);
            isExist = true;
        }
        if ( !isExist ) { // 如果该映射之前不存在
            roleMap = new RoleMapp(role2PosNewObj[i]);
            roleMap.save(function (error,roleMap){
                if ( error) {
                    console.log("controller:roleMapping,methodName:updateOrganRoleMapping"+error);
                    res.render('Error',{
                        message:"controller:roleMapping,methodName:updateOrganRoleMapping存入数据库出错！</br>"+error
                    })
                }
                if ( roleMap) {
                    console.log(roleMap);
                }
            })
        }
    }
    try {
        var role2PosOldArray = role2PosOldMap.toArray();
    } catch( e) {
        next();
        console.log(e);
    }
    if ( role2PosOldArray!=null && role2PosOldArray.length  > 0  ) {  // 若旧的映射存在，而在新的映射中不存在，则删除该映射
        for ( var k = 0;k<role2PosOldArray.length;k++) {
            RoleMapp.remove({_id:role2PosOldArray[k]._id.toString()},function(err,rolemap){
                if ( err) {
                    console.log("controller:roleMapping,methodName:updateOrganRoleMapping"+err);
                    res.render('Error',{
                        message:"controller:roleMapping,methodName:updateOrganRoleMapping存入数据库出错！</br>"+err
                    })
                }
                if ( rolemap) {
                    console.log(rolemap+"removed");
                }
            })
        }
    }
    next();
};