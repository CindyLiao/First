/**
 * Created by yuzaizai on 2016/11/22.
 */
// 组织部门信息
var mongoose = require('mongoose');

var OrganDepSchema = new mongoose.Schema({
    depId: String,
    parentDepId: String,
    depName: String,
    userId: String,
    organName: String,
    proper: String,
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

OrganDepSchema.statics = {
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

module.exports = OrganDepSchema;