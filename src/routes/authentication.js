const express = require('express')
const router = express.Router()
const User = require('../database/collections/users')
const Authentication = require('../database/collections/authentication')

const response = require('../constants/response')
const middlewares = require('../middlewares/authentication')

const GET = async (req, res, next) =>
{
    const authentication = res.locals.data

    const users = await User.find({ id: authentication.id.toString() })

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
        next(response.ERROR.NOTFOUND({ user_id : authentication.id }))
    }
}

const POST = async (req, res) =>
{
    const { user } = res.locals.data

    const authentication = new Authentication(user.id)
    const token = await authentication.save()

    res.cookie('token', token)

    if (!authentication.verify && user.totp) res.json({ token })
    else res.json(user)
}

const DELETE = async (req, res, next) =>
{
    const authentication = res.locals.data
    await authentication.delete()
    res.clearCookie('token')
    next(response.SUCCESS.DELETE({ token: authentication.token }))
}

const CLEAR = async (req, res, next) =>
{
    await Authentication.clear()
    res.clearCookie('token')
    next(response.SUCCESS.DELETE({ authentication: 'All' }))
}

router.get('/', ...middlewares.GET, GET)
router.post('/',...middlewares.POST, POST)
router.delete('/clear', CLEAR)
router.delete('/', ...middlewares.DELETE, DELETE)

module.exports = router
