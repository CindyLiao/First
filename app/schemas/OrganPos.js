/**
 * Created by yuzaizai on 2016/11/22.
 */
// 组织职位信息

var  mongoose = require('mongoose');

var OrganPosSchema = new mongoose.Schema({
    empId: String,
    depId: String,
    depName: String,
    roleId: String,
    roleName: String,
    posId: String,
    posName: String,
    userId: String,
    organName: String,
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

OrganPosSchema.statics = {
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

module.exports = OrganPosSchema;