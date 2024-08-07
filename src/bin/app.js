const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const app = express()
const Response = require('../constants/response')
const cors = require('cors')
const URI = require('../constants/URI-client')

const corsOptions = { origin: URI, credentials: true }

app.set('views', path.join('src/views'))
app.set('view engine', 'ejs')

app.use(async (req, res, next) =>
{
    if (!req.url.startsWith('/images')) logger('dev')(req, res, next)
    else next()
})


app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors(corsOptions))









/**
 * Kết nối các Router
 */

const authenticationRouter = require('../routes/authentication')
const googleRouter = require('../routes/google')
const facebookRouter = require('../routes/facebook')

const indexRouter = require('../routes')
const usersRouter = require('../routes/users')
const verifyRouter = require('../routes/verify')
const notificationsRouter = require('../routes/notifications')
const rolesRouter = require('../routes/roles')
const postsRouter = require('../routes/posts')
const musicsRouter = require('../routes/musics')


app.use('/', indexRouter)
app.use('/users', usersRouter)

app.use('/authentication', authenticationRouter)
app.use('/google', googleRouter)
app.use('/facebook', facebookRouter)

app.use('/verify', verifyRouter)
app.use('/notifications', notificationsRouter)
app.use('/roles', rolesRouter)
app.use('/posts', postsRouter)
app.use('/musics', musicsRouter)


app.use(express.static(path.join(__dirname, '../../public')))








app.use((req, res, next) => next(Response.Error.PageNotFound(req.method, req.url)))
app.use((err, req, res, next) => res.status(err.code || 500).json(err))

module.exports = app
