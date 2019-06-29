const express = require('express')
const User = require('./models/user')
const md5 = require('blueimp-md5')


const router = express.Router()

router.get('/', function (req, res) {
    res.render('index.html', {user: req.session.user})
})

router.get('/register', function (req, res) {
    res.render('register.html')
})

router.post('/register', function (req, res) {
    /*
        1. 判断邮箱和昵称是否已存在
           - 存在就提示
           - 不存在完成注册
     */
    const body = req.body

    User.findOne({$or: [{email: body.email}, {nickname: body.nickname}]}, function (err, result) {
        if (err) {
            return res.status(500).json({success: false, message: '服务端错误'})
        }
        if (result) {
            return res.status(200).json({error_code: 1, message: 'Email or nickname is already exists'})
        }

        body.password = md5(md5(body.password))
        // 邮箱和昵称不存在，保存数据到数据库中
        new User(body).save(function (err, result) {
            if (err) {
                return res.status(500).json({error_code: 500, message: 'Server is busy'})
            }
            req.session.user = result

            console.log(req.session.user)
            res.status(200).json({error_code: 0, message: 'OK'})

        })
    })
})

router.get('/login', function (req, res) {
    res.render('login.html')
})

router.post('/login', function (req, res) {
    // 根据email 加密后的password查询数据库
    const body = req.body
    User.findOne({email: body.email, password: md5(md5(body.password))}, function (err, user) {
        if (err) {
            return res.status(500).json({error_code: 500, message: err.message})
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

router.get('/logout', function (req, res) {
    // 清除session退出登录
    req.session.user = null

    res.redirect('/')
})

module.exports = router