# Passport 모듈

Express Passport는 Node.js의 Express 프레임워크를 사용하는 웹 애플리케이션에서 사용되는 인증 및 세션 관리를 쉽게 구현할 수 있게 해주는 모듈입니다. 이 모듈은 Passport.js라는 모듈을 기반으로 하며, Passport.js는 다양한 인증 전략을 지원하는 유연하고 강력한 인증 미들웨어입니다.  

Passport.js는 여러 인증 방식을 지원하는데, 예를 들면 로컬 인증, 소셜 미디어 인증 (Facebook, Google, Twitter 등), OAuth, OpenID 등이 있습니다. Express Passport는 이러한 Passport.js의 기능을 Express 애플리케이션에서 사용할 수 있도록 쉽게 통합하고 제공합니다.  
 - 공식 사이트: https://www.passportjs.org/

<br/>

## 프로젝트 만들기

 - `프로젝트 생성 및 라이브러리 설치`
```Bash
$ npmt init -y
$ npm install dotenv express ejs nodemon body-parser cookie-parser cors mongoose passport passport-local passport-google-oauth20 cookie-session bcryptjs
```

<br/>

 - `모델 만들기`
    - 사용자 정보를 저장해둘 MongoDB의 모델을 만들어준다.
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        minLength: 5
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    kakaoId: {
        type: String,
        unique: true,
        sparse: true
    }
});

const saltRounds = 10;
userSchema.pre('save', function (next) {
    let user = this;
    // 비밀번호가 변경될 때만
    if (user.isModified('password')) {
        // salt를 생성합니다.
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
})


userSchema.methods.comparePassword = function (plainPassword, cb) {
    // bcrypt compare 비교 
    // plain password  => client , this.password => 데이터베이스에 있는 비밀번호
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    })
}

const User = mongoose.model('User', userSchema);

module.exports = User;
```

<br/>

 - `패스포트 전략 구현`
    - 기본적으로 패스포트는 username와 password 필드를 사용한다.
    - 구현하는 전략에서 username과 password 필드를 지정하고, 내부적으로 입력으로 받은 사용자를 조회하고, 비밀번호를 검증하는 코드를 작성한다.
```javascript
const passport = require('passport');
const User = require('../models/users.model');
const LocalStrategy = require('passport-local').Strategy;

// req.login(user) 호출시 처리
passport.serializeUser((user, done) => {
    done(null, user.id);
})

// client에서 session 정보를 가지고 요청시 처리
passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => {
            done(null, user);
        })
})

// passport.authenticate() 호출시 실제 처리
const localStrategyConfig = new LocalStrategy({ usernameField: 'email', passwordField: 'password' },
    (email, password, done) => {

        User.findOne({
            email: email.toLocaleLowerCase()
        }, (err, user) => {
            if (err) return done(err);
            if (!user) {
                return done(null, false, { msg: `Email ${email} not found` });
            }

            user.comparePassword(password, (err, isMatch) => {
                // 에러가 발생한 경우
                if (err) return done(err);

                // 비밀번호가 일치하는 경우
                if (isMatch) {
                    return done(null, user);
                }

                // 비밀번호가 일치하지 않은 경우
                return done(null, false, { msg: 'Invalid email or password.' })
            })
        })
    }
)
passport.use('local', localStrategyConfig);
```

<br/>

 - `로그인 요청 구현`
    - 패스포트의 authenticate() 메서드를 호출하여 인증 처리를 진행하고, 성공시 req의 logIn() 메서드를 호출한다.
```javascript
app.use(cookieSession({
    name: 'cookie-session-name',
    keys: [process.env.COOKIE_ENCRYPTION_KEY]
}))

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

// 패스포트 사용을 시작하고, 쿠키를 사용해서 인증 처리
app.use(passport.initialize());
app.use(passport.session());

// 회원가입 요청
app.post('/signup', async (req, res, next) => {
    const user = new User(req.body);

    try {
        await user.save();
        return res.status(200).json({
            success: true
        })
    } catch (err) {
        console.log(err);
    }
});

// 로그인 요청
app.post('/login', (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        // 패스포트 전략 메서드에서 done()을 호출하는 경우 콜백

        // 에러가 존재하는 경우 예외 발생
        if (err) {
            return next(err);
        }

        // 사용자 정보가 존재하지 않는 경우
        if (!user) {
            console.log('user not found');
            return res.json({ msg: info });
        }

        // 로그인 처리
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            res.redirect('/');
        });
    })(req, res, next) // 미들웨어 내부에 미들웨어를 호출하기 위해 정의
});

// 로그아웃 요청
app.post('/logout', (req, res, next) => {
    req.logOut(function (err) {
        if (err) { return next(err); }
        res.redirect('/login');
    })
});
```

<br/>

 - `인증을 위한 미들웨어`
    - passport에서는 인증된 사용자를 구분하기 위한 isAuthenticated() 메서드를 제공해준다.
    - 미들웨어 함수를 만들고, 라우팅 함수 중간에 인증 미들웨어를 등록한다.
```javascript
// middleware/auth.js
// 로그인 안된 사용자는 로그인 화면으로 이동
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// 로그인된 사용자는 메인 화면으로 이동
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}

