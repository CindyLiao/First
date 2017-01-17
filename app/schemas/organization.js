/**
 * Created by yuzaizai on 2016/5/24.
 */
var mongoose = require('mongoose');

var OrganSchema = new mongoose.Schema({
    organName: String,
    posUri: {
        unique: true,
        type: String
    },
    roleUri: {
        unique: true,
        type: String
    },
    depUri: {
        unique: true,
        type: String
    },
    userId: String,
    account: String,
    accessPwd : String,
    mapState: {
        Type: Boolean,
        default: false
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
OrganSchema.statics = {
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
module.exports = OrganSchema;
