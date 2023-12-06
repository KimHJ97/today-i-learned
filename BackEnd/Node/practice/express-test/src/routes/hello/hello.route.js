const express = require('express');
const helloController = require('../../controllers/hello/hello.controller')

const router = express.Router();

router.route('/')
    .get(helloController.helloGet)
    .post(helloController.helloPost);

module.exports = router;