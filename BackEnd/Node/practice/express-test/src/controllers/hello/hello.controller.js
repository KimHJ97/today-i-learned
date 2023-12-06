const httpStatus = require('http-status');
const helloService = require('../../services/hello/hello.service');

// GET 요청
const helloGet = (req, res) => {
    console.log('===== helloGet =====');
    helloService.printHello();
    helloService.printHelloAsync();
    res.status(httpStatus.CREATED).send('Hello Get!');
};

// POST 요청
const helloPost = (req, res) => {
    console.log('===== helloPost =====');
    helloService.printHello();
    helloService.printHelloAsync();
    res.status(httpStatus.CREATE).send('Hello Post!');
}

module.exports = {
    helloGet,
    helloPost
};