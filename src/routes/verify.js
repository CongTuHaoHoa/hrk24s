const express = require('express')
const router = express.Router()
const { authenticator } = require('otplib')
const response = require('../constants/response')

const middlewares = require('../middlewares/verify')
const User = require("../database/collections/users");

const GET = (req, res) =>
{
    res.json({ secret: authenticator.generateSecret() })
}
const POST = async (req, res, next) =>
{
    const { code } = req.body
    const authentication = res.locals.data
    const users = await User.find({ id: authentication.id })

    if (users.length === 1)
    {
        const user = users[0]

        const check = authenticator.check(code, user.totp)

        if (check)
        {
            authentication.verify = true
            await authentication.save()
            res.json(user)
        }
        else next(response.ERROR.NOTFOUND({ code }))
    }
    else next(response.ERROR.NOTFOUND({ user_id : authentication.id }))
}
const PATCH = async (req, res, next) =>
{
    const { code , secret } = req.body
    const authentication = res.locals.data

    const users = await User.find({ id: authentication.id })

    if (users.length === 1)
    {
        const user = users[0]

        const check = authenticator.check(code, secret)

        if (check)
        {
            user.totp = secret
            authentication.verify = true
            await authentication.save()
            res.json(await user.save())
        }
        else next(response.ERROR.NOTFOUND({ code }))
    }
    else next(response.ERROR.NOTFOUND({ user_id : authentication.id }))
}


router.get('/', ...middlewares.GET, GET)
router.post('/', ...middlewares.POST, POST)
router.patch('/', ...middlewares.PATCH, PATCH)


module.exports = router