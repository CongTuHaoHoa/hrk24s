const { MongoClient, ServerApiVersion } = require('mongodb');
const colors = require('colors')
const uri = require('./URI')

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
        console.log(colors.green('Kết nối Database thành công !!'))
    }
    catch (e)
    {
        console.log(colors.red(`Kết nối Database thất bại !!\nMã lối: ${ e.name }`))
    }
}


module.exports = async () => await run().catch(console.dir)
module.exports.collection = collectionName => client.db('HurrikyanDB').collection(collectionName)

