const crypto = require('crypto')

module.exports = password =>
{
    const hash = crypto.createHash('md5')
    hash.update(password)
    return hash.digest('hex')
}