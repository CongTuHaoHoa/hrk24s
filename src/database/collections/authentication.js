const database = require('../main/connect')
const response = require("../../constants/response");
const collectionName = 'authentication'
const collection = database.collection(collectionName)

class Authentication extends Object
{
    #_id
    #_token
    #_verify

    get id()
    {
        return this.#_id
    }

    get token()
    {
        return this.#_token
    }

    get verify()
    {
        return this.#_verify
    }
    set verify(value)
    {
        this.#_verify = value
    }

    constructor(id, token, verify)
    {
        super()

        this.#_id = id
        this.#_token = token
        this.#_verify = verify || false
    }

    static find = async (filter = {}) =>
    {
        const { id, token } = filter || {}

        return (await collection.find().toArray()).filter(value =>
        {
              const checkID  =  id ? value.token.toString() === id : true
              const checkToken  =  token ? value._id.toString() === token : true

              return checkID && checkToken
        }).map(value => new Authentication(value.token, value._id, value.verify))
    }

    #_changeData = () =>
    ({
        token : this.id,
        verify : this.verify
    })


    save = async () =>
    {
        if(this.token)
        {
            const authentication = this.#_changeData()
            console.log(authentication)

            await collection.findOneAndUpdate({ _id: this.token }, { $set: authentication })
            return this
        }
        else
        {
            const authentication = this.#_changeData()
            this.#_token = (await collection.insertOne(authentication)).insertedId
            if (this.#_token) return this.#_token
            else throw response.ERROR.DATABASE(collectionName)
        }
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