const connect = require('../main/connect')
const database = connect.client.db('HurrikyanDB');
const collection = database.collection('accountsAdmin')


module.exports.get = async filter => (await collection.find({}).toArray()).filter(value =>
{
    const { id, username, password } = filter || { id: undefined, username: undefined, password: undefined }

    const checkID = id ? value._id.toString() === id : true
    const checkUsername = username ? value.username === username : true
    const checkPassword = password ? value.password === password : true

    return checkID && checkUsername && checkPassword
})
