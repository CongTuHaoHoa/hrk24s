const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const response = require('../constants/response')
const app = express()
const Response = require('../constants/response')
const cors = require('cors')


app.set('views', path.join('src/views'))
app.set('view engine', 'ejs')
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../../public')))

const corsOptions = {
    origin: 'http://localhost:5173', // Thay đổi thành domain của frontend của bạn
    credentials: true, // Cho phép sử dụng cookies và headers truyền đi
};

app.use(cors(corsOptions))









/**
 * Kết nối các Router
 */
const indexRouter = require('../routes')
const usersAdminRouter = require('../routes/users')
const googleRouter = require('../routes/google')
const facebookRouter = require('../routes/facebook')
const verifyRouter = require('../routes/verify')

const authenticationAdminRouter = require('../routes/authentication')

app.use('/', indexRouter)
app.use('/users', usersAdminRouter)
app.use('/authentication', authenticationAdminRouter)
app.use('/google', googleRouter)
app.use('/facebook', facebookRouter)
app.use('/verify', verifyRouter)










// app.use((req, res, next) => next(Response.ERROR.NOTFOUND({ [req.method]: req.url })))
app.use((req, res, next) => next(Response.ERROR.NOTFOUND({ [req.method]: req.url })))

app.use((err, req, res, next) => res.status(err.code || 500).json(err))

module.exports = app
