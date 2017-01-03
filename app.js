var express = require('express');
var port = process.env.PORT || 3000;
var app = express();
var bodyParser = require('body-parser');
var path = require('path');//静态资源路径获取
//引入mongoose数据块连接数据库
var mongoose = require('mongoose');
//模型的加载

//underscore extend方法中可以用新的模块替换旧的模块
var _ = require('underscore');

var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');

app.locals.moment = require('moment');
var logger = require('morgan');


//连接数据库
mongoose.connect('mongodb://localhost/mapping');


app.set('views','./app/views/pages');//视图页面
app.set('view engine','jade');
app.use(bodyParser());//表单提交数据格式化
app.use(express.static(path.join(__dirname,'public')));//静态资源目录获取
app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys:['key1','key2']
}));
app.listen(port);

if ('development' === app.get('env')) {
  app.set('showStackError',true);
  app.use(logger(':method :url :status'));
  app.locals.pretty = true;
  mongoose.set('debug' , true);
}

require('./routes/routes')(app);
console.log('start on port'+port);