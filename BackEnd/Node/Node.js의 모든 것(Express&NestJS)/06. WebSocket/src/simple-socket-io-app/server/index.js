const http = require('http').createServer();

const io = require('socket.io')(http, {
    cors: { origin: '*' }
})
// A emit  => server on   emit =>   A, B 
io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('message', (message) => {
        io.emit('message', `${socket.id.substr(0, 2)} said ${message} `)
    })
})

const port = 8080;
http.listen(port, () => {
    console.log('8080 포트에서 서버 실행');
})