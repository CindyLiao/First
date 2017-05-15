/**
 * Created by yuzaizai on 2016/11/2.
 */
var Mapp = require('../models/Mapping');
var Appli = require('../models/Application');
var request = require('request');
var OrganPos = require('../models/OrganPos');
var RoleMapp = require('../models/RoleMapping');
var HashMap = require('../models/HashMap');
var Organ = require('../models/Organization');
var BusiRole = require('../models/BusinessRole');
var Promise = require('promise');

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

exports.getOrganMappedBusiRole = function ( req,res,next) {
    var _userId = req.session.user._id.toString();
    var _organMappedBusiRoleArray = new Array ();  // 存储组织对应的所有的业务角色Id
    var _organMappedBusiRoleMap = new Map(); // key 为组织对应的业务角色Id，value 为该业务角色在_organMappedBusiRoleArray中的位置
    // 获取与组织系统映射的所有应用的所有业务角色   注：一个用户只能注册一个组织系统
    Organ.findOne( {userId:_userId}, function ( organFind, organ ) {
        if ( organFind ) {
            console.log(organFind);
            res.render('Error',{
                message: findErr
            });
        }
        if ( organ == null || organ == undefined ) { // 若该用户未注册组织系统
            res.render('RegisterOrgan',{
                title: '组织注册页面'
            })
        }
        // 查找与该组织映射的所有应用
        Mapp.find( {organName: organ.organName} , function ( appliFind, applis) {
            if ( appliFind ) {
                console.log(appliFind);
                res.render('Error',{
                    message: appliFind
                });
            }
            if ( applis == null || applis == undefined ) {
                res.render('RegisterApp',{
                    title: "应用注册页面"
                })
            }
            var _appliIndex = 0;
            // 查找所有应用的业务角色
            applis.forEach ( function ( appli ) {
                // 查找该应用的所有业务角色
                BusiRole.find({ appName: appli.appName} , function ( busiRoleFindErr, busiRoles) {
                    _appliIndex++;
                    var _busiRoleIndex =0;
                    if ( busiRoleFindErr ) {
                        console.log(busiRoleFindErr);
                        res.render('Error',{
                            message: busiRoleFindErr
                        });
                    }
                    if ( busiRoles == null || busiRoles == undefined ) {
                        // 若该应用还未与组织系统建立角色映射关系，则什么都不做，跳至下一个应用
                    } else {
                        busiRoles.forEach( function ( busiRole ) {
                            _busiRoleIndex++;
                            _organMappedBusiRoleArray.push(busiRole._id.toString()); // 将busiRoleId 放入
                            _organMappedBusiRoleMap.set(busiRole._id.toString(),_organMappedBusiRoleArray.length-1) ;  //key = busiRoleId, value 为其在数组中的位置。
                        });
                        if ( _busiRoleIndex == busiRoles.length && _appliIndex == applis.length ) {
                            req.params.organMappedBusiRoleArray = _organMappedBusiRoleArray;
                            req.params.organMappedBusiRoleMap = _organMappedBusiRoleMap;
                            next();
                        }
                    }
                });
            });

        })

    });
};

