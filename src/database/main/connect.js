const { MongoClient, ServerApiVersion } = require('mongodb');
const colors = require('colors')
const uri = require('./URI')
const Response = require('../../constants/response')

const clientOptions =
{
    serverApi:
    {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
}

const client = new MongoClient(uri, clientOptions)

const run = async () =>
{
    try
    {
        await client.connect()
        return colors.green('Kết nối Database thành công !!')
    }
    catch (e)
    {
        return Response.Error.Database()
    }
}


module.exports = async () => await run().catch(console.dir)
module.exports.collection = collectionName => client.db('HurrikyanDB').collection(collectionName)

