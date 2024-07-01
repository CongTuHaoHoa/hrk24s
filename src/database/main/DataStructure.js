const { ObjectId } = require('mongodb')
const response = require("../../constants/response");

class DataStructure extends Object
{
    #_collection
    #_id

    set id(value)
    {
        this.#_id = value
    }

    get id()
    {
        return this.#_id
    }

    get collection()
    {
        return this.#_collection
    }

    constructor(collection, id)
    {
        super()
        this.#_collection = collection
        this.#_id = id
    }

    static find = async filter => (await this.collection.find().toArray()).filter(value => Object.keys(filter).map(key => filter[key].toString() === value[key].toString()).every(check => check === true))

    static clear = async () =>
    {
        const list = await this.find()
        for (const item of list) { await item.delete() }
    }

    delete = async () =>
    {
        await this.collection.findOneAndDelete({ _id: new ObjectId(this.#_id.toString()) })
        delete this

        return response.SUCCESS.DELETE({ _id: this.id })
    }
}

module.exports = DataStructure

