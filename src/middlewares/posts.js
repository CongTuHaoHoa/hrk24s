const middlewares = require('./index')
const Post = require("../database/collections/posts");
const Response = require("../constants/response");

const checkPrivacy = async (req, res, next) =>
{
    const post = res.locals.data

    if (post.privacy === 'public') next()
    else
    {
        const authentication = await middlewares.fetchCookies(req)

        if (authentication)
        {
            if (post.privacy === 'private' && post.author.toString() === authentication.id.toString()) next()
            else
            {
                const user = await middlewares.fetchUserByCookies(authentication.id.toString())

                if (user.role[0] !== 'client' && post.privacy === 'admin') next()
                else next(Response.Error.PageNotFound(req.method, req.url))
            }
        }
        else next(Response.Error.PageNotFound(req.method, req.url))
    }
}

module.exports.GET = [...middlewares.getData('url', Post), checkPrivacy]
module.exports.POST = [middlewares.multer.fields.image(['picture', 'files'])]
module.exports.PATCH = [middlewares.multer.fields.image(['picture', 'files']), ...middlewares.getDataByID(Post), checkPrivacy]
module.exports.DELETE = [...middlewares.getDataByID(Post), checkPrivacy]
