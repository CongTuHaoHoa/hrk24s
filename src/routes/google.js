const express = require('express')
const router = express.Router()
const middlewares = require('../middlewares/google')
const Admin = require("../database/collections/users/admin");
const User = require("../database/collections/users/users");

const accessToken = require('../constants/accessToken')
const Authentication = require("../database/collections/authentication");
const Response = require("../constants/response");

const POST = database => async (req, res, next) =>
{
    const { access_token } = req.body
    const { google, googleMail, googleName, googlePicture } = await accessToken.google(access_token)

    const user = (await database.find({ google }))[0]

    if (user)
    {
        const authentication = new Authentication(user.id)
        const token = await authentication.save()

        res.cookie('token', token)

        if (!authentication.verify && user.totp)
        {
            user.googleMail = googleMail
            user.googleName = googleName
            user.googlePicture = googlePicture
            await user.save()

            res.json({ token })
        }
        else
        {
            user.googleMail = googleMail
            user.googleName = googleName
            user.googlePicture = googlePicture
            await user.save()

            res.json(user)
        }
    }
    else next(Response.Error.NotFound({ googleMail }))
}
const PATCH = async (req, res, next) =>
{
    const { access_token } = req.body

    const { google, googleMail, googleName, googlePicture } = await accessToken.google(access_token)

    const user = res.locals.user

    if (!user.google)
    {
        const check = (await User.find({ google }))

        if (check.length === 0)
        {
            user.google = google
            user.googleMail = googleMail
            user.googleName = googleName
            user.googlePicture = googlePicture

            res.json(await user.save())
        }
        else next(Response.Error.Exists(googleMail))
    }
    else next(Response.Error.MethodNotAllow)
}
const DELETE = async (req, res) =>
{
    const user = res.locals.user

    user.google = ''
    user.googleMail = ''
    user.googleName = ''
    user.googlePicture = ''

    res.json(await user.save())
}
router.post('/', ...middlewares.POST, POST(User))
router.post('/admin', ...middlewares.POST, POST(Admin))

router.patch('/', ...middlewares.PATCH, PATCH)
router.delete('/', ...middlewares.DELETE, DELETE)

module.exports = router
