/**
 * Created by yuzaizai on 2016/5/24.
 */
var User = require('../models/application');

var request = require('request');

//show applicatlion signup
exports.showSignup = function (req,res) {
    res.render('appSignup',{
        title: "Ӧ��ע��ҳ��"
    })
};

exports.appSignup = function(req,res) {
    var _application = req.body.application;
    Organ.findOne({appName:_application.appName},function(err,appli){
        if (err){
            console.log(err);
        }
        if (appli){//�ж�Ӧ���Ƿ��Ѿ�����
            return res.redirect('/');
        } else { //�������򽫱�����֯��Ϣ
            appli = new Organ(_application);
            appli.save(function(err,appli){
                if (err) {
                    console.log(err);
                }
                if(appli){
                    req.session.appli = appli;
                    res.redirect('/approle/addAppRole');
                }
            });
        }
    });
    console.log(_organization);

};