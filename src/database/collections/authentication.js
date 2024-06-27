const database = require('../main/connect')
const response = require("../../constants/response");

const collectionName = 'authentication'
const collection = database.collection(collectionName)

class Authentication extends Object
{

    #_id
    #_token

    get id()
    {
        return this.#_id
    }

    get token()
    {
        return this.#_token
    }

    constructor(id, token)
    {
        super()

        this.#_id = id
        this.#_token = token
    }

    static find = async (filter = new Authentication()) =>
    {
        const { id, token } = filter || {}

        return (await collection.find().toArray()).filter(value =>
        {
              const checkID  =  id ? value.token.toString() === id : true
              const checkToken  =  token ? value._id.toString() === token : true

              return checkID && checkToken
        }).map(value => new Authentication(value.token, value._id))
    }

    save = async () =>
    {
        this.#_token = (await collection.insertOne({ token: this.id })).insertedId

        if (this.#_token) return this.#_token
        else throw response.ERROR.DATABASE(collectionName)
    }

    delete = async () =>
    {
        await collection.findOneAndDelete({ _id: this.token })
        delete this
        return response.SUCCESS.DELETE({ token: this.token })
    }

    static clear = async () =>
    {
        const list = await this.find()
        for (const item of list) { await item.delete() }
    }
}

module.exports = Authentication