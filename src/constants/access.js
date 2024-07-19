const string = array => JSON.stringify(array)
const array = string => JSON.parse(string)
const Role = require('../database/collections/roles')

const getAccess = async roles =>
{
    const output = new Role()
    const database = await Role.find()

    for (let id of roles)
    {
        const found = database.filter(value => value.id.toString() === id.toString())[0]

        if (found)
        {
            output.postsDB = Math.max(output.postsDB, found.postsDB)
            output.artsDB = Math.max(output.artsDB, found.artsDB)
            output.musicsDB = Math.max(output.musicsDB, found.musicsDB)
            output.messagesDB = Math.max(output.messagesDB, found.messagesDB)
            output.clientDB = Math.max(output.clientDB, found.clientDB)
            output.adminDB = Math.max(output.adminDB, found.adminDB)
        }
    }

    return output
}

module.exports = getAccess
module.exports.array = array
module.exports.string = string