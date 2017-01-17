/**
 * Created by yuzaizai on 2016/5/24.
 */
var mongoose = require('mongoose');
//2、定义你的数据模型(也就是我们在关系数据库中定义的Table)
var BusiRoleSchema = new mongoose.Schema({
    name : String,
    proper: String,
    appName:String,
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
