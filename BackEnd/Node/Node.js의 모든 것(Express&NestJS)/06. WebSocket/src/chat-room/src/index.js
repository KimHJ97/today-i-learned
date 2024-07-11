const path = require('path')
const express = require('express')
const http = require('http')
const { Server } = require("socket.io");
const { generateMessage } = require('./utils/messages') //destructuring
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()  // Creates an Express application
const server = http.createServer(app)
const io = new Server(server);

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')  //for static files

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log(`New WebSocket ${socket.id} connected`)

    //1
    socket.on('join', (options, callback) => {
        console.log('options, callback',options, callback);
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        // Adds the socket to the given room or to the list of rooms.
        // https://socket.io/docs/v4/server-api/#socketjoinroom
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin',
            `${user.room} 방에 오신 걸 환영합니다.`))
        socket.broadcast.to(user.room).emit('message',
            generateMessage(`${user.username}가 방에 참여했습니다.`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        // callback();
    })


    //2
    socket.on('sendMessage', (message, callback) => {
        //소켓 ID에서 사용자를 얻기
        const user = getUser(socket.id)

        // 해당 방에 메시지를 내보내기
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback();
    })

    //4
    socket.on('disconnect', () => {
        console.log(`WebSocket ${socket.id} disconnected`)
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username}가 방을 나갔습니다.`))
        }
    })
})


//5
server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})