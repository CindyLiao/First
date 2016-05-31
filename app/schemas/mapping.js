/**
 * Created by yuzaizai on 2016/5/24.
 */
var mongoose = require('mongoose');

var MappSchema = mongoose.Schema({
   name: String,
   userId : String,
   organId: String,
   busiId: String,
   organRoleId:String,
   busiRoleId: String,
   timesUpdate: Number,
   state: Number,
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
MappSchema.statics = {
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
module.exports = MappSchema;
