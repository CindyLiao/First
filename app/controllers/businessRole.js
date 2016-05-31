/**
 * Created by yuzaizai on 2016/5/29.
 */
var BusiRole = require('../models/businessRole');
var Appli = require('../models/application');
var request = require('request');

exports.addAppRole = function(req,res) {
    var appli = req.session.appli;
    var userId = req.session.user._id.toString();

    request.get({url:appli.uri},function(error,roleNames){

        console.log(roleNames.body);

        var body = roleNames.body;

        var obj = JSON.parse(body);
        var len = obj.roles.length;
        var i=0;
        for(;i<len;i++) {
            var busirole = new BusiRole();
            busirole.name = obj.roles[i].roleName;
            busirole.organId = organ._id.toString();
            busirole.userId = userId;
            busirole.save(function (error, bs) {
                if (error) {
                    console.log(error);
                }
                console.log(bs);
            });
        }
        res.redirect('/organrole/organroleList');
    })

};

//organroleList
exports.busiroleList = function(req,res) {
    OrganRole.fetch(function(error,roles){
        if(error) {
            console.log(error);
        }
        res.render('busiroleList',{
            roles:roles
        })
    })
};