var express = require('express');//引入express
var router = express.Router();//使用express中的路由
var url = require('url');

var bcrypt = require('bcrypt');//登录密码加密
var saltRounds = 10;
// bcrypt.hash('123', saltRounds, function(err, hash) {
//     // Store hash in your password DB.
//     console.log(hash)
// });

var dateFormat = require('../service/dateFormat');//时间的格式化处理

var mysqlServer = require('../service/mysql');

var multer  = require('multer');//后台处理图片的上传
var upload = multer({ dest:'public/uploads' });//配置图片上传的地址

router.use(function (req,res,next) {//拦截
    // console.log("后台路由拦截admin");
    next();//不调用next就不会往下面走
});
//登录拦截
router.use(function (req,res,next) {
   if (!req.session.islogin)  {//判断用户有没有登录
       // console.log(req.session);
       // console.log(req.session.islogin);
       var { pathname } = url.parse(req.url);//拿到登录页面的路径
       if (pathname == '/login' || pathname == '/loginout'){//如果当前页面是登录页面，则不操作，让其登录
           next();
       } else{
           res.redirect('/admin/login?path=/admin' + pathname)//不是登录页面，则跳转到登录页面，登录后再跳回该页面
       }
   }else{//用户已经登录
       next();
   }
});

router.get('/',function (req,res) {
    mysqlServer('select 1+1 as solution',function (resData) {
        // console.log(resData);
    });
    res.render('admin/layout',{page:'index.html',router:'/admin'});
});

router.get('/login',function (req,res) {
   res.render('admin/login');
});
router.post('/login',function (req,res) {//接收login的数据
    var { account,password } = req.body;//配置了body-parser才能用req.body
    var pathUrl = req.query.path ? req.query.path : '/admin';
    if (!account || !password){
        res.send({
            code:1001,
            msg:"账号和密码不能为空"
        })
    }
    //查询数据库中对应用户存储的密码
    mysqlServer("select password,username from admin where account=\'" + account + "\'",function (data) {
        if (!!data && data.length>0){
            var userinfo = data[0];
            bcrypt.compare(password, userinfo.password, function(err, result) {
                // result == true
                if (result) {
                    //登录成功
                    req.session.islogin = true;
                    res.send({
                        code:200,
                        msg:'登录成功',
                        data:{
                            path:pathUrl,
                        }
                    })
                }else {
                    //登录失败
                    // res.send('账号或者密码错误，登录失败，请<a href="/admin/login" target="_self">重新登录</a>>')
                    res.send({
                        code:1001,
                        msg:"密码错误"
                    })

                }
            });
        }
    });
});

router.get('/loginout',function(req,res) {
    req.session.islogin = "";
    res.redirect('/admin/login');
});

router.get('/articleList',function (req,res) {
    var search = req.query && req.query.search;
    // console.log(req.query);
    // console.log(req.query.search);
    // console.log(search);
    var sql = 'select * from article where status=1 order by showorder desc limit 0,1000';

    if(search)
    {
        sql = 'select * from article where status=1 and title like \"%'+ search +'%\" order by showorder desc limit 0,1000';
    }

    mysqlServer(sql,function (resData) {
       //返回所有数据
        res.render('admin/layout',{page:'./articleList.html',router:'/admin/articleList',lists:resData});
    });
});

router.post('/articleList',function (req,res) {
    var obj = req.body;
    var id = obj.id;
    var title = obj.title;
    var description = obj.description;
    var classify = obj.classify;
    var images = obj.images;
    var content = obj.content;
    var showorder = obj.showorder;
    if(title === undefined){
        res.send({
            code:1001,
            msg:'标题没有设置'
        })
    }
    if(classify === undefined){
        res.send({
            code:1001,
            msg:'类型没有设置'
        })
    }
    if(content === undefined){
        res.send({
            code:1001,
            msg:'内容没有填写'
        })
    }
    //封装插入数据库的对象
    var inserData = {
      title:title,
      description:description,
      classify:classify,
      images:images,
      content:content,
      showorder:showorder
    };
    var str = "";
    for (var key in inserData){
        str += key + "=" + "\'" + inserData[key] + "\'" + ",";
    }
    var newStr = str.slice(0,str.length-1);
    var sql = "update article set "+ newStr + " where id=" + id;
    mysqlServer(sql,function (resData) {
        if (resData){
            res.send({
                code:200,
                msg:'数据修改成功'
            })
        }else {
            res.send({
                code:1001,
                msg:'数据修改失败'
            })
        }
    });
});

router.post('/listDel',function(req,res){
    var id = req.body.id;

    var sql = "update article set status = 2 where id=" + id;

    mysqlServer(sql,function(data){
        if(data){
            res.send({
                code:200,
                msg:"删除成功"
            })
        }
    })
});

router.get('/articleAdd',function (req,res) {
    res.render('admin/layout',{page:'./articleAdd.html',router:'/admin/articleAdd'});
});
router.post('/articleAdd',function (req,res) {
    var reqObject = { title,description,classify,content,showorder,file,images } = req.body;
    delete reqObject.file;
    if (!title) {
        res.send({
            code:1001,
            msg:'文章标题不能为空'
        });
    }
    if (!content) {
        res.send({
            code:1001,
            msg:'文章内容不能为空'
        });
    }
     reqObject['create_time'] = dateFormat();

    var sql = "insert into article (" + Object.keys(reqObject).join(",") + ") values(" + Object.values(reqObject).map(function (val) {
        return '\'' + val + '\'';
    }).join(',') + ")";

    mysqlServer(sql,function (resData) {
        if (resData){
            res.send({
                code:200,
                msg:'数据添加成功'
            })
        }else {
            res.send({
                code:1001,
                msg:'数据添加失败'
            })
        }
    });
});

router.post('/upload',upload.single('file'),function (req,res) {
    if (req.file){
        res.send({
            code:0,
            msg:'图片上传成功',
            data: {
                src:'/uploads/' + req.file.filename
            }
        })
    }
});

module.exports = router;//暴露出去