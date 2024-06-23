const fs = require('fs')
const path = require('path')
const { ObjectId } = require('mongodb')
const database = require('../main/connect')
const MD5 = require('../../constants/MD5')
const response = require('../../constants/response')

const collectionName = 'usersAdmin'
const collection = database.collection(collectionName)

const GET = async filter =>
{
    const { _id, username, password } = filter || { _id: undefined, username: undefined, password: undefined }

    return (await collection.find().toArray()).filter(value =>
    {
        const checkID  =  _id ? value._id.toString() === _id : true
        const checkUsername  =  username ? value.username === username : true
        const checkPassword  =  password ? value.password === password : true

        return checkID && checkUsername && checkPassword
    })
}
const ADD = async newValue =>
{
    const { username, password, name, image } = newValue
    const _id = (await collection.insertOne({ username, password: MD5(password), name })).insertedId

    if (_id)
    {
        if (image)
        {
            const mimetype =  image.mimetype.split`/`[1]
            const avatar = `avatar/admin/${ _id }.${ mimetype }`
            const filepath = path.join(__dirname, '../../../public', avatar)

            await fs.writeFile(filepath, image.buffer, async error =>
            {
                if (!error) await collection.findOneAndUpdate({ _id }, { $set: { avatar }})
                else await collection.findOneAndDelete({ _id })
            })
        }
        return response.SUCCESS.ADD(_id)
    }
    else return response.ERROR.DATABASE(collectionName)
}
const EDIT = async (oldValue, newValue) =>
{
    const { username, password, name, image } = newValue
    const { _id, avatar } = oldValue
    const removeUndefined = { username, password, name }

    const oldFilepath = path.join(__dirname, '../../../public', avatar)


    Object.keys(removeUndefined).forEach(key =>
    {
        if (removeUndefined[key] === undefined) delete removeUndefined[key]
    })

    await collection.findOneAndUpdate({ _id: new ObjectId(_id) }, { $set: removeUndefined })

    if (image)
    {
        const mimetype =  image.mimetype.split`/`[1]
        const newAvatar = `avatar/admin/${ _id }.${ mimetype }`

        const newFilepath = path.join(__dirname, '../../../public', newAvatar)

        if (oldFilepath !== newFilepath)
        {
            await fs.unlink(oldFilepath, async () =>
            {
                await collection.findOneAndUpdate({ _id }, { $set: { avatar: newAvatar }})
            })
        }

        await fs.writeFile(newFilepath, image.buffer, () => {})
    }
    else if (image === false) await fs.unlink(oldFilepath, () => {})

    return response.SUCCESS.EDIT(_id)
}
const DELETE = async oldValue =>
{
    const { _id, avatar } = oldValue
    const filepath = path.join(__dirname, '../../../public', avatar)

    await collection.findOneAndDelete({ _id: new ObjectId(_id) })
    await fs.unlink(filepath, () => {})
    return response.SUCCESS.DELETE(_id)
}

module.exports = GET
module.exports.ADD = ADD
module.exports.EDIT = EDIT
module.exports.DELETE = DELETE