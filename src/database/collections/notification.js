const database = require('../main/connect')
const Socket = require('../../constants/socket')
const { ObjectId } = require("mongodb");
const collectionName = 'notifications'
const collection = database.collection(collectionName)

class Notification extends Object
{
    #_id
    #_type
    #_name
    #_content
    #_path
    #_time
    #_code

    get type()
    {
        return this.#_type;
    }
    get name()
    {
        return this.#_name;
    }
    set name(value)
    {
        this.#_name = value;
    }
    get content()
    {
        return this.#_content;
    }
    get path()
    {
        return this.#_path;
    }
    get code()
    {
        return this.#_code;
    }


    constructor(option)
    {
        const { id, type, name, content, path, time, code } = option
        super()

        this.#_id = id || undefined
        this.#_type = type
        this.#_name = name || ''
        this.#_content = content || ''
        this.#_path = path
        this.#_time = time || Date.now()
        this.#_code = code
    }
    static find = async (filter = {}) => (await collection.find().toArray()).filter(value => Object.keys(filter).map(key => filter[key].toString() === (value[key === 'id' ? '_id' : key] || '').toString()).every(check => check === true)).map(value =>
    new Notification({ ...value, id : value._id }))

    toJSON = () =>
    ({
        ...this.#_changeData(),
        id : this.#_id,
    })

    #_changeData = () =>
    ({
        type: this.type,
        name: this.name,
        content: this.content,
        path: this.path,
        time: this.#_time,
        code: this.#_code
    })

    save = async () =>
    {
        const user = this.#_changeData()
        await collection.insertOne(user)
        Socket.send('notifications', this.code)
    }

    delete = async (alert = true) =>
    {
        await collection.findOneAndDelete({ _id: new ObjectId(this.#_id.toString()) })
        if(alert) Socket.send('notifications/all', this.code)
    }

    static clear = async (filter) =>
    {
        const list = await this.find(filter)
        for (const item of list) { await item.delete(false) }
        Socket.send('notifications/all', list[0].code)
    }
}

class Type
{
    static Success = (id, name, content, path) => new Notification({ type: 'success', name, content, path, code: id.toString() })
    static Error = (id, name, content, path) => new Notification({ type: 'error', name, content, path, code: id.toString() })
    static Warning = (id, name, content, path) => new Notification({ type: 'warning', name, content, path, code: id.toString() })
    static Info = (id, name, content, path) => new Notification({ type: 'info', name, content, path, code: id.toString() })
    static Normal = (id, name, content, path) => new Notification({ type: 'primary', name, content, path, code: id.toString() })
}

module.exports = Type
module.exports.Main = Notification
module.exports.find = Notification.find
module.exports.clear = Notification.clear
