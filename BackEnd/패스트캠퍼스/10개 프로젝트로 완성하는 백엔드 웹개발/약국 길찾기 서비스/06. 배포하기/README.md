# 배포하기

## 도커 컴포즈 작성

 - `./Dockerfile`
```dockerfile
FROM openjdk:11
ARG JAR_FILE=build/libs/app.jar
COPY ${JAR_FILE} ./app.jar
ENV TZ=Asia/Seoul
ENTRYPOINT ["java", "-jar", "./app.jar"]
```

 - `docker-compose.yml`
    - Reids와 Database, Web Application 서비스를 설정ㅈ한다.
    - Docker Compose안에 서비스 내부에 image 옵션은 빌드 후 생성된 이미지가 해당 이름으로 태깅된다.
```yml
version: "3.8"
services:
  # Redis
  pharmacy-recommendation-redis:
    container_name: pharmacy-recommendation-redis
    build:
      dockerfile: Dockerfile
      context: ./redis
    image: zcx5674/pharmacy-recommendation-redis
    ports:
      - "6379:6379"

  # Database
  pharmacy-recommendation-database:
    container_name: pharmacy-recommendation-database
    build:
      dockerfile: Dockerfile
      context: ./database
    image: zcx5674/pharmacy-recommendation-database
    environment:
      - MARIADB_DATABASE=pharmacy-recommendation
      - MARIADB_ROOT_PASSWORD=${SPRING_DATASOURCE_PASSWORD}
    volumes:
      - ./database/config:/etc/mysql/conf.d
      - ./database/init:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"

  # Web Application
  pharmacy-recommendation-app:
    container_name: pharmacy-recommendation-app
    build: .
    depends_on:
      - pharmacy-recommendation-database
      - pharmacy-recommendation-redis
    image: zcx5674/pharmacy-recommendation-app
    environment:
      - SPRING_DATASOURCE_USERNAME=${SPRING_DATASOURCE_USERNAME}
      - SPRING_DATASOURCE_PASSWORD=${SPRING_DATASOURCE_PASSWORD}
      - SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE}
      - KAKAO_REST_API_KEY=${KAKAO_REST_API_KEY}
    ports:
      - "80:8080"
    restart: always
```
<br/>

 - `docker-compose.yml 내용을 CLI로 입력시`
```bash
docker build -t zcx5674/pharmacy-recommendation-app .

docker run -d \
  --name pharmacy-recommendation-app \
  -e SPRING_DATASOURCE_USERNAME=${SPRING_DATASOURCE_USERNAME} \
  -e SPRING_DATASOURCE_PASSWORD=${SPRING_DATASOURCE_PASSWORD} \
  -e SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE} \
  -e KAKAO_REST_API_KEY=${KAKAO_REST_API_KEY} \
  -p 80:8080 \
  --restart always \
  zcx5674/pharmacy-recommendation-app
```
<br/>

 - `application.yml`
    - 도커 컴포즈에 명시되어 있는 컨테이너들은 각각 같은 네트워크에서 형성된다.
    - 이러한 컨테이너들끼리 통신하기 위해서는 서비스명을 통해서 통신할 수 있다.
    - DB URL이나 Redis Host를 서비스명으로 변경한다.
```yml
spring:
  config:
    activate:
      on-profile: prod
  datasource:
    driver-class-name: org.mariadb.jdbc.Driver
    url: jdbc:mariadb://pharmacy-recommendation-database:3306/pharmacy-recommendation
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
  redis:
    host: pharmacy-recommendation-redis
    port: 6379
  jpa:
    hibernate:
      ddl-auto: validate # prod 배포시 validate
    show-sql: true

pharmacy:
  recommendation:
    base:
      url: http://${EC2_URL}/dir/
```
<br/>

## AWS 소개 및 EC2 생성

 - 탄력적 IP는 1대만 무료이다.
    - 만약, 탄력적 IP를 생성하고 연결하지 않으면 요금이 과금된다.
    - 탄력적 IP를 생성하고, EC2 인스턴스가 종료되어 있으면 요금이 과금된다.
```
1. EC2 인스턴스
 - 애플리케이션 및 OS 이미지: Amazon Linux2 AMI
 - 인스턴스 유형: t2.micro
 - 태그: (Name: pharmacy-recommendation)
 - 키 페어 생성: RSA 유형, pem 파일

2. 탄력적 IP
 - 탄력적 IP 생성
 - 탄력적 IP 주소 연결 -> EC2 인스턴스

3. 보안 그룹 설정
 - 인바운드: 외부에서 인스턴스 내부로 접속
 - 아웃바운드: 인스턴스 내부에서 외부 접속
```
<br/>

## 최종 배포하기

 - `기본 라이브러리 설치`
```bash
# Git 설치
$ sudo yum update -y
$ sudo yum install git -y
$ git version

# 도커 & 도커 컴포즈 설치
$ sudo yum install docker
$ docker -v
$ sudo curl -L https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose

# 도커 시작
$ sudo systemctl start docker

$ sudo chmod +x /usr/local/bin/docker-compose    
$ sudo chmod 666 /var/run/docker.sock
$ docker-compose -v

# JDK 설치
# aws coreetto 다운로드
$ sudo curl -L https://corretto.aws/downloads/latest/amazon-corretto-11-x64-linux-jdk.rpm -o jdk11.rpm

# jdk11 설치
$ sudo yum localinstall jdk11.rpm
```
<br/>

 - `소스 코드 내려받고 애플리케이션 실행`
```bash
# 소스 코드 내려받기
$ git clone https://github.com/WonYong-Jang/Pharmacy-Recommendation.git

# DB 계정 정보나 외부에 노출되면 안되는 값들을 관리하는 환경변수 파일 생성
# 도커 컨테이너를 실행할 때 .env 파일을 전달한다.
$ vi .env
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=1234

# 테스트 케이스 제외하고, jar 파일 빌드만 진행
$ ./gradlew clean build -x test

# Docker Compose를 이용하여 애플리케이션 실행
$ docker-compose up --build
```
