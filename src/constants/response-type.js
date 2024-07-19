class Response extends Error
{
    constructor(message, code = 500)
    {
        super(message);
        this.code = code;
        this.error = code !== 200
    }

    toJSON = () => ({ message : this.message, code    : this.code, error   : this.error })
}


class ErrorType
{
    /**
     * @param message { string }
     * @returns { Response } Server không thể hiểu yêu cầu do lỗi cú pháp của khách hàng
     */
    static BadRequest = message => new Response(message, 400)

    /**
     * @param message { string }
     * @returns { Response } Khách hàng cần xác thực trước khi truy cập tài nguyên
     */
    static Unauthorized = message => new Response(message, 401)

    /**
     * @param {string} message
     * @returns {Response} Được dự đoán nhưng chưa được sử dụng
     */
    static PaymentRequired = message => new Response(message, 402)

    /**
     * @param {string} message
     * @returns {Response} Không cho phép truy cập do các ràng buộc của máy chủ
     */
    static Forbidden = message => new Response(message, 403)

    /**
     * @param {string} message
     * @returns {Response} Tài nguyên không được tìm thấy trên máy chủ
     */
    static NotFound = message => new Response(message, 404)

    /**
     * @param {string} message
     * @returns {Response} Phương thức yêu cầu không được hỗ trợ
     */
    static MethodNotAllowed = message => new Response(message, 405)

    /**
     * @param {string} message
     * @returns {Response} Server không thể sinh ra dữ liệu theo định dạng được yêu cầu bởi khách hàng
     */
    static NotAcceptable = message => new Response(message, 406)

    /**
     * @param {string} message
     * @returns {Response} Phải xác thực với proxy trước khi yêu cầu được thực hiện
     */
    static ProxyAuthenticationRequired = message => new Response(message, 407)

    /**
     * @param {string} message
     * @returns {Response} Thời gian chờ yêu cầu đã hết
     */
    static RequestTimeout = message => new Response(message, 408)

    /**
     * @param {string} message
     * @returns {Response} Yêu cầu không thể được hoàn thành do một xung đột
     */
    static Conflict = message => new Response(message, 409)

    /**
     * @param {string} message
     * @returns {Response} Tài nguyên không còn tồn tại và không có thông tin chuyển tiếp
     */
    static Gone = message => new Response(message, 410)

    /**
     * @param {string} message
     * @returns {Response} Thiếu trường "Content-Length" trong yêu cầu
     */
    static LengthRequired = message => new Response(message, 411)

    /**
     * @param {string} message
     * @returns {Response} Điều kiện tiên quyết trong yêu cầu không được đáp ứng
     */
    static PreconditionFailed = message => new Response(message, 412)

    /**
     * @param {string} message
     * @returns {Response} Dữ liệu gửi đi vượt quá giới hạn cho phép
     */
    static PayloadTooLarge = message => new Response(message, 413)

    /**
     * @param {string} message
     * @returns {Response} Độ dài của URI vượt quá giới hạn cho phép
     */
    static URITooLong = message => new Response(message, 414)

    /**
     * @param {string} message
     * @returns {Response} Định dạng phương tiện không được hỗ trợ
     */
    static UnsupportedMediaType = message => new Response(message, 415)

    /**
     * @param {string} message
     * @returns {Response} Phạm vi của yêu cầu không thỏa mãn yêu cầu của máy chủ
     */
    static RangeNotSatisfiable = message => new Response(message, 416)

    /**
     * @param {string} message
     * @returns {Response} Máy chủ không thể đáp ứng yêu cầu "Expect" trong trường "Expect" của yêu cầu
     */
    static ExpectationFailed = message => new Response(message, 417)

    /**
     * @param {string} message
     * @returns {Response} Đây là một thông báo đùa, không dành cho sử dụng thực tế
     */
    static ImATeapot = message => new Response(message, 418)
    /**
     * @param {string} message
     * @returns {Response} Được sử dụng khi session của người dùng hết hạn do thời gian chờ đã vượt quá thời gian cho phép
     */
    static AuthenticationTimeout = message => new Response(message, 419)

    /**
     * @param {string} message
     * @returns {Response} Được sử dụng khi phương thức người dùng yêu cầu không thành công
     */
    static MethodFailure  = message => new Response(message, 420)

    /**
     * @param {string} message
     * @returns {Response} Yêu cầu bị sai hướng
     */
    static MisdirectedRequest  = message => new Response(message, 421)

    /**
     * @param {string} message
     * @returns {Response} Thực thể không được xử lí
     */
    static UnprocessableEntity  = message => new Response(message, 422)

    /**
     * @param {string} message
     * @returns {Response} Bị khoá
     */
    static Locked  = message => new Response(message, 423)

    /**
     * @param {string} message
     * @returns {Response} Lỗi kế thừa
     */
    static FailedDependency  = message => new Response(message, 424)

    /**
     * @param {string} message
     * @returns {Response} Yêu cầu nâng cấp
     */
    static UpgradeRequired  = message => new Response(message, 426)

    /**
     * @param {string} message
     * @returns {Response} Bị chặn vì lí do pháp lí
     */
    static UnavailableForLegalReasons  = message => new Response(message, 427)

    /**
     * @param {string} message
     * @returns {Response} Yêu cầu phải có điều kiện tiên quyết
     */
    static PreconditionRequired = message => new Response(message, 428)

    /**
     * @param {string} message
     * @returns {Response} Khách hàng đã gửi quá nhiều yêu cầu trong một khoảng thời gian
     */
    static TooManyRequests = message => new Response(message, 429)

    /**
     * @param {string} message
     * @returns {Response} Trường header của yêu cầu quá lớn để máy chủ chấp nhận
     */
    static RequestHeaderFieldsTooLarge = message => new Response(message, 431)



    /**
     * @param {string} message
     * @returns {Response} Server gặp lỗi ngưng hoạt động
     */
    static InternalServerError = message => new Response(message, 500)

    /**
     * @param {string} message
     * @returns {Response} Không hỗ trợ tính năng theo yêu cầu
     */
    static NotImplemented = message => new Response(message, 501)

    /**
     * @param {string} message
     * @returns {Response} Phản hồi không hợp lệ
     */
    static BadGateway = message => new Response(message, 502)

    /**
     * @param {string} message
     * @returns {Response} Tạm thời không thể xử lý yêu cầu do quá tải hoặc bảo trì
     */
    static ServiceUnavailable = message => new Response(message, 503)

    /**
     * @param {string} message
     * @returns {Response} Server gateway không nhận được phản hồi từ server backend trong thời gian cho phép
     */
    static GatewayTimeout = message => new Response(message, 504)
}

module.exports = ErrorType
module.exports.Main = Response
