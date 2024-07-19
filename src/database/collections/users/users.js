const path = require("path");
const database = require('../../main/connect')
const fs = require('fs');
const Response = require('../../../constants/response')
const { array, string } = require('../../../constants/access')

const Notification = require("../notification");
const Authentication = require("../authentication");
const Socket = require("../../../constants/socket");

const collectionName = 'users'
const directory = 'images/avatar'
const publicDirectory = '../../../../public'

const collection = database.collection(collectionName)

class Users extends Object
{
    #_id
    #_avatar

    #_username
    #_password

    #_image

    #_fullname
    #_settingTheme
    #_settingLanguage
    #_role

    #_google
    #_googleMail
    #_googleName
    #_googlePicture

    #_facebook
    #_facebookMail
    #_facebookName
    #_facebookPicture

    #_totp

    get id()
    {
        return this.#_id
    }
    get avatar()
    {
        return this.#_avatar ? this.#_avatar : ''
    }
    set avatar(value)
    {
        this.#_avatar = value;
    }

    get username()
    {
        return this.#_username
    }
    set username(value)
    {
        this.#_username = value;
    }
    get password()
    {
        return this.#_password
    }
    set password(value)
    {
        this.#_password = value;
    }

    get image()
    {
        return this.#_image
    }
    set image(value)
    {
        this.#_image = value;
    }

