const express = require('express');
const path = require('path');
const { default: mongoose } = require('mongoose');

const config = require('config');
const serverConfig = config.get('server');

const mainRouter = require('./routes/main.router');
const usersRouter = require('./routes/users.router');

const app = express();

const PORT = serverConfig.port;


require('dotenv').config();

app.use(cookieSession({
    name: 'cookie-session-name',
    keys: [process.env.COOKIE_ENCRYPTION_KEY]
}));

// register regenerate & save after the cookieSession middleware initialization
app.use(function (request, response, next) {
    if (request.session && !request.session.regenerate) {
        request.session.regenerate = (cb) => {
            cb()
        }
    }
    if (request.session && !request.session.save) {
        request.session.save = (cb) => {
            cb()
        }
    }
    next()
})

// 정적 파일 경로 지정
app.use('/static', express.static(path.join(__dirname, 'public')));

// passport 미들웨어 구성 + 전략 경로 지정
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');

// Body 파서 등록(JSON, FormData)
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// View Template Engine 설정
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// MongoDB 커넥션
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected..');
    })
    .catch((err) => {
        console.log(err);
    });

// Route 등록
app.use('/', mainRouter);
app.use('/auth', usersRouter);

// 서버 실행
app.listen(PORT, () => {
    console.log(`Listening on ${PORT}...`);
});