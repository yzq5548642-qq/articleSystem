var express = require('express');//引入express
var router = express.Router();//使用express中的路由

router.use(function (req,res,next) {//拦截
    next();//不调用next就不会往下面走
});

router.get('/',function (req,res) {
    res.render('../pages/index');
});



module.exports = router;//暴露出去