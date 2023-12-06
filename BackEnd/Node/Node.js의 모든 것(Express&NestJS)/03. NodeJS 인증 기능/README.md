# NodeJS 인증 기능 구축

## JWT

JWT (JSON Web Token)는 당사자간에 정보를 JSON 개체로 안전하게 전송하기위한 컴팩트하고 독립적인 방식을 정의하는 개방형 표준 (RFC 7519)입니다. 이 정보는 디지털 서명이되어 있으므로 확인하고 신뢰할 수 있습니다.  
 - JWT 토큰 구조
    - Header: 토큰에 대한 메타 데이터를 포함하고 있습니다. ( 타입, 해싱 알고리즘  SHA256, RSA 등)
    - Payload: 유저 정보(issuer), 만료 기간(expiration time), 주제(subject) 등
    - Verify Signature: JWT의 마지막 세그먼트는 토큰이 보낸 사람에 의해 서명되었으며 어떤 식으로든 변경되지 않았는지 확인하는 데 사용되는 서명입니다. 서명은 헤더 및 페이로드 세그먼트, 서명 알고리즘, 비밀 또는 공개 키를 사용하여 생성됩니다.

<br/>

## JWT를 이용한 간단한 인증 시스템 구현

 - `Express 애플리케이션 생성`
    - dotenv: 환경 변수 생성 모듈
    - jsonwebtoken: 토큰 생성 모듈
```Bash
$ npm init -y

$ npm install dotenv express jsonwebtoken nodemon
```

<br/>

 - `AccessToken 구현`
```javascript
const express = require('express');
const jwt = require('jsonwebtoken');

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

app.post('/login', (req, res) => {
    const username = req.body.username;
    const user = { name: username }

    // JWT를 이용해서 토큰 생성하기
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.json({ accessToken: accessToken });
});

app.get('/posts', authMiddleware, (req, res) => {
    res.json(posts);
});

// 인증 미들웨어(JWT 토큰 인증)
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

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}..`);
});
```

<br/>

## RefreshToken

AccessToken 하나만을 이용하는 경우 해당 토큰이 탈취되면 악의적인 사용자가 계속해서 요청을 보낼 수 있다.  
만약, 유효시간을 짧게 하면 자주 재로그인을 수행해야 하며, 유효시간을 너무 길게하면 토큰이 탈취당하면 긴 유효시간이 끝날 때 까지 계속 탈취당한 토큰을 사용 가능하게 된다.  

위와 같은 문제점을 보완하기 위해 RefreshToken이 등장하게 됩니다.  
AccessToken의 유효 시간을 짧게 하고, RefreshToken의 유효 시간을 길게 설정하고, AccessToken의 유효 시간이 다 지나면 RefreshToken을 이용해서 새로운 AccessToken을 발급해준다.  
 - AccessToken: 리소스에 접근하기 위해서 사용되는 토큰입니다.
 - RefreshToken: 기존에 클라이언트가 가지고 있던 Access Token이 만료되었을 때 Access Token을 새로 발급받기 위해 사용합니다.

```
1. 사용자가 로그인 시도를 합니다. 
 - 서버에서는 로그인 회원을 DB에서 찾아봅니다. 또한 비밀번호가 맞는지도 확인 합니다.

2. 로그인이 완료되면 Access Token과 함께 Refresh Token이 발급됩니다.
 - 회원 DB에 일반적으로 Refresh Token을 저장합니다.

3. 사용자가 Refresh Token을 안전한 장소에 보관한 후, 서버에 요청을 보낼 때 Access Token을 헤더에 실어 요청을 보냅니다. 

4. Access Token을 서버에서 검증하게되며 맞는 Token이라면 요청한 데이터를 보내줍니다. 

5. Access Token의 유효기간이 만료되었을 때 요청을 보냅니다.

6. Access Token의 유효기간이 만료되었기 때문에 권한 없음 에러를 보냅니다.

7. 사용자는 Refresh Token을 서버로 보내며 Access Token 발급 요청을 합니다. 

8. 서버에서는 사용자가 보낸 Refresh Token과 DB에 저장되어 있는 Refresh Token을 비교합니다.
 - RefreshToken이 동일하고 유효기간도 지나지 않았다면 Access Token을 새로 발급합니다. 
```

<br/>

 - `RefreshToken 만들기`
```javascript
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
```

<br/>

 - `RefreshToken으로 AccessToken 만들기`
    - 쿠키를 확인하기 위해서는 req.cookies를 이용한다.
    - req.cookies로 쿠키를 받기 위해서는 cookie parser를 등록해야 한다.
        - npm install cookie-parser
```javascript
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());

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
```

