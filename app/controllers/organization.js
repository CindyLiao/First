/**
 * Created by yuzaizai on 2016/5/25.
 */

var Organ = require('../models/organization');
var request = require('request');
var OrganRole = require('../models/organRole');

//show signup

exports.showsignup = function(req,res) {
    res.render('organsignup',{
        title: '组织注册页面'
    })
};
//do signup
exports.organsignup = function(req,res){
    var _organization = req.body.organization;

    Organ.findOne({organName:_organization.organName},function(err,org){
        if (err){
            console.log(err);
        }
        if (org){//判断组织是否已经存在
            return res.redirect('/');
        } else { //不存在则将保存组织信息
            organ = new Organ(_organization);
            organ.save(function(err,organ){
                if (err) {
                    console.log(err);
                }
               if(organ){
                    req.session.organ = organ;
                   res.redirect('/organrole/addOrganRole');
               }
            });
        }
    });
    console.log(_organization);
};


//organList
exports.organList = function(req,res) {
  var user = req.session.user;
  Organ.find({userId:user._id},function(err,organs){
        if(err){
            console.log(err);
        }
        if(organs) {
            res.render('organizationList',{
                organs:organs
            });
        }

  });
};