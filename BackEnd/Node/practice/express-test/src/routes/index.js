const express = require('express');
const mysql = require('../config/database')
const helloRoutes = require('./hello/hello.route');

const router = express.Router();

// 상태 확인
router.get('/status', (req, res) => res.send('Status OK'));
router.get('/status/db', async (req, res) => res.send(await mysql.status()));
router.get('/get', (req, res) => res.send('GET OK'));
router.get('/post', (req, res) => res.send('POST OK'));


// 라우팅 정보 설정
router.use('/hello', helloRoutes);


module.exports = router;