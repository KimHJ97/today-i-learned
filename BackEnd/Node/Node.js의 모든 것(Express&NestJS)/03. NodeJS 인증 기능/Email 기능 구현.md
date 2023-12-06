# Email 기능 구현

## 구글 이메일 앱 비밀번호 생성

구글 이메일 전송을 이용할 경우 보안 문제상 계정 ID와 PASSWORD를 보내는 대신에 앱 비밀번호를 보내야한다.  
 - 공식 사이트(구글 Security): https://myaccount.google.com/security
    - Signing in to Google > 2-Step Verification 설정
    - Signing in to Google > App password 생성(Mail, OS 지정)

<br/>

## SMPT(Simple Mail Transfer Protocol)

간이 전자 우편 전송 프로토콜(Simple Mail Transfer Protocol, SMTP)은 인터넷에서 이메일을 보내기 위해 이용되는 프로토콜이다. 사용하는 TCP 포트번호는 25번이다.
 - 메일을 작성해서 보내면 일단 그 메일은 SMTP 서버로 전송됩니다. (지금은 Gmail을 이용했으니 Gmail SMTP 서버로 보내집니다.) (SMTP 프로토콜 사용)
 - Gmail SMTP 서버에 접근을 하기 위해서 구글 아이디와 새로 생성한 앱 비밀번호를 이용해서 자격증명을 했습니다. 
 - 이 Gmail SMTP 서버는 해당 메일을 받는 사람의 메일 서버로 보내게 되는데 그러기 때문에 Outgoing MailServer 라고도 부릅니다.  
 - 받는 사람의 이메일이 yahoo 라면 yahoo 메일 서버로 이메일이 전송이 되게 됩니다. (SMTP 프로토콜 사용)
 - 상대방이 Yahoo 서버 메일 보관함에서 메일을 가져가게 됩니다. (여기는 SMTP가 아닙니다.)
- 가져갈 때는 POP(post office protocol), IMAP(internet message access protocol), HTTP 중 하나를 사용하게 됩니다.

<br/>

## 이메일 기능 구현

 - `라이브러리 설치`
```Bash
$ npm install nodemailer
```

<br/>

 - `메일 템플릿 만들기`
```javascript
// welcome_template.js
const welcome = (data) => {
    return `    
    <!DOCTYPE html>
    <html>
        <head>
            <title>반갑습니다.</title>
        </head>

        <body>
            <div>감사합니다.</div>
        </body>
    </html>
    `
}

module.exports = welcome;
```

<br/>

 - `메일 전송 기능 구현`
    - nodemailer 라이브러리를 이용하여 메일 전송을 구현할 수 있다.
    - nodemailer의 createTransport() 메서드를 이용해서 메일 전송 객체를 생성할 수 있다. 이때, 메일 서비스와 계정과 비밀번호를 넣어준다.
    - 만들어진 메일 전송 객체(transporter)의 sendEmail() 메서드를 이용하여 메일을 전송할 수 있다.
```javascript
const mailer = require('nodemailer');
const  goodbye  = require('./goodbye_template');
const  welcome  = require('./welcome_template');

// 메일 전송 데이터 가져오기
const getEmailData = (to, name, template) => {
    let data = null;

    switch (template) {
        case "welcome":
            data = {
                from: '보내는 사람 이름 <userId@gmail.com>',
                to,
                subject: `Hello ${name}`,
                html: welcome()
            }
            break;

        case "goodbye":
            data = {
                from: '보내는 사람 이름 <userId@gmail.com>',
                to,
                subject: `Goodbye ${name}`,
                html: goodbye()
            }
            break;
        default:
            data;
    }

    return data;
}

// 메일 전송
const sendMail = (to, name, type) => {
    const transporter = mailer.createTransporter({
        service: 'Gmail',
        auth: {
            user: 'test@google.com',
            pass: process.env.EMAIL_PASSWORD
        }
    })

    const mail = getEmailData(to, name, type);

    transporter.sendEmail(mail, (error, response) => {
        if (error) {
            console.log(error);
        } else {
            console.log('email sent successfully');
        }

        transporter.close();
    })
}


module.exports = sendMail;
```

<br/>

 - `메일 전송 기능 이용하기`
    - 만든 메일 전송 기능을 회원가입 성공시 메일을 보내도록한다.
```javascript
const express = require('express');
const sendMail = require('../mail/mail');
const User = require('../models/users.model');
const usersRouter = express.Router();

usersRouter.post('/signup', async (req, res) => {
    const user = new User(req.body);

    try {
        // 유저 정보 저장
        await user.save();

        // 이메일 보내기 
        sendMail('test@example.com', '홍길동', 'welcome');
        res.redirect('/login');
    } catch (error) {
        console.error(error);
    }
})
```

