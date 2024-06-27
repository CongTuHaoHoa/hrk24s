class Response extends Error
{
    constructor(message, code = 500){ super(message); this.code = code; this.error = code !== 200 }
    toJSON = () => ({ message: this.message, code: this.code, error: this.error })
}

/**
 * @returns {Response} - Trả về tin nhắn báo lỗi
 * @param fields { [string] } - Truyền vào mảng các trường để check xem có tồn tại hay không
 */
const MISSING = fields => new Response(`Missing fields(s): ${ fields.join(', ')}`, 400)

/**
 * @returns {Response} - Trả về tin nhắn báo lỗi
 * @param name { string } - Truyền vào tên database bị lỗi
 */
const DATABASE = name => new Response(`Database error: ${ name }`,500)

/**
 * @returns {Response} - Trả về tin nhắn báo lỗi
 * @param data { object } - Truyền vào Object chứa giá trị đã tồn tại
 */
const EXISTS = data => new Response(`<${ data[Object.keys(data)[0]] }> is already exists: check field ${ Object.keys(data)[0] }`, 409)

/**
 * @returns {Response} - Trả về tin nhắn báo lỗi
 * @param data { object } - Truyền vào Object chứa giá trị không tìm thấy
 */
const NOTFOUND = data => new Response(`<${ data[Object.keys(data)[0]] }> is not found: check field <${ Object.keys(data)[0] }>`, 404)

/**
 * @returns {Response} - Trả về tin nhắn báo lỗi
 * @param mime { string } - Truyền vào tên đuôi file được cho phép
 */
const NOTALLOWED = mime => new Response(`'Only ${ mime } allow !!'`, 403)

/**
 * Đóng gói các giá trị lỗi
 */
const ERROR = { MISSING, DATABASE, EXISTS, NOTFOUND, NOTALLOWED }
module.exports.ERROR = ERROR




/**
 * @param _id { string } - Truyền vào ID của Object khi đã thêm thành công
 * - Nếu ID trống sẽ không render tin nhắn báo ID
 * @returns {{message: string}} - Trả về tin nhắn báo thành công
 */
const ADD = data =>  new Response(`Adding successfully${ data ? ` with ${ Object.keys(data)[0] }: <${ data[Object.keys(data)[0]] }>` : ''} !!`, 200)
const EDIT = data =>  new Response(`Edit${ data ? ` ${ Object.keys(data)[0] }: <${ data[Object.keys(data)[0]] }>` : ''} successfully !!`, 200)
const DELETE = data =>  new Response(`Delete${ data ? ` ${ Object.keys(data)[0] }: <${ data[Object.keys(data)[0]] }>` : ''} successfully !!`, 200)
const COMPLETE = new Response('Success !!', 200)

/**
 * Đóng gói các tin nhắn báo thành công
 */
const SUCCESS =  { COMPLETE, ADD, EDIT, DELETE }
module.exports.SUCCESS = SUCCESS




