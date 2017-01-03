/**
 * Created by yuzaizai on 2016/12/28.
 */
var mongoose = require('mongoose');

// 缓存数据持久化
var CacheDataSchema = new mongoose.Schema({
    userName: String,
    operation: String,
    resourceName: String,
    resourceId: String,
    data:String,
    meta:{
        createAt: {
            type:Date,
            default:Date.now()
        },
        updateAt: {
            type:Date,
            default:Date.now()
        }
    }

});

CacheDataSchema.pre('save',function(next){
    if(this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now();
    } else  {
        this.meta.updateAt = Date.now();
    }
    next();
});

CacheDataSchema.statics = {
    fetch: function(cb) {
        return this
            .find({})
            .sort('meta.updateAt')
            .exec(cb)
    },
    findById: function (id,cb) {
        return this
            .findOne({_id: id})
            .exec(cb)
    }
};

module.exports = CacheDataSchema;