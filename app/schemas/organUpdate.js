/**
 * Created by yuzaizai on 2016/5/24.
 */
var mongoose = require('mongoose');
var OrganUpdateSchema= new mongoose.Schema({
   userId: String,
   oldName: String,
   newName: String,
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
OrganUpdateSchema.statics = {
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
module.exports = OrganUpdateSchema;
