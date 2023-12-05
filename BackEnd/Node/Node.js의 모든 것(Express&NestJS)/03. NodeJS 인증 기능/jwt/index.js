const cookieParser = require('cookie-parser');
const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// .env 파일의 환경 변수를 로드
dotenv.config();

const app = express();
const posts = [
    {
        username: 'John',
        title: 'Post 1'
    },
    {
        username: 'Han',
        title: 'Post 2'
    }
]

app.use(express.json());
app.use(cookieParser());

let refreshTokens = [];
app.post('/login', (req, res) => {
    const username = req.body.username;
    const user = { name: username }

    // JWT를 이용해서 토큰 생성하기
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'30s'});
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn:'1d'});
    refreshTokens.push(refreshToken); // DB에 저장한다고 가정한다.

    // RefreshToken은 httpOnly 속성을 가진 쿠키로 저장한다.
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken: accessToken });
});

app.get('/posts', authMiddleware, (req, res) => {
    res.json(posts);
});

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);

        req.user = user;
        next();
    });
}

// 토큰 재발급 요청
app.get('/refresh', (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);

    // 쿠키에 담긴 JWT 토큰(RefreshToken)을 가져와 DB에 존재하는지 검증한다.
    const refreshToken = cookies.jwt;
    if (!refreshTokens.includes(refreshToken)) {
        return res.sendStatus(403);
    }

    // RefreshToken 유효성 검증
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        
        const accessToken = jwt.sign({ name: user.name }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '30s'});
        res.json({ accessToken: accessToken });
    });
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}..`);
});