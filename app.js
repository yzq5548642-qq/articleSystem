//引入express框架
var express = require("express");
var ejs = require("ejs");//引入ejs模板引擎  因为使用到了render所以引入ejs
var session = require('express-session');//做身份的认证
var bodyParser = require('body-parser');

var indexRouter = require('./router/index');
var adminRouter = require('./router/admin');

var path = require('path');//使用path进行路径整合

//创建服务
var app = express();

//express-session的配置  这样就可在req中用session了
app.use(session({
    secret:'edu118',//随便起的
    resave:false,
    saveUninitialized:true,
    cookie:{
    secure:false,
        httpOnly:true,
        maxAge:1000 * 60 * 60 * 24//设置时间
},
rolling:true
}));



//配置body-parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//设置模板所在的文件夹 使用ejs
//__dirname +"views"路径设置可能存在不确定性
app.set('views',path.join(__dirname,'pages'));
//设置ejs渲染.html文件
app.engine('.html',ejs.renderFile);
//设置默认的文件后缀
app.set("view engine",'html');
//设置静态资源的托管文件，拿到图片
// app.use(express.static(path.join(__dirname,"/")));
app.use(express.static('public'));

app.use('/',indexRouter);
app.use('/admin',adminRouter);



//设置端口
app.listen(8086,function() {
   console.log("请在网址输入localhost://8086/admin 账号:admin,密码:123");
});