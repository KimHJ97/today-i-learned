const express = require('express');
const path = require('path');
const app = express();
const crypto = require('crypto');

const http = require('http');
const { Server } = require('socket.io');
const { default: mongoose } = require('mongoose');
const { saveMessages, fetchMessages } = require('./utils/messages');
const server = http.createServer(app);
const io = new Server(server);

const publicDirectory = path.join(__dirname, '../public');
app.use(express.static(publicDirectory));
app.use(express.json());

mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://johnahn:qwer1234@express-cluster.kkwx50m.mongodb.net/?retryWrites=true&w=majority')
    .then(() => console.log('디비 연결 성공!'))
    .catch(err => console.error(err))

const randomId = () => crypto.randomBytes(8).toString('hex');

app.post('/session', (req, res) => {
    const data = {
        username: req.body.username,
        userID: randomId()
    }
    res.send(data);
})

io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    const userID = socket.handshake.auth.userID;
    if (!username) {
        return next(new Error('Invalid username'));
    }

    socket.username = username;
    socket.id = userID;

    next();
})



let users = [];
io.on('connection', async socket => {

    let userData = {
        username: socket.username,
        userID: socket.id
    };
    users.push(userData);
    io.emit('users-data', { users })

    // 클라이언트에서 보내온 메시지  A ==> Server  ===> B
    socket.on('message-to-server', (payload) => {
        io.to(payload.to).emit('message-to-client', payload);
        saveMessages(payload);
    })

    // 데이터베이스에서 메시지 가져오기
    socket.on('fetch-messages', ({ receiver }) => {
        fetchMessages(io, socket.id, receiver);
    })

    // 유저가 방에서 나갔을 때 
    socket.on('disconnect', () => {
        users = users.filter(user => user.userID !== socket.id);
        // 사이드바 리스트에서 없애기
        io.emit('users-data', { users })
        // 대화 중이라면 대화창 없애기
        io.emit('user-away', socket.id);
    })
})



const port = 4000;
server.listen(port, () => {
    console.log('Server is up on port ' + port);
})