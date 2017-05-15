/**
 * Created by yuzaizai on 2016/4/24.
 */

var Movie = require('../app/controllers/Movie');
var User = require('../app/controllers/User');
var Appli = require('../app/controllers/Application');
var Organ = require('../app/controllers/Organization');
var OrganPos = require('../app/controllers/OrganPos');
var OrganRole = require('../app/controllers/OrganRole');
var OrganDep = require('../app/controllers/OrganDep');
var BusiRole = require('../app/controllers/BusinessRole');
var Mapp = require('../app/controllers/Mapping');
var RoleMapp = require('../app/controllers/RoleMapping');
var Cache = require('../app/controllers/Cache');
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
            res.render('Index', { title: 'Mapping' });
        });


    // User用户
        app.post('/user/signup', User.signup);
        app.post('/user/signin', User.signin);
        app.get('/signin', User.showSignin);
        app.get('/signup', User.showSignup);
        app.get('/logout', User.logout);
        app.get('/admin/user/list',  User.signinRequired, User.adminRequired,User.list);
        app.get('/user/userpage',User.signinRequired,User.userPage);
        app.post('/admin/getCollabUser',User.signinRequired, User.adminRequired,User.getCollabUser);
        app.post('/admin/showCollaboration',User.signinRequired,User.adminRequired,User.showCollaboration);
        app.post('/admin/registerCollabUser/:empList',User.signinRequired, User.adminRequired,User.registerCollabUser);

    //organization组织
        app.get('/organ/showSignup', User.signinRequired, Organ.showsignup);
        app.post('/organ/organSignup', User.signinRequired, Organ.organsignup);
        app.get('/organ/organList',User.signinRequired,Organ.organList);
        app.get('/organ/registerOrgan', User.signinRequired, Organ.registerOrgan);
        app.get('/organ/editOrgan', User.signinRequired, Organ.editOrgan);
        app.get('/organ/updateOrganResource', User.signinRequired, Organ.updateOrganResource);
        app.post('/organ/updateOrganInfo/:organName', User.signinRequired, Organ.updateOrganInfo);


    //application应用
        app.get('/app/showSignup',User.signinRequired,Appli.showSignup);
        app.post('/app/appSignup',User.signinRequired,Appli.appSignup);
        app.get('/app/appList',User.signinRequired,Appli.appList);


    //OrganPos组织职位
        app.get('/organpos/addOrganPos',User.signinRequired,OrganPos.addOrganPos);
        app.get('/organpos/organPosList/:name',User.signinRequired,OrganPos.organPosList);

    //OrganRole组织角色
        app.get('/organrole/addOrganRole',User.signinRequired,OrganRole.addOrganRole);
        app.get('/organrole/organRoleList/:name',User.signinRequired,OrganRole.organroleList);
        app.get('/organrole/getAllRole/:organName',User.signinRequired,OrganRole.getAllRolesByOrganName);


    //OrganDep组织部门
        app.get('/organdep/getAllDep/:organName',User.signinRequired,OrganDep.getAllDepByOrganName);
        app.get('/organdep/organDepList/:organName',User.signinRequired,OrganDep.organDepList);


    //busiRole应用角色
        app.get('/busirole/addBusiRole',User.signinRequired,BusiRole.addBusiRole);
        app.get('/busirole/busiroleList/:name',User.signinRequired,BusiRole.busiroleList);


    ///mapping 组织映射关系
        app.get('/map/userMappings',User.signinRequired,Mapp.selectMappingByUserId);
        app.post('/map/showRegisterMapping',User.signinRequired,Mapp.showRegisterMapping);
        app.post('/map/registerMapping',User.signinRequired,Mapp.registerMapping);
        app.get('/map/statisticAnalysis',User.signinRequired,User.adminRequired,Mapp.statistic);   // 统计映射量
        app.get('/map/analysisData',User.signinRequired,User.adminRequired,Mapp.analysis);  // 分析映射关系


    // roleMapping 角色-职位映射
        app.get('/rolemap/showRoleMapping/:mapId&:organName&:appName',User.signinRequired,RoleMapp.showRoleMapping);
        app.get('/rolemap/editRoleMapping/:mapId',User.signinRequired,RoleMapp.editRoleMapping);
        app.post('/rolemap/busiRoleMappingList/:id&:mapId&:organName&:busiRoleName',User.signinRequired,RoleMapp.busiRoleMappingList); // id 为业务角色的id，获取该id对应的组织角色列表
        // id 为组织角色的id，获取该id对应的应用角色列表
        app.post('/rolemap/organPosMappingList/:id&:mapId&:appName&:organPosName&:depName&:organRoleName',User.signinRequired,RoleMapp.organPosMappingList);
        // 组织角色与应用角色的映射关系显示
        app.post('/rolemap/organRoleMappingList/:id&:mapId&:appName&:organRoleName',User.signinRequired,RoleMapp.organRoleMappingList);
        // 组织部门与应用角色的映射关系显示
        app.post('/rolemap/organDepMappingList/:id&:mapId&:appName&:organDepName',User.signinRequired,RoleMapp.organDepMappingList);
        // 根据业务角色更新的映射关系
        app.post('/rolemap/updateBusiRoleMapping/:mapId&:busiRoleId&:busiRoleName&:mappedOrganPos',User.signinRequired,
                  RoleMapp.delBusiRoleMapping,RoleMapp.addBusiRoleMapping,RoleMapp.editRoleMapping);
        // 根据组织职位更新映射关系
        app.post('/rolemap/updateOrganPosMapping/:mapId&:organPosId&:organPosName&:mappedBusiRoles',User.signinRequired,
        RoleMapp.delOrganPosMapping,RoleMapp.addOrganPosMapping,RoleMapp.editRoleMapping);
        // 根据组织角色更新映射关系
        app.post('/rolemap/updateOrganRoleMapping/:mapId&:role2PosOldString&:role2PosNewString',User.signinRequired,
        RoleMapp.updateOrganMapping,RoleMapp.editRoleMapping);
        // 根据组织部门更新映射关系
        app.post('/rolemap/updateOrganDepMapping/:mapId&:role2PosOldString&:role2PosNewString',User.signinRequired,
        RoleMapp.updateOrganMapping,RoleMapp.editRoleMapping);
        //  根据组织角色获取映射关系
        app.post('/rolemap/getBusiRoleByOrganRole/',RoleMapp.getBusiRoleByOrganRole);
        //  根据组织角色获取映射关系
        app.post('/rolemap/getOrganRoleByBusiRole/',RoleMapp.getOrganRoleByBusiRole);








    // Cache 缓存组织资源的变更
        //
        app.post('/cache/modifyResource',Cache.modifyResource);



    // Movie
        app.get('/movie/:id', Movie.detail);

        app.get('/admin/movie/new', User.signinRequired, User.adminRequired, Movie.new);
        app.get('/admin/movie/update/:id', User.signinRequired, User.adminRequired, Movie.update);


      //  app.post('/admin/movie', User.signinRequired, User.adminRequired, Movie.savePoster, Movie.save);
        app.get('/admin/movie/list', Movie.list);
        app.delete('/admin/movie/list', Movie.del);

};