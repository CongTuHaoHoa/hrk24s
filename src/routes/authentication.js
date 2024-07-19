const express = require('express')
const router = express.Router()
const Admin = require('../database/collections/users/admin')
const User = require('../database/collections/users/users')
const Authentication = require('../database/collections/authentication')
const Response = require('../constants/response')
const middlewares = require('../middlewares/authentication')

const GET = database => async (req, res, next) =>
{
    const authentication = res.locals.authentication

    const users = await database.find({ id: authentication.id.toString() })

    if (users.length === 1)
    {
        const user = users[0]
        if (!authentication.verify && user.totp) res.json({ token : authentication.token })
        else res.json(user)
    }
    else
    {
        await authentication.delete()
        res.clearCookie('token')
        next(Response.Error.Authentication)
    }
}

const POST = async (req, res) =>
{
    const user = res.locals.user

    const authentication = new Authentication(user.id)
    const token = await authentication.save()

    res.cookie('token', token)

    if (!authentication.verify && user.totp) res.json({ token })
    else res.json(user)
}

const DELETE = async (req, res, next) =>
{
    const authentication = res.locals.authentication
    await authentication.delete()
    res.clearCookie('token')
    next(Response.Success.Delete)
}

router.get('/', ...middlewares.GET, GET(User))
router.get('/admin', ...middlewares.GET, GET(Admin))

router.post('/',...middlewares.POST(User), POST)
router.post('/admin',...middlewares.POST(Admin), POST)

router.delete('/', ...middlewares.DELETE, DELETE)

module.exports = router
