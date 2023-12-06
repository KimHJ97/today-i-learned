# Express 프로젝트 초안

## 사전 준비

 - MySQL 데이터베이스가 필요하다.
    - DB 설정 정보는 '.env' 설정 파일에서 변경한다.
```
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=1234
```

<br/>

## 프로젝트 실행

 - `라이브러리 설치 및 실행`
```bash
# 라이브러리 설치
$ npm install

# 프로젝트 실행
$ npm run dev
```

<br/>

## 테스트 요청

 - 상태 조회용
    - [GET] http://localhost:3000/status
    - [GET] http://localhost:3000/status/db
    - [GET] http://localhost:3000/get
    - [POST] http://localhost:3000/post
 - Hello 조회용
    - [GET] http://localhost:3000/hello
    - [POST] http://localhost:3000/hello

