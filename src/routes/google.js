const express = require('express')
const router = express.Router()
const middlewares = require('../middlewares/google')
const User = require("../database/collections/users");
const accessToken = require('../constants/accessToken')
const Authentication = require("../database/collections/authentication");
const response = require("../constants/response");

const POST = async (req, res, next) =>
{
    const { access_token } = req.body
    const { google } = await accessToken.google(access_token)

    const user = (await User.find({ google }))[0]

    if (user)
    {
        const authentication = new Authentication(user.id)
        const token = await authentication.save()

        res.cookie('token', token)

        if (!authentication.verify && user.totp) res.json({ token })
        else res.json(user)
    }
    else next(response.ERROR.NOTFOUND({ google }))
}

const PATCH = async (req, res, next) =>
{
    const { access_token } = req.body

    const { google, googleMail, googleName, googlePicture } = await accessToken.google(access_token)

    const authentication = res.locals.data

    const user = (await User.find({ id: authentication.id.toString() }))[0]

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
        else next(response.ERROR.EXISTS({ google }))
    }
    else next(response.ERROR.NOTALLOWED('blank email'))
}

router.post('/',...middlewares.POST,  POST)
router.patch('/', ...middlewares.PATCH, PATCH)

module.exports = router
