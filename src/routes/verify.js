const express = require('express')
const router = express.Router()
const { authenticator } = require('otplib')
const Response = require('../constants/response')

const middlewares = require('../middlewares/verify')

const GET = (req, res) =>
{
    res.json({ secret: authenticator.generateSecret() })
}
const POST = async (req, res, next) =>
{
    const { code } = req.body
    const authentication = res.locals.authentication
    const user = res.locals.user

    const check = authenticator.check(code, user.totp)

    if (check)
    {
        authentication.verify = true
        await authentication.save()
        res.json(user)
    }
    else next(Response.Error.Verification)
}
const PATCH = async (req, res, next) =>
{
    const { code , secret } = req.body
    const authentication = res.locals.authentication
    const user = res.locals.user

    const check = authenticator.check(code, secret)

    if (check)
    {
        user.totp = secret
        authentication.verify = true
        await authentication.save()
        res.json(await user.save())
    }
    else next(Response.Error.Verification)
}

const DELETE = async (req, res) =>
{
    const user = res.locals.user
    user.totp = ''
    res.json(await user.save())
}

router.get('/', ...middlewares.GET, GET)
router.post('/', ...middlewares.POST, POST)
router.patch('/', ...middlewares.PATCH, PATCH)
router.delete('/', ...middlewares.DELETE, DELETE)


module.exports = router