// 根据映射关系分析组织关系
exports.analysis = function ( req,res,next ) {
    var _userId = req.session.user._id.toString();
    var _organMappedBusiRoleArray = req.params.organMappedBusiRoleArray;  // 存储组织对应的所有的业务角色Id
    var _organMappedBusiRoleMap = req.params.organMappedBusiRoleMap; // key 为组织对应的业务角色Id，value 为该业务角色在_organMappedBusiRoleArray中的位置
    var _posMappedBusiRole = new Array(); // Array中为Object，Object[Key] = OrganPos,[ value] = _organPosMappedString 字符串信息。array为映射的业务角色数组
    OrganPos.find({userId: _userId}, function (findErr, organPosList) { // 因为用户只能有一个组织系统所以用userId查等于用组织id
        if (findErr) {
            console.log("Mapping.js:analysis" + findErr);
            res.render('Error', {
                message: findErr
            });
        }
        var _organPosListIndex = 0;
        //var _mappedHash = new HashMap(); // key 为职位ID，value 为obj,obj key = 与hashkey 职位ID最相似的职位ID，value= 值相似度
        organPosList.forEach(function (organPos) {
            RoleMapp.find({organPosId: organPos._id.toString()}, function (mapFindErr, roleMappList) {
                _organPosListIndex++;
                console.log("organ"+_organPosListIndex);
                // 每个职位对应的映射Array，对比_organMappedBusiRoleArray中所有的业务角色，若职位与业务角色存在映射则将相应的位置置1，否则默认为0

                if (mapFindErr) {
                    console.log("Mapping.js:analysis" + mapFindErr);
                    res.render('Error', {
                        message: mapFindErr
                    });
                }
                var _objHash = new HashMap(); // 辅助空间
                var _organPosMappedArray = new Array(_organMappedBusiRoleArray.length).fill(0); // 创建一个长度和_organMappedBusiRoleArray.相同的数组并且初始值都为0
                var _mappedPosition = new Array(); // 记录organPos 映射的busiRole在_organMappedBusiRoleArray中的位置
                var _roleMappListLen = roleMappList.length;
                for ( var i=0; i < _roleMappListLen; i++ ) {
                    var _busiRoleId = roleMappList[i].busiRoleId;
                    // 获取这个业务角色在_organMappedBusiRoleArray中的位置，并将_organPosMappedArray中相应的位置置1
                    var _busiRolePosInOrganMappedArray = _organMappedBusiRoleMap.get(_busiRoleId); // 获取对应的位置信息
                    _organPosMappedArray[_busiRolePosInOrganMappedArray] = 1;
                   // _mappedPosition.push(_busiRolePosInOrganMappedArray);
                    _objHash.put(_busiRolePosInOrganMappedArray,_busiRolePosInOrganMappedArray);
                    if ( i == _roleMappListLen-1) {
                        var _organPosMappedString = _organPosMappedArray.join(''); // 转成字符串形式
                        var _obj = new Object();
                        _obj["organPosId"] = organPos;
                        _obj["value"] = _organPosMappedString;
                        _obj["array"] = _objHash;
                        _posMappedBusiRole.push(_obj);
                    }
                }

                if ( _organPosListIndex == organPosList.length ) {
                    req.params.organPosMapped = _posMappedBusiRole;
                    next();
                }

            });
        });
    });
};

// 分析相似度
exports.similarity = function ( req,res) {
    var _posMappedBusiRole = req.params.organPosMapped;
    var _organPosMappedLen = _posMappedBusiRole.length;
    var _organPosHash = new HashMap();
    var _similarArray = new Array();
    var _matrixArray = new Array();  // 映射矩阵
    for ( var i = 0; i < _organPosMappedLen;i++ ) {
        var _stringValue = _posMappedBusiRole[i].value;
        var _rowValue = _stringValue.split("");
        _matrixArray.push( _rowValue );
        var _organPosId = _posMappedBusiRole[i].organPosId;
        var _mappedArray = _posMappedBusiRole[i].array.toArray();  // 将hash转成数组
        for ( var j =i+1; j<_organPosMappedLen; j++)  { // 与已经遍历的organPos做相似度比较
            var _objOrganPosId = _posMappedBusiRole[j].organPosId;
            var _busiHash = _posMappedBusiRole[j].array;
            var _count =0 ;
            for ( var h=0; h < _mappedArray.length; h++ ) {   // 计算相似的个数
                if ( _busiHash.get( _mappedArray[h] ) != null ) _count++;
            }
            // 计算相似度 sim = countSim相似个数/ sum总个数
            var _sim =( _count / (_mappedArray.length+_busiHash.length-_count) ) * 100 ;
            // 记录每组相似度
            var _simObj = new Object();
            _simObj["name"] = _organPosId.depName + _organPosId.roleName+_organPosId.posName;
            _simObj["fName"] = _objOrganPosId.depName + _objOrganPosId.roleName+_objOrganPosId.posName;
            _simObj["value"] = _sim.toString().substring(0,4);
            _similarArray.push(_simObj);
            //if ( _organPosHash.get(_organPosId) != null  ) {  // 取最大相似度
            //    var _simOrgan = _organPosHash.get( _organPosId).sim;
            //    if ( _sim > _simOrgan ) {
            //        _organPosHash.get(_organPosId).simId = _objOrganPosId;
            //        _organPosHash.get(_organPosId).sim = _sim;
            //    }
            //} else {
            //    var _simObj = new Object();
            //    _simObj["simId"] = _objOrganPosId;
            //    _simObj["sim"] = _sim;
            //    _organPosHash.put (_organPosId, _simObj);
            //}
        }
    }

  res.render('Analysis',{
      'title':"映射相似度分析",
      analysisData: _similarArray.sort(sortMethod)
  })

};