    get fullname()
    {
        return this.#_fullname
    }
    set fullname(value)
    {
        this.#_fullname = value;
    }
    get settingTheme()
    {
        return this.#_settingTheme
    }
    set settingTheme(value)
    {
        this.#_settingTheme = value;
    }
    get settingLanguage()
    {
        return this.#_settingLanguage
    }
    set settingLanguage(value)
    {
        this.#_settingLanguage = value;
    }
    get role()
    {
        return array(this.#_role)
    }
    set role(value)
    {
        this.#_role = value.toString();
    }
    get google()
    {
        return this.#_google
    }
    set google(value)
    {
        this.#_google = value;
    }
    get googleMail()
    {
        return this.#_googleMail
    }
    set googleMail(value)
    {
        this.#_googleMail = value;
    }
    get googleName()
    {
        return this.#_googleName
    }
    set googleName(value)
    {
        this.#_googleName = value;
    }
    get googlePicture()
    {
        return this.#_googlePicture
    }
    set googlePicture(value)
    {
        this.#_googlePicture = value;
    }

    get facebook()
    {
        return this.#_facebook
    }
    set facebook(value)
    {
        this.#_facebook = value;
    }
    get facebookMail()
    {
        return this.#_facebookMail
    }
    set facebookMail(value)
    {
        this.#_facebookMail = value;
    }
    get facebookName()
    {
        return this.#_facebookName
    }
    set facebookName(value)
    {
        this.#_facebookName = value;
    }
    get facebookPicture()
    {
        return this.#_facebookPicture
    }
    set facebookPicture(value)
    {
        this.#_facebookPicture = value;
    }

    get totp()
    {
        return this.#_totp
    }
    set totp(value)
    {
        this.#_totp = value;
    }

    constructor(options)
    {
        super()

        const { id, username, password, fullname, avatar, image,
                  settingTheme, settingLanguage,
                  role,
                  google, googleMail, googleName, googlePicture,

                  facebook, facebookMail, facebookName, facebookPicture,


                  totp } = options || {}

        this.#_id = id
        this.#_image = image
        this.#_username = username
        this.#_password = password
        this.#_fullname = fullname
        this.#_avatar = avatar || ''
        this.#_settingTheme = settingTheme || 'system'
        this.#_settingLanguage = settingLanguage || 'VN'
        this.#_role = role || '["client"]'
        this.#_google = google || ''
        this.#_googleMail = googleMail || ''
        this.#_googleName = googleName || ''
        this.#_googlePicture = googlePicture || ''
        this.#_facebook = facebook || ''
        this.#_facebookMail = facebookMail || ''
        this.#_facebookName = facebookName || ''
        this.#_facebookPicture = facebookPicture || ''
        this.#_totp = totp || ''
    }

    toJSON = () =>
    ({
        id : this.id,

        username : this.username,
        fullname : this.fullname,
        avatar : this.avatar,

        settingTheme : this.settingTheme,
        settingLanguage : this.settingLanguage,

        role : this.role,

        google : !!this.google,

        googleMail : this.googleMail,
        googleName : this.googleName,
        googlePicture : this.googlePicture,

        facebook : !!this.facebook,

        facebookMail : this.facebookMail,
        facebookName : this.facebookName,
        facebookPicture : this.facebookPicture,

        totp : !!this.totp
    })
    #_changeData = () =>
    ({
        ...this.toJSON(),

        password : this.password,
        totp : this.totp,
        facebook : this.facebook,
        google : this.google,
    })

    static find = async (filter = {}) => (await collection.find().toArray()).filter(value =>
    Object.keys(filter).map(key => filter[key] ? filter[key].toString() === (value[key === 'id' ? '_id' : key] || '').toString() : false)
    .every(check => check === true)).map(value => new Users({ ...value, id : value._id }))

    save = async () =>
    {
        if (this.id)
        {
            const oldFilePath = this.#_avatar ? path.join(__dirname, publicDirectory, this.avatar) : null
            const user = this.#_changeData()

            delete user.id
            delete user.avatar

            const set = { ...user, role: string(user.role) }

            await collection.findOneAndUpdate({ _id: this.id }, { $set: set })

            if (this.image)
            {
                const mimetype =  this.image.mimetype.split`/`[1]
                this.#_avatar = `${ directory }/${ this.id }.${ mimetype }`

                const newFilepath = path.join(__dirname, publicDirectory, this.#_avatar)

                if (oldFilePath !== newFilepath)
                {
                    if (oldFilePath) await fs.unlink(oldFilePath, async () =>
                    {
                        await collection.findOneAndUpdate({ _id: this.id }, { $set: { avatar: this.#_avatar }})
                    })
                    else await collection.findOneAndUpdate({ _id: this.id }, { $set: { avatar: this.#_avatar }})
                }

                await fs.writeFile(newFilepath, this.image.buffer, () => {})
            }
            else if (this.#_avatar === false)
            {
                const found = (await Users.find({ id : this.id }))[0]
                const removeFilePath =  path.join(__dirname, publicDirectory, found.avatar)
                await fs.unlink(removeFilePath, () => {})
            }

            await Notification.Success(this.id, 'USER_EDIT', 'Thông tin tài khoản đã được cập nhật', '/accounts').save()

            Socket.send('authentication', this.id)
            Socket.send('users', 'users')

            return this
        }
        else
        {
            const user = this.#_changeData()
            delete user.id
            const set = { ...user, role: string(user.role) }

            this.#_id = (await collection.insertOne(set)).insertedId

            if (this.id)
            {
                if (this.image)
                {
                    const mimetype =  this.image.mimetype.split`/`[1]
                    this.#_avatar = `${ directory }/${ this.id }.${ mimetype }`

                    const filepath = path.join(__dirname, publicDirectory, this.avatar)

                    await fs.writeFile(filepath, this.image.buffer, async error =>
                    {
                        if (!error) await collection.findOneAndUpdate({ _id : this.id }, { $set: { avatar: this.avatar }})
                        else await collection.findOneAndDelete({ _id: this.id })
                    })
                }

                Socket.send('users', 'users')
                return this
            }
            else throw Response.Error.Database(collectionName)
        }
    }

    delete = async () =>
    {
        if (this.role === 'sysadmin') return Response.Error.DeleteRoot

        const filepath = this.avatar ? path.join(__dirname, publicDirectory, this.avatar) : null

        await collection.findOneAndDelete({ _id: this.id })
        await Authentication.clear(this.id.toString())

        if (filepath) await fs.unlink(filepath, () => {})

        delete this


        Socket.send('authentication', this.id)
        Socket.send('users', 'users')
        return Response.Success.Delete
    }
}

module.exports = Users