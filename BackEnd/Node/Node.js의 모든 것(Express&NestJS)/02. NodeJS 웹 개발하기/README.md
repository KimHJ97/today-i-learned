# Node.js로 웹 개발하기

## 웹 서버란?

웹 서버는 텍스트, 이미지, 비디오 및 애플리케이션 데이터와 같은 웹 사이트 콘텐츠를 요청하는 클라이언트에 전달합니다. 가장 일반적인 유형의 클라이언트는 사용자가 링크를 클릭하거나 브라우저에 표시된 페이지에서 문서를 다운로드할 때 웹사이트에서 데이터를 요청하는 웹 브라우저 프로그램입니다.  

웹 서버는 HTTP(Hypertext Transfer Protocol)를 사용하여 웹 브라우저와 통신합니다. 대부분의 웹 페이지 콘텐츠는 HTML(Hypertext Markup Language)로 인코딩됩니다. 콘텐츠는 정적(예: 텍스트 및 이미지) 또는 동적(예: 계산된 가격 또는 고객이 구매하도록 표시한 항목 목록)일 수 있습니다. 동적 콘텐츠를 제공하기 위해 대부분의 웹 서버는 비즈니스 논리를 통신으로 인코딩하는 서버 측 스크립팅 언어를 지원합니다. 일반적으로 지원되는 언어에는 ASP(Active Server Pages), Javascript, PHP, Python 및 Ruby가 있습니다.  

<br/>

## HTTP Requests

### HTTP란? (Hypertext Transfer Protocol)

HTTP는 HTML 문서와 같은 리소스들을 가져올 수 있도록 해주는 프로토콜(약속)입니다. HTTP는 웹에서 이루어지는 모든 데이터 교환의 기초이며, 클라이언트-서버 프로토콜이기도 합니다.  
클라이언트-서버 프로토콜이란 (보통 웹브라우저인) 수신자 측에 의해 요청이 초기화되는 프로토콜을 의미합니다.  

 - `HTTP Method`
    - HTTP 메서드는 수행할 작업의 종류를 나타내기 위해 서버에 보내는 메시지입니다.
    - 이러한 방법을 사용하면 브라우저와 서버 간의 더 풍부한 통신이 가능합니다.
    - GET Method: GET 메소드는 URL 매개변수를 사용하여 서버에서 데이터를 요청합니다. 웹에서 가장 일반적으로 사용되는 HTTP 방법입니다. GET 요청 매개변수는 이름-값 쌍으로 형식이 지정됩니다.
    - POST Method: POST 메서드는 리소스(종종 데이터베이스 레코드)를 변경하기 위해 서버에 데이터를 보냅니다. POST 데이터는 사용자가 볼 수 없는 요청 본문으로 전송됩니다
 - `HTTP Status Code`
    - HTTP 상태 코드는 브라우저 요청에 따라 서버에서 반환되는 코드입니다.
    - 이 코드 번호는 요청이 성공했는지 또는 오류가 있었는지 나타냅니다.
    - 오류 상태 코드는 또한 찾을 수 없음, 액세스할 수 없음 또는 이동됨과 같은 오류 유형을 지정합니다.

<br/>

## 웹 서버 생성하기

Node JS는 기본적으로 http 모듈을 제공하는데, 해당 모듈을 이용하여 웹 서버를 만들 수 있습니다.  

 - `웹 서버 만들기`
    - createServer(): EventEmitter 기반으로 만들어진 server 객체를 만든다.
    - server 객체는 컴퓨터의 포트를 수신하고 요청이 만들어질 때마다 requestListener라는 함수를 실행할 수 있다.
```javascript
const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.end('Hello World!');
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}..`);
})
```

<br/>

 - `HTTP Routing 및 HTTP Method`
    - 라우팅을 위해서 req 객체의 url 속성을 확인할 수 있다.
    - HTTP Method를 위해서 req 객체의 method 속성을 확인할 수 있다.
    - 요청시 Body의 JSON 형식의 데이터를 받기 위해서는 toString()으로 변환하고, JSON.parse()로 Javascript Object로 변환해주어야 한다.
    - 응답시 JSON 형식의 데이터를 반환하기 위해서는 JSON.stringify()로 변환해주어야 한다.
```javascript
const server = http.createServer((req, res) => {

    if(req.method === 'POST' && req.url === '/home') {
        req.on('data', (data) => {
            const stringfiedData = data.toString();
            let data = JSON.parse(stringfiedData);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
        })
    }

    if (req.url === '/home') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            name: "홍길동",
            age: 20
        }));
    } else if (req.url === '/about') {
        res.setHeader('Content-Type', 'text/html');
        res.write('<html>');
        res.write('<body>');
        res.write('<h1>About Page</h1>');
        res.write('</body>');
        res.write('</html>');
    } else {
        res.statusCode = 404;
        res.end();
    }
})
```
