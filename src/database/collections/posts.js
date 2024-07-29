const database = require('../main/connect')
const Response = require("../../constants/response");
const {schema} = require("prosemirror-schema-basic");
const {DOMSerializer} = require("prosemirror-model");
const collectionName = 'posts'
const directory = 'images/posts'
const publicDirectory = '../../../public'
const server = require("../../constants/URI-server");

const collection = database.collection(collectionName)
const jsdom = require('jsdom');
const path = require("path");
const fs = require("fs");
const {ObjectId} = require("mongodb");
const {find} = require("./notification");
const { JSDOM } = jsdom;

const convertToHTML = content =>
{
    const doc = schema.nodeFromJSON({ type: "doc", content });
    const dom = new JSDOM();
    const document = dom.window.document;

    const fragment = DOMSerializer.fromSchema(schema).serializeFragment(doc.content, { document });
    const div = document.createElement('div');
    div.appendChild(fragment);


    return div.innerHTML;
}

const wrapYouTubeIframes = html =>
{
    const dom = new JSDOM(html)
    const doc = dom.window.document

    const iframes = doc.querySelectorAll('iframe')

    iframes.forEach(iframe =>
    {
        const src = iframe.getAttribute('src');
        if (src && (src.includes('youtube.com') || src.includes('youtu.be')))
        {
            if (!iframe.closest('div[data-youtube-video]'))
            {
                const div = doc.createElement('div')
                div.setAttribute('data-youtube-video', '')
                iframe.parentNode.insertBefore(div, iframe)
                div.appendChild(iframe);
            }
        }
    })

    return doc.body.innerHTML
}

const convertToSlug = text =>
{
    return text
    .toLowerCase()
     .replace(/á|à|ả|ã|ạ|â|ầ|ẩ|ẫ|ậ|ă|ắ|ằ|ẳ|ẵ|ặ|đ|é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ|í|ì|ỉ|ĩ|ị|ó|ò|ỏ|õ|ọ|ô|ồ|ố|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ|ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự|ý|ỳ|ỷ|ỹ|ỵ/g, (match) => {
         const map = {
             'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a', 'â': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a', 'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
             'đ': 'd', 'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e', 'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
             'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
             'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o', 'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
             'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u', 'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
             'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y'
         };
         return map[match];
     })
     .replace(/\s+/g, '-')
     .replace(/[^\w\-]+/g, '')
     .replace(/\-\-+/g, '-')
     .replace(/^-+/, '')
     .replace(/-+$/, '')
}

const getParagraph = content =>
{
    if (content)
    {
        for (const node of content)
        {
            if (node.type === 'paragraph') return node.content.map(textNode => textNode.text).join('')
        }
    }
    return null;
}
const getBlockQuote = content =>
{
    if (content)
    {
        for (const node of content)
        {
            if (node.type === 'blockquote')
            {
                return node.content.map(contentNode => contentNode.content[0].text).join('\n')
            }
        }
        return getParagraph(content)
    }
    return null
}
const getHeading = content =>
{
    if (content)
    {
        const headings = [1, 2, 3, 4, 5, 6]

        for (const level of headings)
        {
            for (const node of content)
            {
                if (node.type === 'heading' && node.attrs.level === level) return node.content.map(textNode => textNode.text).join('')
            }
        }

        return getParagraph(content)
    }
    return null;
}

const getPicture = (content, map) =>
{
    if (content)
    {
        for (const node of content)
        {
            if (node.type === 'image') return map[node.attrs.src] || node.attrs.src
        }
    }
    return null
}

const deleteDirectory = directoryPath =>
{
    if (fs.existsSync(directoryPath)) fs.rmSync(directoryPath, { recursive: true })
}

const deleteFiles = directoryPath =>
{
    if (fs.existsSync(directoryPath))
    {
        const files = fs.readdirSync(directoryPath)
        for (const file of files)
        {
            const filePath = path.join(directoryPath, file)
            if (fs.statSync(filePath).isFile()) fs.unlinkSync(filePath)
        }
    }
}

const getFiles = directoryPath =>
{
    if (fs.existsSync(directoryPath))
    {
        const files = fs.readdirSync(directoryPath)
        const fileNames = files.filter(file => fs.statSync(path.join(directoryPath, file)).isFile())
        return fileNames
    }
    else return []
}

