const database = require('../main/connect')
const Response = require("../../constants/response");
const collectionName = 'roles'
const collection = database.collection(collectionName)


const sysadmin = { _id: 'sysadmin', name: 'System Administrator', color: '#EC1576', icon: 'SensorWindow', adminDB: 9999, clientDB: 9999, postsDB: 9999, artsDB: 9999, musicsDB: 9999, messagesDB: 9999 }
const client =  { _id: 'client', name: 'Người dùng', color: '#0080ff', icon: 'Public', adminDB: 0, clientDB: 0, postsDB: 0, artsDB: 0, musicsDB: 0, messagesDB: 0 }


class Roles extends Object
{
    #_id
    #_name
    #_icon
    #_color

    #_adminDB
    #_clientDB

    #_postsDB
    #_musicsDB
    #_artsDB
    #_messagesDB

    get id()
    {
        return this.#_id;
    }

    get name()
    {
        return this.#_name;
    }
    set name(value)
    {
        this.#_name = value;
    }
    get icon()
    {
        return this.#_icon;
    }
    set icon(value)
    {
        this.#_icon = value;
    }
    get color()
    {
        return this.#_color;
    }
    set color(value)
    {
        this.#_color = value;
    }
    get adminDB()
    {
        return this.#_adminDB;
    }
    set adminDB(value)
    {
        this.#_adminDB = value;
    }
    get clientDB()
    {
        return this.#_clientDB;
    }
    set clientDB(value)
    {
        this.#_clientDB = value;
    }

    get postsDB()
    {
        return this.#_postsDB;
    }
    set postsDB(value)
    {
        this.#_postsDB = value;
    }
    get musicsDB()
    {
        return this.#_musicsDB;
    }
    set musicsDB(value)
    {
        this.#_musicsDB = value;
    }
    get artsDB()
    {
        return this.#_artsDB;
    }
    set artsDB(value)
    {
        this.#_artsDB = value;
    }
    get messagesDB()
    {
        return this.#_messagesDB;
    }
    set messagesDB(value)
    {
        this.#_messagesDB = value;
    }

    constructor(option = {})
    {
        const { id, name, icon, color, adminDB, clientDB, postsDB, artsDB, musicsDB, messagesDB } = option

        super()

        this.#_id = id

        this.#_name = name || ''
        this.#_color = color || '#B3B3B3'
        this.#_icon = icon || 'QuestionMark'


        this.#_adminDB = parseInt(adminDB || '1')
        this.#_clientDB = parseInt(clientDB || '1')
        this.#_postsDB = parseInt(postsDB || '1')
        this.#_artsDB = parseInt(artsDB || '1')
        this.#_musicsDB = parseInt(musicsDB || '1')
        this.#_messagesDB = parseInt(messagesDB || '1')
    }

    #_changeData = () =>
    ({
        name: this.name,
        color: this.color,
        icon: this.icon,

        adminDB: this.adminDB,
        clientDB: this.clientDB,

        postsDB: this.postsDB,
        artsDB: this.artsDB,
        musicsDB: this.musicsDB,
        messagesDB: this.messagesDB,
    })

    toJSON = () =>
    ({
        id : this.id,
        ...this.#_changeData()
    })

    static find = async (filter = {}) => ([ sysadmin, client, ...(await collection.find().toArray())]).filter(value =>
    Object.keys(filter).map(key => filter[key] ? filter[key].toString() === value[key === 'id' ? '_id' : key].toString() : false)
    .every(check => check === true)).map(value => new Roles({ ...value, id : value._id }))

    save = async () =>
    {
        if (this.id)
        {
            const role = this.#_changeData()
            await collection.findOneAndUpdate({ _id: this.id }, { $set: role })
            return this
        }
        else
        {
            const role = this.#_changeData()
            this.#_id = (await collection.insertOne(role)).insertedId
            if (this.id) return this
            return Response.Error.Database(collectionName)
        }
    }

    delete = async () =>
    {
        await collection.findOneAndDelete({ _id: this.id })
        delete this
        return Response.Success.Delete
    }
}

module.exports = Roles