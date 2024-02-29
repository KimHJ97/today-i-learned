const express = require('express')
const app = express();
const PORT = 3000;

const POD_IP = process.env.POD_IP
const NODE_NAME = process.env.NODE_NAME
const NAMESPACE = process.env.NAMESPACE

app.get('/sky', (req, res) => {
    res.render('sky', { podIp: POD_IP, nodeName: NODE_NAME, namespace: NAMESPACE })
});

app.get('/hello', (req, res) => {
    res.json("Hello, I'm Sky.")
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
});
