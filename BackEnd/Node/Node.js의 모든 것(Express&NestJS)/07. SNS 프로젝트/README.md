# SNS 서비스 프로젝트

## Server Cheat Sheet

 - `서버 실행`
```javascript
const express = require('express');
const app = express();
const path = require('path');

app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: false })); // Query 파라미터 파싱
app.use(express.static(path.join(__dirname, 'public'))); // 정적 폴더 경로 설정

// View Template Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const port = 3000;
app.listen(port, () => {
    console.log(`Listening on ${port}`);
})
```
<br/>

 - `라우터 설정`
```javascript
const mainRouter = require('./routes/main.router');
const usersRouter = require('./routes/users.router');
const postsRouter = require('./routes/posts.router');
const commentsRouter = require('./routes/comments.router');
const profileRouter = require('./routes/profile.router');
const likeRouter = require('./routes/likes.router');
const friendsRouter = require('./routes/friends.router');

app.use('/', mainRouter);
app.use('/auth', usersRouter);
app.use('/posts', postsRouter);
app.use('/posts/:id/comments', commentsRouter);
app.use('/profile/:id', profileRouter);
app.use('/friends', friendsRouter);
app.use(likeRouter);
```
<br/>

### 파일 다운로드(Multer)

 - https://www.npmjs.com/package/multer

#### 기본 예제

 - `Client`
    - enctype을 "multipart/form-data"로 정의한다.
```html
<form action="/profile" method="post" enctype="multipart/form-data">
  <input type="file" name="avatar" />
</form>
```
<br/>

 - `Server`
    - 단일 파일: upload.single('filename')
    - 파일 여러개: upload.array('filename', number)
    - 여러 종류 파일: upload.fields([{ name: 'filename', maxCount: 1}, { name: 'filename2', maxCount: 2}])
```javascript
const express = require('express')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

const app = express()

// 단일 파일 업로드
app.post('/profile', upload.single('avatar'), function (req, res, next) {
    console.log(req.file);
    console.log(req.body);
})

// 여러개 파일 업로드
app.post('/photos/upload', upload.array('photos', 12), function (req, res, next) {
    console.log(req.files);
    console.log(req.body);
})

// 여러 종류 파일 업로드
const cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])
app.post('/cool-profile', cpUpload, function (req, res, next) {
    console.log(req.files['avatar'][0]); // File
    console.log(req.files['gallery']); // Array
})
```
<br/>

#### 저장 경로 지정

DiskStorage를 이용하여 저장 경로를 지정할 수 있다.  

 - destination에서 요청시 저장될 위치를 지정할 수 있다.
    - cb는 콜백 메서드로 첫 번째 인자는 예외가 발생한 경우 예외를 넣어주고, 두 번째 인자는 저장 폴더 경로를 지정해준다.
 - filename에서 저장될 파일명을 지정할 수 있다.
```javascript
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/my-uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage })
```
<br/>

#### 파일 필터

파일 필터를이용하여 어떤 파일을 업로드해야 하고, 어떤 파일을 건너뛰어야 하는지 제어할 수 있다.  

```javascript
function  fileFilter  ( req ,  file ,  cb )  { 

    // 파일 거부시 false 전달
    cb(null,  false) 

    // 파일 수락시 true 전달
    cb(null,  true)

    // 문제가 발생하면 예외 전달
    cb(new Error('I don\'t have a clue!'))
}
```
<br/>

#### 예외 처리

오류가 발생하면 Multer는 오류를 Express에 위임한다.  
Multer에서 오류를 잡으려면 미들웨어 함수를 직접 호출할 수도 있다.  

```javascript
const multer = require('multer')
const upload = multer().single('avatar')

app.post('/profile', function (req, res) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // MulterError 핸들링
    } else if (err) {
      // Unknown Error 핸들링
    }

  })
})
```
<br/>

#### 활용 예제

```javascript
const multer = require('multer');
const { checkAuthenticated } = require('../middleware/auth');
const router = express.Router();
const Post = require('../models/posts.model');
const path = require('path');

// DiskStorage 설정
const storageEngine = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname, '../public/assets/images'));
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
})

const upload = multer({ storage: storageEngine }).single('image');

router.post('/', checkAuthenticated, upload, (req, res, next) => {
    let desc = req.body.desc;
    let image = req.file ? req.file.filename : "";

    Post.create({
        image: image,
        description: desc,
        author: {
            id: req.user._id,
            username: req.user.username
        },
    }, (err, _) => {
        if (err) {
            req.flash('error', '포스트 생성 실패');
            res.redirect("back");

            // next(err);
        } else {
            req.flash('success', '포스트 생성 성공');
            res.redirect("back");
        }
    })

})
```
<br/>

### 메서드 오버라이드

