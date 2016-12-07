/**
 * Created by yuzaizai on 2016/5/24.
 */
var mongoose = require('mongoose');

var AppliSchema = new mongoose.Schema({
    appName: String,
    uri: {
        unique: true,
        type: String
    },
    userId: String,
    account:String,
    accessPwd: String,
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

AppliSchema.statics = {
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
module.exports = AppliSchema;
