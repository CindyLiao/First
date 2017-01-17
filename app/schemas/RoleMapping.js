/**
 * Created by yuzaizai on 2016/11/7.
 */
// 角色映射表 模式定义
var mongoose = require('mongoose');

var RoleMappSchema = new mongoose.Schema({
    mapId: String,
    organPosName: String,
    busiRoleName: String,
    organPosId: String,
    busiRoleId: String,
    meta: {
        createAt: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }

});
RoleMappSchema.statics = {
    fetch: function(cb) {
        return this
            .find({})
            .sort('meta.updateAt')
            .exec(cb)
    },
    findById: function(id, cb) {
        return this
            .findOne({_id: id})
            .exec(cb)
    }
};
module.exports = RoleMappSchema;