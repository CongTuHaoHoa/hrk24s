const { Server } = require('socket.io')
const colors = require("colors");

class Socket
{
    static #_server = null

    static start = server =>
    {
        if (!this.#_server)
        {
            this.#_server = new Server(server, { cors: { origin: "*" }})

            this.#_server.on('connection', socket =>
            {
                console.log(colors.green(`Client ${ colors.bold.italic.magenta(`<${ socket.id }>`) } đã kết nối...`))

                const join = room =>
                {
                    socket.join(room)
                    console.log(colors.green(`Client ${ colors.bold.italic.magenta(`<${ socket.id }>`) } đã vào room ${ colors.yellow(`<${ room }>`) }`))
                }
                const leave = room =>
                {
                    socket.leave(room)
                    console.log(colors.red(`Client ${ colors.bold.italic.magenta(`<${ socket.id }>`) } đã rời room ${ colors.yellow(`<${ room }>`) }`))
                }

                const disconnect = () =>
                {
                    console.log(colors.red(`Client ${ colors.bold.italic.magenta(`<${ socket.id }>`) } đã ngắt kết nối...`))
                }

                socket.on('join', join)
                socket.on('leave', leave)
                socket.on('disconnect', disconnect)
            })

            console.log(colors.green('Kết nối Socket thành công !!'))
        }

        else console.log(colors.red('Kết nối Socket thất bại !!'))
    }

    static send = (event, to = false) =>
    {
        if (this.#_server)
        {
            if (to)
            {
                this.#_server.to(to.toString()).emit(event)
                console.log(colors.green(`Gửi ${ colors.cyan(`"${ event }"`) } đến ${ colors.bold.italic.yellow(`<${ to }>`) }`))
            }
            else
            {
                this.#_server.emit(event)
                console.log(colors.green(`Gửi ${ colors.cyan(`"${ event }"`) } đến ${ colors.bold.italic.yellow(`toàn bộ người dùng`) }`))
            }
        }
    }
}

module.exports = Socket