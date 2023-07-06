const http = require('http');
const os = require('os');
console.log("Test Server Starting...");

var handler = function(req, res) {
    console.log("Received request from " + req.connection.remoteAddress);
    res.writeHead(200);
    res.end("Container Hostname: " + os.hostname() + "\n");
}

var www = http.createServer(handler);
www.listen(8080);