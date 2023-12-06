const express = require('express');
const routes = require('../routes');

const app = express();

// Body Parser 등록(JSON, FormData)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes 등록
app.use(routes);

module.exports = app;