const getMaxNumber = fileNames =>
{
    let maxNumber = 0;

    fileNames.forEach(fileName =>
    {
        const match = fileName.match(/-(\d+)\./);
        if (match)
        {
            const number = parseInt(match[1], 10)
            if (number > maxNumber) maxNumber = number
        }
    });

    return maxNumber + 1
}

const getNewFiles = nodes =>
{
    const extractSources = (nodes) =>
    {
        let sources = []
        nodes.forEach(node =>
        {
            if (node.type === 'image' && node.attrs && node.attrs.src) sources.push(node.attrs.src)
            else if (node.content) sources = sources.concat(extractSources(node.content))
        });
        return sources;
    };
    return extractSources(nodes)
}

const dumb = { title: '', picture: '', preview: '', content: '', url: '' }

class Post extends Object
{
    #_id
    #_title
    #_picture
    #_preview
    #_keys
    #_files
    #_content
    #_nodes
    #_time
    #_url
    #_author
    #_privacy


    get id()
    {
        return this.#_id ? this.#_id.toString() : this.#_id;
    }
    get title()
    {
        return this.#_title;
    }
    get preview()
    {
        return this.#_preview;
    }
    get picture()
    {
        return this.#_picture;
    }
    get keys()
    {
        return this.#_keys;
    }
    get files()
    {
        return this.#_files;
    }
    get content()
    {
        return this.#_content;
    }
    get nodes()
    {
        return this.#_nodes;
    }
    get time()
    {
        return this.#_time;
    }
    get url()
    {
        return this.#_url;
    }
    get author()
    {
        return this.#_author ? this.#_author.toString() : this.#_author;
    }
    get privacy()
    {
        return this.#_privacy;
    }

    set title(value)
    {
        this.#_title = value;
    }
    set picture(value)
    {
        this.#_picture = value;
    }
    set preview(value)
    {
        this.#_preview = value;
    }
    set content(value)
    {
        this.#_content = value;
    }
    set keys(value)
    {
        this.#_keys = value;
    }
    set files(value)
    {
        this.#_files = value;
    }
    set nodes(value)
    {
        this.#_nodes = value;
    }
    set privacy(value)
    {
        this.#_privacy = value;
    }

    constructor(data)
    {
        super(data)

        const { id, title, picture, preview, privacy, keys, files, content, time, url, author, nodes } = data

        this.#_id = id
        this.#_title = title
        this.#_picture = picture
        this.#_preview = preview
        this.#_keys = keys || []
        this.#_files = files || []
        this.#_content = content || ''

        this.#_nodes = nodes || []

        this.#_time = time || Date.now()
        this.#_url = url || ''
        this.#_author = author || ''
        this.#_privacy = privacy || 'public'
    }

    toJSON = () =>
    ({
        id: this.id,
        author: this.author,
        time: this.time,

        ...this.#_changeData()
    })

    #_changeData = () =>
    ({
        url: this.url,
        privacy: this.privacy,
        title: this.title,
        picture: this.picture,
        preview: this.preview,
        content: this.content,
    })

    static find = async (filter = {}) => (await collection.find().toArray()).filter(value =>
    Object.keys(filter).map(key => filter[key] ? filter[key].toString() === value[key === 'id' ? '_id' : key].toString() : false)
    .every(check => check === true)).map(value => new Post({ ...value, id : value._id }))

