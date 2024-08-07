const middlewares = require("./index");
const Music  = require("../database/collections/musics");
const Response = require("../constants/response");

const checkPrivacy = async (req, res, next) =>
{
    const music = res.locals.data

    if (music.privacy === 'public') next()
    else
    {
        const authentication = await middlewares.fetchCookies(req)

        if (authentication)
        {
            if (music.privacy === 'private' && music.artist.toString() === authentication.id.toString()) next()
            else
            {
                const user = await middlewares.fetchUserByCookies(authentication.id.toString())

                if (user.role[0] !== 'client' && music.privacy === 'admin') next()
                else next(Response.Error.PageNotFound(req.method, req.url))
            }
        }
        else next(Response.Error.PageNotFound(req.method, req.url))
    }
}

const checkExistFields = middlewares.checkExistFields(['name'])
const checkBlanksFields = middlewares.checkBlankFields(['name'])

const checkExistAudio = (req, res, next) =>
{
    let { audio } = req.files
    next(audio ? null : Response.Error.NotFound({ audio }))
}

module.exports.GET = [...middlewares.getDataByID(Music), checkPrivacy]
module.exports.VIEWS = [...middlewares.getDataByID(Music)]
module.exports.POST = [middlewares.multer.fields.musics(), checkExistFields, checkBlanksFields, checkExistAudio]
module.exports.PATCH = [middlewares.multer.fields.musics(), checkBlanksFields, ...middlewares.getDataByID(Music), checkPrivacy]
module.exports.PUT = [...middlewares.getDataByID(Music), checkPrivacy]
module.exports.DELETE = [...middlewares.getDataByID(Music), checkPrivacy]
