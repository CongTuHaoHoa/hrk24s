const middlewares = require('./index')
const Post = require("../database/collections/posts");


module.exports.GET = [...middlewares.getData('url', Post)]
// module.exports.POST = [middlewares.multer.image('picture'), middlewares.multer.images('files')]
module.exports.POST = [middlewares.multer.fields.image(['picture', 'files'])]

// module.exports.PATCH = [middlewares.multer.image('picture'), middlewares.multer.images('files'), ...middlewares.getDataByID(Post)]
module.exports.PATCH = [middlewares.multer.fields.image(['picture', 'files']), ...middlewares.getDataByID(Post)]

module.exports.DELETE = [...middlewares.getDataByID(Post)]
