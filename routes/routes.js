/**
 * Created by yuzaizai on 2016/4/24.
 */

var Movie = require('../app/controllers/movie');
var User = require('../app/controllers/user');
var Appli = require('../app/controllers/application');
var Organ = require('../app/controllers/organization');
var OrganRole = require('../app/controllers/organRole');
//underscore extend方法中可以用新的模块替换旧的模块
var _ = require('underscore');

module.exports = function(app) {
    //pre handler user
    app.use(function(req,res,next){
        var _user=req.session.user;
            app.locals.user = _user;
        return next();
    });

    //index
        app.get('/', function(req, res, next) {
            res.render('index', { title: 'Mapping' });
        });


    // User
        app.post('/user/signup', User.signup);
        app.post('/user/signin', User.signin);
        app.get('/signin', User.showSignin);
        app.get('/signup', User.showSignup);
        app.get('/logout', User.logout);
        app.get('/admin/user/list',  User.signinRequired, User.adminRequired,User.list);

    //organization
        app.get('/organ/showsignup', User.signinRequired, Organ.showsignup);
        app.post('/organ/organsignup', User.signinRequired, Organ.organsignup);
        app.get('/organ/organList',User.signinRequired,Organ.organList);




    //application
        app.get('/app/showSignup',User.signinRequired,Appli.showSignup);
        app.post('/app/appSignup',User.signinRequired,Appli.appSignup);



    //OrganRole
        app.get('/organrole/addOrganRole',User.signinRequired,OrganRole.addOrganRole);
        app.get('/organrole/organroleList',User.signinRequired,OrganRole.organroleList);



        // Movie
        app.get('/movie/:id', Movie.detail);
        app.get('/admin/movie/new', User.signinRequired, User.adminRequired, Movie.new);
        app.get('/admin/movie/update/:id', User.signinRequired, User.adminRequired, Movie.update);


      //  app.post('/admin/movie', User.signinRequired, User.adminRequired, Movie.savePoster, Movie.save);
        app.get('/admin/movie/list', Movie.list);
        app.delete('/admin/movie/list', Movie.del);

};