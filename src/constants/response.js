const Type = require('./response-type')
const { Main } = require('./response-type')

class Error
{
    static PageNotFound = (method, path) => Type.NotFound(`Không tìm thấy trang, kiểm tra lại phương thức <${ method }> hoặc đường dẫn : ${ path }`)

    static NotFound = data => Type.NotFound(`Không tìm thấy <${ data[Object.keys(data)[0]] }> : kiểm tra trường <${ Object.keys(data)[0] }>`)
    static Database = name => Type.ServiceUnavailable(name ? 'Database không thể khởi động' : `Database bị lỗi : ${ name }`)
    static MissingFields = fields => Type.BadRequest(`Thiếu trường : ${ fields.join(', ')}`)
    static BlankFields = fields => Type.LengthRequired(`Trường rỗng : ${ fields.join(', ')}`)
    static File = mime => Type.UnsupportedMediaType(`Chỉ cho phép đuôi file : ${ mime }`)

    static Exists = value => Type.Conflict(`<${ value }> đã tồn tại`)
    static DeleteFather = Type.Conflict('Không thể xoá tài nguyên có giá trị ràng buộc')

    static DeleteRoot = Type.Forbidden('Không thể xoá tài khoản hệ thống')
    static DeleteDefault = Type.Forbidden('Không thể xoá tài nguyên mặc định')
    static Forbidden = Type.Forbidden('Bạn không đủ quyền để thao tác mục này')
    static HigherRankInteract = Type.Forbidden('Bạn chỉ có thể chỉnh sửa tài khoản có quyền thấp hơn bạn')
    static HigherRankEdit = Type.Forbidden('Bạn không thể cấp quyền cao hơn hoặc bằng quyền của bản thân')

    static MethodNotAllow = Type.MethodNotAllowed('Phương thức không được hỗ trợ')

    static Authentication = Type.Unauthorized(`Chưa đăng nhập`)
    static Verification = Type.Unauthorized(`Sai mã xác thực`)
    static Password = Type.Unauthorized(`Sai tên tài khoản hoặc mật khẩu`)

}

class Success
{
    static Add = new Main('Thêm thành công', 200)
    static Edit = new Main('Sửa thành công', 200)
    static Delete = new Main('Xoá thành công', 200)
}

module.exports.Error = Error
module.exports.Success = Success