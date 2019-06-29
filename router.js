const express = require('express')
const User = require('./models/user')
const md5 = require('blueimp-md5')


const router = express.Router()

// 渲染主页
router.get('/', function (req, res) {
    res.render('index.html', {user: req.session.user})
})

// 渲染注册页面
router.get('/register', function (req, res) {
    res.render('register.html')
})

// 处理注册请求
router.post('/register', function (req, res, next) {
    /*
        1. 判断邮箱和昵称是否已存在
           - 存在就提示
           - 不存在完成注册
     */
    const body = req.body

    User.findOne({$or: [{email: body.email}, {nickname: body.nickname}]}, function (err, result) {
        if (err) {
            return next(err)
        }
        if (result) {
            return res.status(200).json({error_code: 1, message: 'Email or nickname is already exists'})
        }

        body.password = md5(md5(body.password))
        // 邮箱和昵称不存在，保存数据到数据库中
        new User(body).save(function (err, result) {
            if (err) {
                return next(err)
            }
            req.session.user = result

            console.log(req.session.user)
            res.status(200).json({error_code: 0, message: 'OK'})

        })
    })
})

// 渲染登录页面
router.get('/login', function (req, res) {
    res.render('login.html')
})

// 处理登录请求
router.post('/login', function (req, res, next) {
    // 根据email 加密后的password查询数据库
    const body = req.body
    User.findOne({email: body.email, password: md5(md5(body.password))}, function (err, user) {
        if (err) {
            return next(err)
        }
        // 数据库中没有相应的记录
        if (!user) {
            return res.status(200).json({error_code: 1, message: 'Email or password invalid'})
        }

        // 数据库中存在记录
        req.session.user = user
        res.status(200).json({error_code: 0, message: 'OK'})
    })
})

// 退出登录，重定位到主页
router.get('/logout', function (req, res) {
    // 清除session退出登录
    req.session.user = null

    res.redirect('/')
})

// 导出router
module.exports = router