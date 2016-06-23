/**
 * Created by yuzaizai on 2016/5/24.
 */
var mongoose = require('mongoose');

var BusiRoleSchema = new mongoose.Schema({
    name : String,
    proper: String,
    appliId:String,
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
BusiRoleSchema.statics = {
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
module.exports = BusiRoleSchema;