// 职位的冗余度计算
exports.redundancy = function ( req,res) {
    var _posMappedBusiRole = req.params.organPosMapped;
    var _organPosMappedLen = _posMappedBusiRole.length;
    // 用简化的高斯消元求映射矩阵的秩
    var _colLen = _posMappedBusiRole[0].value.length;
    var _rowLen = _organPosMappedLen;
    var _matrixArray = new Array();  // 映射矩阵
    for ( var i = 0; i < _organPosMappedLen;i++ ) {
        var _stringValue = _posMappedBusiRole[i].value;
        var _rowValue = _stringValue.split("");
        _matrixArray.push(_rowValue);
    }
    console.log("消元前的矩阵");
    for ( var _before = 0; _before < _rowLen;_before++) {
        var s = "";
        for ( var _beforeCol =0; _beforeCol < _colLen; _beforeCol++) {
            s += _matrixArray[_before][_beforeCol];
        }
        console.log(s);
    }

    var _maxRowV,col,row,_temp;
    for ( col= 0; col< _colLen; col++) {
        _maxRowV = col;
        for ( row = col;row< _rowLen; row++) {   // 因为矩阵中最大的值为1，所以找到为1的元素的位置即可。
            if ( _matrixArray[row][col]  == 1 ) {
                _maxRowV = row;
                break;
            }
        }
        // 与值为1的行交换
        if( _maxRowV != col) {
            var temp;
            for ( var k = col;k< _colLen;k++ ) {
                temp = _matrixArray[col][k];
                _matrixArray[col][k] = _matrixArray[_maxRowV][k];
                _matrixArray[_maxRowV][k] = temp;
            }
        }
        // 消元
        for ( row = col+1; row< _rowLen;row++) {
            if ( _matrixArray[col][col] == 0 ) { // 若元素为0则换下一行
                continue;
            }
            _temp = _matrixArray[row][col] / _matrixArray[col][col];
            for ( k = col; k < _colLen; k++ ) {
                _matrixArray[row][k] -= _matrixArray[col][k]* _temp;
            }
        }
        console.log("列"+col);
    }
    console.log("消元后的矩阵的秩");
    var _rank = 0;
    for ( var _end = 0; _end < _rowLen;_end++) {
        var ss= "";
        for ( var _endCol =0; _endCol < _colLen; _endCol++) {
            ss += _matrixArray[_end][_endCol];
            if ( _matrixArray[_end][_endCol] != 0 ) {  // 若某行中存在不为0 的数，则秩加1,且判断下一行
                ++_rank;
                break;
            }
        }
        console.log("秩"+_rank);
    }
    res.render('Rank',{
        'title':"映射冗余度分析",
        rowNum: _rowLen,
        rank: _rank
    })

};
function sortMethod(a,b) { //定义array数组的排序方式，从大到小排序
    return -(a.value - b.value);  // 若a 大于b 则返回小于0，则a出现在b前面
};