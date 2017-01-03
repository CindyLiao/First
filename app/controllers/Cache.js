/**
 * Created by yuzaizai on 2016/12/22.
 */
var Cache = require('memory-cache');
var HashMap = require('../models/HashMap');
var CacheData = require('../models/CacheData');


// 将保持的数据放入cache中，Cache中key，value结构变化，
//key为用户名，value结构为HashMap<key,value>
//{key为部门、角色等资源名称，
//value结构为HashMap<key,value>【key为资源id，value为数组】})
//Array 结构（key 为当前操作状态，
// 操作状态为之前一系列操作的叠加最终状态，value结果为一系列操作的最终结果 ）
exports.modifyResource = function(req,res) {
  // var cacheObj = new  Array();
   var param = req.body.param;  // 参数为数组，array[0] 为用户信息，array[1]为具体操作信息，array[2]为被修改的资源名称信息，array[3]为被修改后的资源的信息
   if ( param == null || param.length ==0 ) {
       res.end();
   }
   var cacheKey = param[0].userName;   // 用户名
   var arrayRes = new Array();  // 待更新资源信息
   arrayRes.push(param[1]);
   arrayRes.push(param[3]);
   var val = Cache.get(cacheKey);   // 该用户的资源map
   if ( val !=null  ) {   // 判断该用户是否存在
      var orgRes = val.get(param[2]);  // 修改的资源信息，orgRes结构为HashMap<key,value>}){key为部门、角色等资源名称，value结构为HashMap<key,value>
      if ( orgRes != null) {    // 判断要修改的资源已存在缓存
         Cache.get(cacheKey).get(param[2]).put(param[3].id,arrayRes);   // 更新Cache中该条记录信息
      } else {  // 若该资源不存在
         var newOrgRes = new  HashMap();
         newOrgRes.put(param[3].id,arrayRes);
         Cache.get(cacheKey).put(param[2],newOrgRes);
      }
   } else {  // 若该用户不存在
      var cacheobj = new HashMap();
      var newOrgRes = new  HashMap();  // 资源hash
      newOrgRes.put(param[3].id,arrayRes);
      cacheobj.put(param[2],newOrgRes); // 资源名+hash
      Cache.put(cacheKey,cacheobj);
      console.log(Cache.get(cacheKey));
   }
  // Cache.del(cacheKey);
   console.log("modifyOrganResource"+param+"cache"+Cache.get(cacheKey));
   res.end();
};

function err ( error,message ) {
   if ( error != null ) {
      res.render('Error',{
         message: message+error
      })
   }
}

