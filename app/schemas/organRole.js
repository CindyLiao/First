/**
 * Created by yuzaizai on 2016/5/24.
 */
var monoose = require('mongoose');

var OrganRoleSchema = new monoose.Schema({
    name: String,
    proper: String,
    organId: String,
    timesUpdate: Number,
    userId: String,
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
