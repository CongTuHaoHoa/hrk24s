/**
 * @returns {{error: string}} - Trả về tin nhắn báo lỗi
 * @param fields { string } - Truyền vào mảng các trường để check xem có tồn tại hay không
 */
const MISSING = fields => ({ error: `Missing fields(s): ${ fields.join(', ')}`, code: 402 })

/**
 * @returns {{error: string}} - Trả về tin nhắn báo lỗi
 * @param name { string } - Truyền vào tên database bị lỗi
 */
const DATABASE = name => ({ error: `Database error: ${ name }`, code: 500 })

/**
 * @returns {{error: string}} - Trả về tin nhắn báo lỗi
 * @param data { object } - Truyền vào Object chứa giá trị đã tồn tại
 */
const EXISTS = data => ({ error: `<${ data[Object.keys(data)[0]] }> is already exists: check field ${ Object.keys(data)[0] }`, code: 400 })

/**
 * @returns {{error: string}} - Trả về tin nhắn báo lỗi
 * @param data { object } - Truyền vào Object chứa giá trị không tìm thấy
 */
const NOTFOUND = data => ({ error: `<${ data[Object.keys(data)[0]] }> is not found: check field <${ Object.keys(data)[0] }>`, code: 400 })

/**
 * Đóng gói các giá trị lỗi
 */
const ERROR = { MISSING, DATABASE, EXISTS, NOTFOUND }
module.exports.ERROR = ERROR




/**
 * @param _id { string } - Truyền vào ID của Object khi đã thêm thành công
 * - Nếu ID trống sẽ không render tin nhắn báo ID
 * @returns {{message: string}} - Trả về tin nhắn báo thành công
 */
const ADD = _id =>  ({ message: `Adding successfully${ _id ? ` with id: <${_id}>` : ''} !!`, code: 200 })
const EDIT = _id =>  ({ message: `Edit${ _id ? ` id: <${_id}>` : ''} successfully !!`, code: 200 })
const DELETE = _id =>  ({ message: `Delete${ _id ? ` id: <${_id}>` : ''} successfully !!`, code: 200 })

/**
 * Đóng gói các tin nhắn báo thành công
 */
const SUCCESS =  { message: 'Success !!', code: 200, ADD, EDIT, DELETE }
module.exports.SUCCESS = SUCCESS



