const Response = require("../../constants/response")
const database = require("../main/connect")
const path = require("path");
const fs = require("fs");
const NodeID3 = require('node-id3')
const mp3Duration = require('mp3-duration')
const Socket = require("../../constants/socket");

const collectionName = 'musics'
const mediaDirectory = 'medias'
const pictureDirectory = 'images/musics'
const publicDirectory = '../../../public'
const collection = database.collection(collectionName)

const dumb =
{
    audio: '', picture: '', artist: ''
}
const getDuration = async fileBuffer =>
{
    return new Promise((resolve, reject) =>
    {
        mp3Duration(fileBuffer, (err, duration) =>
        {
            if (err) return reject(err)
            resolve(duration)
        })
    })
}

class Music extends Object
{
    #_id
    get id()
    {
        return this.#_id ? this.#_id.toString() : this.#_id
    }
    
    #_name
    get name()
    {
        return this.#_name
    }
    set name(value)
    {
        this.#_name = value
    }
    
    #_audio
    get audio()
    {
        return this.#_audio
    }
    set audio(value)
    {
        this.#_audio = value
    }
    
    #_picture
    get picture()
    {
        return this.#_picture
    }
    set picture(value)
    {
        this.#_picture = value
    }
    
    #_artist
    get artist()
    {
        return this.#_artist
    }
    
    #_views
    get views()
    {
        return this.#_views
    }
    set views(value)
    {
        this.#_views = value
    }

    #_time
    get time()
    {
        return this.#_time
    }
    #_duration
    get duration()
    {
        return this.#_duration
    }

    #_privacy
    get privacy()
    {
        return this.#_privacy
    }
    set privacy(value)
    {
        this.#_privacy = value
    }

    constructor(data)
    {
        super(data)
        const { id, name, audio, picture, artist, views, time, privacy, duration } = data
        
        this.#_id = id
        this.#_name = name
        this.#_audio = audio
        this.#_picture = picture
        this.#_artist = artist
        this.#_views = views || 0
        this.#_time = time || Date.now()
        this.#_duration = duration || 0
        this.#_privacy = privacy || 'public'
    }

    toJSON = () =>
    ({
        id: this.id,
        audio: this.audio,
        picture: this.picture,
        artist: this.artist,
        ...this.#_changeData()
    })
    #_changeData = () =>
    ({
        name: this.name,
        time: this.time,
        views: this.views,
        duration: this.duration,
        privacy: this.privacy,
    })

    #_add = async () =>
    {
        this.#_id = (await collection.insertOne({ ...dumb, ... this.#_changeData() })).insertedId
        if (!this.#_id) return Response.Error.Database(collectionName)

        const tags =
        {
            title: this.name,
            artist: this.artist.fullname,
            APIC: null,
        }

        if (this.picture)
        {
            if (typeof this.picture !== 'string')
            {
                const mimetype =  this.picture.mimetype.split`/`[1]
                const link = `${ pictureDirectory }/${ this.id }.${ mimetype }`
                const filepath = path.join(__dirname, publicDirectory, link)
                await fs.writeFile(filepath, this.picture.buffer,  () => {})

                tags.APIC =
                {
                    mime: `image/${mimetype}`,
                    type: 3,
                    description: this.name,
                    imageBuffer: this.picture.buffer
                }

                this.picture = link
            }
        }

        const media = `${ mediaDirectory }/${ this.id }.mp3`
        const filepath = path.join(__dirname, publicDirectory, media)
        await fs.writeFile(filepath, this.audio.buffer,  () => {})
        this.#_duration = await getDuration(this.audio.buffer)

        this.audio = media
        this.#_artist = this.artist.id.toString()

        NodeID3.write(tags, filepath, err => {})

        const { picture, audio, artist, duration } = this.toJSON()
        await collection.findOneAndUpdate({ _id: this.#_id }, { $set: { picture, audio, artist, duration } })

        Socket.send('musics', 'musics')
        return this
    }
    #_edit = async () =>
    {
        const oldData = (await Music.find({ id: this.id }))[0]
        let buffer
        let type

        if (oldData?.picture)
        {
            const oldFilePath = path.join(__dirname, publicDirectory, oldData.picture)
            buffer = await fs.promises.readFile(oldFilePath)
            type = oldData.picture.split('.')[1]
        }


        const tags =
        {
            title: this.name,
            artist: this.artist.fullname,
            APIC: oldData?.picture ?
            {
                mime: `image/${ type }`,
                type: 3,
                description: this.name,
                imageBuffer: buffer
            } : null,
        }

        if (typeof this.picture !== 'string' && this.picture)
        {
            if (oldData.picture)
            {
                const imagePath = path.join(__dirname, publicDirectory, oldData.picture)
                await fs.unlink(imagePath, () => {})
            }

            const mimetype =  this.picture.mimetype.split`/`[1]

            const link = `${ pictureDirectory }/${ this.id }.${ mimetype }`
            const filepath = path.join(__dirname, publicDirectory, link)
            await fs.writeFile(filepath, this.picture.buffer,  () => {})

            tags.APIC =
            {
                mime: `image/${ mimetype }`,
                type: 3,
                description: this.name,
                imageBuffer: this.picture.buffer
            }

            this.picture = link
        }

        if (typeof this.audio !== 'string')
        {
            const filepath = path.join(__dirname, publicDirectory, oldData.audio)
            await fs.writeFile(filepath, this.audio.buffer,  () => {})
            this.#_duration = await getDuration(this.audio.buffer)
        }
        if (!tags.APIC) delete tags.APIC

        NodeID3.write(tags, path.join(__dirname, publicDirectory, oldData.audio), err => {})

        const music = this.toJSON()

        delete music.id
        delete music.artist
        delete music.audio
        delete music.time

        await collection.findOneAndUpdate({ _id: this.#_id }, { $set: music })

        Socket.send('musics', 'musics')
        return this
    }

    static find = async (filter = {}) => (await collection.find().toArray()).filter(value =>
    Object.keys(filter).map(key => filter[key] ? filter[key].toString() === value[key === 'id' ? '_id' : key].toString() : false)
    .every(check => check === true)).map(value => new Music({ ...value, id : value._id }))

    save = async () =>
    {
        if (this.id) return await this.#_edit()
        else return await this.#_add()
    }
    delete = async () =>
    {
        await collection.findOneAndDelete({ _id: this.#_id })

        const imagePath = this.picture ? path.join(__dirname, publicDirectory, this.picture) : null
        const mediaPath = path.join(__dirname, publicDirectory, this.audio)
        if (imagePath) await fs.unlink(imagePath, () => {})
        await fs.unlink(mediaPath, () => {})

        Socket.send('musics', 'musics')
        delete this
        return Response.Success.Delete
    }
}

module.exports = Music