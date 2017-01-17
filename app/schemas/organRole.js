/**
 * Created by yuzaizai on 2016/5/24.
 */
var mongoose = require('mongoose');

var OrganRoleSchema = new mongoose.Schema({
    roleId: String,
    name: String,
    proper: String,
    organName: String,
    timesUpdate: Number,
    userId: String,
    mapStatu: {
        Type: Number,
        default:0
    },
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
OrganRoleSchema.statics = {
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
module.exports = OrganRoleSchema;