method-override는 Express.js에서 HTTP 요청 메서드를 재정의(override)할 수 있도록 해주는 미들웨어입니다. 이 미들웨어를 사용하면 클라이언트가 지원하지 않는 HTTP 메서드(PUT, DELETE 등)를 사용할 수 있게 됩니다. 예를 들어, HTML 폼은 기본적으로 GET과 POST만 지원하기 때문에 PUT이나 DELETE 요청을 처리할 수 없습니다. method-override를 사용하면 이를 우회할 수 있습니다.  

 - https://expressjs.com/en/resources/middleware/method-override.html
```bash
npm install method-override
```
<br/>

 - `서버`
```javascript
const express = require('express');
const methodOverride = require('method-override');
const app = express();

// 사용 예시 1: query parameter로 method override
app.use(methodOverride('_method'));

// 사용 예시 2: header로 method override
app.use(methodOverride('X-HTTP-Method-Override'));

app.post('/resource', (req, res) => {
  res.send('POST request to /resource');
});

app.put('/resource', (req, res) => {
  res.send('PUT request to /resource');
});

app.delete('/resource', (req, res) => {
  res.send('DELETE request to /resource');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```
<br/>

 - `클라이언트`
    - 클라이언트에서 POST 방식으로 보내되, 쿼리파라미터로 _method에 HTTP Method를 지정할 수 있다.
    - HTML Form은 GET, POST만 지원하지만 해당 방식을 통해 전송하면 서버에서는 클라이언트로부터 받은 요청에서 특정 파라미터나 헤더를 확인하고, 그 값에 따라 요청 메서드를 재정의하게 된다.
```html
<form action="/resource?_method=PUT" method="POST">
  <input type="submit" value="PUT request">
</form>

<form action="/resource?_method=DELETE" method="POST">
  <input type="submit" value="DELETE request">
</form>
```
<br/>

### 커넥트 플래시

connect-flash는 Express.js 애플리케이션에서 일시적인 메시지를 저장하고 표시하는 데 사용되는 미들웨어입니다. 주로 사용자에게 피드백 메시지를 전달하는 데 사용되며, 주로 세션 기반의 애플리케이션에서 사용됩니다. 이 미들웨어는 로그인 오류, 성공적인 폼 제출, 경고 등과 같은 상황에서 메시지를 전달하는 데 유용합니다.  
 - 플래시 메시지 저장: 한 요청 동안 유지되고 다음 요청에서 삭제되는 일시적인 메시지를 저장합니다.
 - 세션 통합: 세션을 통해 메시지를 유지하므로, 사용자가 리다이렉션된 후에도 메시지를 볼 수 있습니다.
 - https://www.npmjs.com/package/connect-flash

```bash
npm install connect-flash express-session
```
<br/>

 - `미들웨어 등록`
```javascript
var flash = require('connect-flash');
var app = express();
 
app.configure(function() {
  app.use(express.cookieParser('keyboard cat'));
  app.use(express.session({ cookie: { maxAge: 60000 }}));
  app.use(flash());
});
```
<br/>

 - `connect-flash 사용`
    - req.flash() 메서드로 요청 동안에만 유지되는 메시지를 저장한다.
    - 리다이렉트로 다른 요청에서 req.flash()로 플래시 메시지를 가져와 사용한다.
```javascript
app.get('/flash', function(req, res){
  req.flash('info', 'Flash is back!')
  res.redirect('/');
});
 
app.get('/', function(req, res){
  res.render('index', { messages: req.flash('info') });
});
```
<br/>

#### 커넥트 플래시 특징

 - connect-flash는 세션에 메시지를 저장합니다. 이 메시지는 다음 요청 시에만 유지되며, 그 후에는 자동으로 삭제됩니다.
 - req.flash('key', 'message') 메서드를 사용하여 메시지를 설정하고, req.flash('key')를 사용하여 메시지를 가져올 수 있습니다.
 - 플래시 메시지는 일회성이므로, 한 번 읽은 후에는 자동으로 삭제됩니다.
 - __활용 예시__
    - 로그인 및 로그아웃: 성공 또는 실패 메시지 표시
    - 폼 검증: 폼 제출 후 성공 또는 오류 메시지 표시
    - 경고 메시지: 사용자가 특정 작업을 완료했을 때 경고 메시지 표시
```
★ 전체적인 흐름
1. 사용자가 특정 작업을 수행합니다.
2. 서버 측에서 req.flash를 사용하여 메시지를 설정합니다.
3. 서버는 리다이렉션을 수행합니다.
4. 클라이언트가 리다이렉션된 페이지에서 플래시 메시지를 표시합니다.
5. 메시지는 표시된 후 세션에서 삭제됩니다.
```
<br/>

