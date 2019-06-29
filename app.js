const express = require('express')
const path = require('path')
const router = require('./router')
const bodyParser = require('body-parser')
const session = require('express-session')

const app = express()

// 配置公开文件夹
app.use('/public/', express.static(path.join(__dirname, 'public')))
app.use('/node_modules/', express.static(path.join(__dirname, 'node_modules')))
app.engine('html', require('express-art-template'))

// 配置bodyparser，处理post请求的数据
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// 添加中间件，处理session
app.use(session({
    secret: 'keyboard cat', // 加密
    resave: false,
    saveUninitialized: false // true:无论是否使用session都会给一个sessionId
}))

app.use(router)

// 配置一个全局处理错误的中间件
app.use(function (err, req, res, next) {
    res.status(500).json({error_code: 500, message: err.message})
})

// 配置一个处理404的中间件
app.use(function (req, res) {
    res.render('404.html')
})

app.listen(3000, function () {
    console.log('running...')
})