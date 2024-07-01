const path = require("path");
const database = require('../main/connect')
const fs = require("fs");
const response = require('../../constants/response')

const collectionName = 'users'
const directory = 'images/avatar/admin'

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
        return this.#_avatar
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
        return this.#_role
    }
    set role(value)
    {
        this.#_role = value;
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
        this.#_role = role || 0
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

        google : this.google,
        googleMail : this.googleMail,
        googleName : this.googleName,
        googlePicture : this.googlePicture,

        facebook : this.facebook,

        facebookMail : this.facebookMail,
        facebookName : this.facebookName,
        facebookPicture : this.facebookPicture,

        totp : this.totp
    })


    #_changeData = () =>
    ({
        ...this.toJSON(),

        password : this.password,
    })

    static find = async (filter = {}) => (await collection.find().toArray()).filter(value => Object.keys(filter).map(key => filter[key].toString() === (value[key === 'id' ? '_id' : key] || '').toString()).every(check => check === true)).map(value => new Users({ ...value, id : value._id }))

    save = async () =>
    {
        if (this.id)
        {
            const oldFilePath = this.avatar ? path.join(__dirname, '../../../public', this.avatar) : null
            const user = this.#_changeData()

            delete user.id
            delete user.avatar

            await collection.findOneAndUpdate({ _id: this.id }, { $set: user })

            if (this.image)
            {
                const mimetype =  this.image.mimetype.split`/`[1]
                this.#_avatar = `${ directory }/${ this.id }.${ mimetype }`

                const newFilepath = path.join(__dirname, '../../../public', this.#_avatar)

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
            else if (this.#_avatar === false && oldFilePath) await fs.unlink(oldFilePath, () => {})

            return this
        }
        else
        {
            const user = this.#_changeData()
            delete user.id

            this.#_id = (await collection.insertOne(user)).insertedId

            if (this.id)
            {
                if (this.image)
                {
                    const mimetype =  this.image.mimetype.split`/`[1]
                    this.#_avatar = `${ directory }/${ this.id }.${ mimetype }`

                    const filepath = path.join(__dirname, '../../../public', this.avatar)

                    await fs.writeFile(filepath, this.image.buffer, async error =>
                    {
                        if (!error) await collection.findOneAndUpdate({ _id : this.id }, { $set: { avatar: this.avatar }})
                        else await collection.findOneAndDelete({ _id: this.id })
                    })
                }
                return this
            }
            else throw response.ERROR.DATABASE(collectionName)
        }
    }
    delete = async () =>
    {
        console.log(this.id)
        const filepath = this.avatar ? path.join(__dirname, '../../../public', this.avatar) : null

        await collection.findOneAndDelete({ _id: this.id })
        if (filepath) await fs.unlink(filepath, () => {})

        delete this
        return response.SUCCESS.DELETE({ _id: this.id })
    }
}

module.exports = Users