module.exports = {
    checkAuthenticated,
    checkNotAuthenticated
}

// server.js
app.get('/', checkAuthenticated, function(req, res, next) {
    res.render('index');
});

app.get('/login', checkNotAuthenticated, function(req, res, next) {
    res.render('login');
});
```

<br/>

### Google OAuth

 - `Google OAuth Key 만들기`
    - 공식 사이트: https://console.cloud.google.com/apis/dashboard
```
1. 구글 API 콘솔
 - 프로젝트 만들기

2. 프로젝트 이동
 - OAuth 동의 화면 -> Create
    - 앱 이름: oauth-test-app
    - 사용자 지원 이메일: hj_kim97@naver.com
    - 개발자 연락처 정보: hj_kim97@naver.com
    - SAVE AND CONTINUE ..
 - 사용자 인증 정보(Credentials)
    - 사용자 인증 정보 만들기 > Create OAuth client ID
        - Application type: Web Application
        - Name: Auth-Test-Client
        - 승인된 리다이렉션 URI: http://localhost:4000/auth/google/callback
        - CREATE .. --> Client ID와 Client Secret 저장
```

<br/>

 - `구글 로그인 화면`
    - 버튼을 누르면 "/auth/google"로 요청되도록 한다.
```html
<a href="/auth/google">
    Sign in with Google
</a>
```

<br/>

 - `route 생성`
    - Google로 로그인하는 것은 OAuth 2.0을 사용하여 구현됩니다. 이 경로는 사용자를 'https://accounts.google.com'의 Google ID 서버로 리디렉션하여 OAuth 2.0 흐름을 시작합니다. 여기에서 Google은 사용자를 인증하고 이 앱에 신원 정보를 공개하는 것에 대한 동의를 얻습니다.
    - Google이 사용자와의 상호작용을 완료하면 사용자는 `GET /oauth2/redirect/accounts.google.com`에서 앱으로 다시 리디렉션됩니다.
```javascript
// 구글 로그인 요청
app.get('/auth/google', passport.authenticate('google'));

// 사용자가 구글 로그인 인증을 하면 콜백 URL로 리다이렉트된다.
// 리다이렉트시 쿼리스트링으로 넘어온 code 값으로 유저 정보를 구글에 요청한다.
app.get('/auth/google/callback', passport.authenticate('google', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login'
}))
```

<br/>

 - `구글 로그인 전략`
```javascript
// src/config/passport.js


const googleStrategyConfig = new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    scope: ['email', 'profile']
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({ googleId: profile.id }, (err, existingUser) => {
        if (err) { return done(err); }

        if (existingUser) {
            return done(null, existingUser);
        } else {
            const user = new User();
            user.email = profile.emails[0].value;
            user.googleId = profile.id;
            user.save((err) => {
                console.log(err);
                if (err) { return done(err); }
                done(null, user);
            })
        }
    })
})

passport.use('google', googleStrategyConfig);
```

<br/>

### 카카오 OAuth

 - `카카오 OAuth Key 만들기`
    - 공식 사이트: https://developers.kakao.com
```
1. 카카오 디벨로퍼 접속
 - 내 애플리케이션 > 애플리케이션 추가
    - 앱 이름: oauth-app 
    - 사업자명: oauth
    - 저장

2. 생성한 앱 접속
 - 플랫폼 > Web
    - 사이트 도메인: http://localhost:4000
 - 카카오 로그인
    - 활성화 설정: ON
    - Redirect URI: http://localhost:4000/auth/kakao/callback
 - 카카오 로그인 > 동의항목
    - 개인정보
        - 닉네임: 필수 동의
        - 프로필 사진: 필수 동의
        - 이메일: 선택 동의
 - 앱 키
    - REST API 키 복사
```

<br/>

 - `모듈 설치`
```Bash
$ npm install passport-kakao
```

<br/>

 - `로그인 화면`
```html
<a href="/auth/kakao">
    Sign in with Kakao
</a>
```

<br/>

 - `라우트 생성`
```javascript
// 카카오 로그인 요청
usersRouter.get('/kakao', passport.authenticate('kakao'));

// 사용자가 카카오 로그인 인증을 하면 콜백 URL로 리다이렉트된다.
// 리다이렉트시 쿼리스트링으로 넘어온 code 값으로 유저 정보를 카카오에 요청한다.
usersRouter.get('/kakao/callback', passport.authenticate('kakao', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login'
}));
```

<br/>

 - `카카오 로그인 전략 생성`
```javascript
const kakaoStrategyConfig = new KakaoStrategy({
    clientID: process.env.KAKAO_CLIENT_ID,
    callbackURL: '/auth/kakao/callback',
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({ kakaoId: profile.id }, (err, existingUser) => {
        if (err) { return done(err); }
        if (existingUser) {
            return done(null, existingUser);
        } else {
            const user = new User();
            user.kakaoId = profile.id;
            user.email = profile._json.kakao_account.email;
            user.save((err) => {
                if (err) { return done(err); }
                done(null, user);
            })
        }
    })
})

passport.use('kakao', kakaoStrategyConfig);
```

