const Users = require('./users')

class Admin extends Users
{
    static find = async (filter = {}) => (await super.find(filter)).filter(user => user.role.filter(role => role !== 'client').length > 0)
}

module.exports = Admin