/**
 * Created by yuzaizai on 2016/12/22.
 */
var Cache = require('memory-cache');
var HashMap = require('../models/HashMap');


// 将保持的数据放入cache中，格式为key = 操作对象名+id  value 为HashMap 结构（key 为当前操作状态，
// 操作状态为之前一系列操作的叠加最终状态，value结果为一系列操作的最终结果 ）
exports.saveOrganResource = function(req,res) {
        var cacheObj = new  HashMap();
        var param = req.body.param;
        res.end();

};