    delete = async () =>
    {
        await collection.findOneAndDelete({ _id: this.#_id })
        const directoryPath = path.join(__dirname, publicDirectory, directory, this.id)

        deleteFiles(directoryPath)
        deleteDirectory(directoryPath)
        delete this

        return Response.Success.Delete
    }

    #_add = async () =>
    {
        this.#_id = (await collection.insertOne({ ...dumb, time: this.time, author: this.author })).insertedId

        const newDirectory = path.join(__dirname, publicDirectory, directory, this.id);

        await fs.mkdir(newDirectory, { recursive: true }, () => {})

        if ((!this.#_title) || this.#_title === '') this.#_title = getHeading(this.nodes) || 'Untitled'
        if (!this.#_preview) this.#_preview = getBlockQuote(this.nodes) || ''

        const slug = convertToSlug(this.#_title)
        const map = {}

        this.#_url = `${ slug }-${ this.id }.html`

        if (this.#_files.length && this.#_keys.length && this.#_files.length === this.#_keys.length)
        {
            let index = 0

            for (const file of this.#_files)
            {
                const mimetype =  file.mimetype.split`/`[1]
                const link = `${ directory }/${ this.id }/${ slug }-${ index + 1 }.${ mimetype }`
                const key = this.#_keys[index]

                const filepath = path.join(__dirname, publicDirectory, link)
                map[key] = `${ server }/${ link }`
                this.#_content = this.#_content.replace(new RegExp(`src="${ key }"`, 'g'), `src="${ `${ server }/${ link }` }"`)

                await fs.writeFile(filepath, file.buffer,  () => {})

                index++
            }
        }

        if (this.#_picture)
        {
            if (typeof this.#_picture !== 'string')
            {
                const mimetype =  this.#_picture.mimetype.split`/`[1]
                const link = `${ directory }/${ this.id }/${ slug }.${ mimetype }`
                const filepath = path.join(__dirname, publicDirectory, link)

                await fs.writeFile(filepath, this.#_picture.buffer,  () => {})

                this.#_picture = `${ server }/${ link }`
            }
        }
        else this.#_picture = getPicture(this.nodes, map)

        this.#_content = wrapYouTubeIframes(this.#_content)

        const post = this.#_changeData()

        await collection.findOneAndUpdate({ _id: this.#_id }, { $set: post })


        if (this.#_id) return this
        return Response.Error.Database(collectionName)
    }

    #_edit = async () =>
    {
        const oldData = (await Post.find({ id: this.id }))[0]

        const directoryPath = path.join(__dirname, publicDirectory, directory, this.id)

        const oldSavedFiles = getFiles(directoryPath)
        const newFiles = getNewFiles(this.#_nodes)
        const newFileCounter = getMaxNumber(oldSavedFiles)

        const reusedOldSavedFiles = oldSavedFiles.filter(file =>
        {
            const serverPath = `${ server }/${ directory }/${ this.id }`
            const link = `${ serverPath }/${ file }`
            return newFiles.includes(link) || (typeof this.#_picture === 'string' && this.#_picture === link)
        })

        const removableOldSavedFiles = oldSavedFiles.filter(file => !reusedOldSavedFiles.includes(file))

        for (const removableOldSavedFile of removableOldSavedFiles)
        {
            const removeFilePath =  path.join(__dirname, publicDirectory, directory, this.id,removableOldSavedFile)
            await fs.unlink(removeFilePath, () => {})
        }

        if ((!this.#_title) || this.#_title === '') this.#_title = getHeading(this.nodes) || 'Untitled'
        if (!this.#_preview) this.#_preview = getBlockQuote(this.nodes) || ''

        const slug = this.#_url.substring(0, this.#_url.length - `-${ this.id }.html`.length)
        const map = {}

        if (this.#_files.length && this.#_keys.length && this.#_files.length === this.#_keys.length)
        {
            let index = 0

            for (const file of this.#_files)
            {
                const mimetype =  file.mimetype.split`/`[1]
                const link = `${ directory }/${ this.id }/${ slug }-${ index + newFileCounter }.${ mimetype }`
                const key = this.#_keys[index]

                const filepath = path.join(__dirname, publicDirectory, link)
                map[key] = `${ server }/${ link }`
                this.#_content = this.#_content.replace(new RegExp(`src="${ key }"`, 'g'), `src="${ `${ server }/${ link }` }"`)

                await fs.writeFile(filepath, file.buffer,  () => {})

                index++
            }
        }

        if (this.#_picture)
        {
            if (typeof this.#_picture !== 'string')
            {
                const mimetype =  this.#_picture.mimetype.split`/`[1]
                const link = `${ directory }/${ this.id }/${ slug }.${ mimetype }`
                const filepath = path.join(__dirname, publicDirectory, link)

                await fs.writeFile(filepath, this.#_picture.buffer,  () => {})

                this.#_picture = `${ server }/${ link }`
            }
        }
        else if (!oldData.picture) this.#_picture = getPicture(this.nodes, map)

        this.#_content = wrapYouTubeIframes(this.#_content)

        const post = this.#_changeData()
        await collection.findOneAndUpdate({ _id: this.#_id }, { $set: post })
        return this
    }

    save = async () =>
    {
        if (this.id) return await this.#_edit()
        else return await this.#_add()
    }
}

module.exports = Post
