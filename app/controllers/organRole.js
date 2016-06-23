/**
 * Created by yuzaizai on 2016/5/27.
 */
var OrganRole = require('../models/OrganRole');
var Organ = require('../models/organization');
var request = require('request');
exports.addOrganRole = function(req,res) {
    var organ = req.session.organ;
    var userId = req.session.user._id.toString();


     request.get({url:organ.uri},function(error,roleNames){

         console.log(roleNames.body);

         var body = roleNames.body;

         var obj = JSON.parse(body);
         var len = obj.roles.length;
         var i=0;
         for(;i<len;i++) {
             var organrole = new OrganRole();
             organrole.name = obj.roles[i].roleName;
             organrole.organId = organ._id.toString();
             organrole.userId = userId;
             organrole.save(function (error, or) {
                 if (error) {
                     console.log(error);
                 }
                 console.log(or);
             });
         }
         res.redirect('/organrole/organroleList');
     })

};

//organroleList
exports.organroleList = function(req,res) {
     OrganRole.fetch(function(error,roles){
         if(error) {
             console.log(error);
         }
         res.render('organroleList',{
             roles:roles
         })
    })
};