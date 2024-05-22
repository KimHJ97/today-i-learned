# 개발 환경 구성하기

## 1. IntelliJ 기본 설정

 - `IntelliJ 플러그인`
    - Lombok, Handlebars, Spock Framework,
    - Key Promoter X, Grep Consol, Rainbow Brackets, GitToolBox
 - `IntelliJ 기본 설정`
    - Build Tools 설정: Gradle 항목 IntelliJ IDEA로 변경
    - Annotation  Processors: Enable 설정

<br/>

## 2. 프로젝트 생성

 - `build.gradle`
```groovy
plugins {
	id 'org.springframework.boot' version '2.6.7'
	id 'io.spring.dependency-management' version '1.0.14.RELEASE'
	id 'java'
}

dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
	implementation 'org.springframework.boot:spring-boot-starter-web'
	compileOnly 'org.projectlombok:lombok'
	runtimeOnly 'org.mariadb.jdbc:mariadb-java-client'
	annotationProcessor 'org.springframework.boot:spring-boot-configuration-processor'
	annotationProcessor 'org.projectlombok:lombok'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```
<br/>

### 2-1. 깃허브 연동

```
1. 깃허브 레포지토리 생성

2. 프로젝트 폴더 이동 후 원격 레포지토리 연동 후 코드 올리기
$ git init
$ git remote add ${원격 레포지토리 URL}
$ git remote -v
$ git add .
$ git commit -m "first commit"
$ git push -u origin main
```

<br/>

### 2-2. 도커를 이용한 싱글 컨테이너 어플리케이션 실습

 - `도커 기본 설명`
    - 컨테이너를 사용하여 응용프로그램을 더 쉽게 만들고, 배포하고 실행할 수 있도록 설계된 도구로 컨테이너 기반의 오픈소스 가상화 플랫폼
    - 일반 컨테이너 개념에서 손쉽게 운송해주는 것처럼 애플리케이션 환경에 구애받지 않고 손쉽게 배포 관리를 할 수 있게 해준다.
    - __이미지__: 코드, 런타임, 시스템 도구, 시스템 라이브러리 및 설정과 같은 응용 프로그램을 실행하는데 필요한 모든 것을 포함하는 패키지
    - __컨테이너__: 도커 이미지를 독립된 공간에서 실행할 수 있게 해주는 기술 (이미지 인스턴스로 프로그램을 실행한다.)
    - __도커 컴포즈__: 멀티 컨테이너 도커 애플리케이션읠 정의하고 실행하는 도구로 여러 개의 도커 컨테이너로부터 이루어진 서비스를 구축 및 네트워크 연결, 실행 순서를 자동으로 관리한다.

<br/>

 - `도커 파일 주요 명령어`
```dockerfile
# 새로운 이미지를 생성할 때 기반으로 사용할 이미지 지정
# jdk 11이 있는 컨테이너 사용
FROM openjdk:11

# 이미지 빌드 시점에서 사용할 변수 지정
ARG JAR_FILE=build/libs/app.jar

# 호스트에 있는 파일이나 디렉토리를 Docker 이미지의 파일 시스템으로 복사
COPY ${JAR_FILE} ./app.jar

# 컨테이너에서 사용할 환경 변수 지정ㅈ
# TimeZone 환경 변수
ENV TZ=Asia/Seoul

# 컨테이너가 실행되었을 때 항상 실행되어야 하는 커맨드 지정
ENTRYPOINT ["java", "-jar", "./app.jar"]
```
<br/>

 - `도커 설치`
    - 도커 데스크톱: https://docs.docker.com/desktop/
    - 도커 허브: https://hub.docker.com/
    - MAC 또는 Window는 도커 데스크톱을 설치한 경우 docker-compose가 함께 설치된다. Linux의 경우 추가 설치가 필요하다.
```bash
# Linux인 경우 docker-compose 설치
sudo curl -L https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose

# 설치 확인
docker -v
docker-compose -v
```
<br/>

 - `빌드 방법`
    - gradle wrapper를 이용하여 jar 파일을 생성한다.
    - 기본 경로는 프로젝트의 'build/libs/*.jar'이다.
```
# 빌드 명령어
$ gradlew build   (Window)
$ ./gradlew build (Linux, Mac)

# build.gradle에서 jar 파일 이름 변경
bootJar {
    archiveFileName = 'app.jar'
}
```
<br/>

 - `도커 명령어`
```bash
# 도커 허브 로그인
docker login

# 빌드 (도커파일 -> 이미지)
docker build -t 아이디/application-project-test .

# 이미지 컨테이너화
docker run 아이디/application-project-test -p 8080:8080
```
<br/>

### 2-3. 개발환경과 운영환경 프로필 나누기

Spring Profile 기능을 이용하여 애플리케이션 설정을 특정 환경에서만 적용하거나, 환경별로 다르게 적용할 수 있다.  
Spring Boot는 애플리케이션이 실행될 때 자동으로 application.properties 파일을 찾는다.  

```yml
spring:
  profiles:
    active: local # default
    group:
      local:
        - common
      prod:
        - common

---
spring:
  config:
    activate:
      on-profile: common

---
spring:
  config:
    activate:
      on-profile: local

---

spring:
  config:
    activate:
      on-profile: prod
```

<br/>

### 2-4. 도커를 이용한 다중 컨테이너 환경 구성하기

```
version: 도커 컴포즈 버전
services: 실행하려는 컨테이너들 정의
   pharmacy-recommendation-app: 서비스명 (같은 네트워크에 속한 컨테이너끼리 서비스명으로 접근 가능)
     container_name: 컨테이너 이름
     build: 도커 파일 위치 (dockerfile, context)
     depends_on: 특정 컨테이너에 대한 의존관계
     image: 컨테이너를 생성할 때 사용할 도커 이미지
     environment: 환경 변수
     volumes: 호스트디렉토리:컨테이너디렉토리
     ports: 접근 포트 설정 (docker run -p 옵션과 같다.)
     restart: 컨테이너 재실행 여부
```
<br/>

#### 도커 파일 구성

 - `redis/Dockerfile`
    - Redis 이미지를 이용한다.
```dockerfile
FROM redis:6

ENV TZ=Asia/Seoul
```
<br/>

 - `database/Dockerfile`
    - Maria DB 이미지를 이용한다.
```dockerfile
FROM mariadb:10

ENV TZ=Asia/Seoul
```
<br/>

 - `database/config/mariadb.cnf`
    - 볼륨(Volume)을 이용하여 MariaDB 설정 파일에 적용한다.
```cnf
[client]
default-character-set=utf8mb4

[mysql]
default-character-set=utf8mb4

[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
skip-character-set-client-handshake

[mysqldump]
default-character-set=utf8mb4
```
<br/>

 - `docker-compose-local.yml`
    - 실행: docker-compose -f docker-compose-local.yml up
    - 중지: docker-compose -f docker-compose-local.yml down
```yml
version: "3.8"
services:
  pharmacy-recommendation-redis:
    container_name: pharmacy-recommendation-redis
    build:
      dockerfile: Dockerfile
      context: ./redis
    image: 아이디/pharmacy-recommendation-redis
    ports:
      - "6379:6379"
  pharmacy-recommendation-database:
    container_name: pharmacy-recommendation-database
    build:
      dockerfile: Dockerfile
      context: ./database
    image: 아이디/pharmacy-recommendation-database
    environment:
      - MARIADB_DATABASE=pharmacy-recommendation
      - MARIADB_ROOT_PASSWORD=${SPRING_DATASOURCE_PASSWORD}
    volumes:
      - ./database/config:/etc/mysql/conf.d
    ports:
      - "3306:3306"
```
<br/>

 - `docker-compose-local.yml을 docker cli로 적용하면`
```bash
# Redis 이미지 빌드
docker build -t 아이디/pharmacy-recommendation-redis -f ./redis/Dockerfile ./redis

# Redis 이미지 컨테이너화
docker run -d \
  --name pharmacy-recommendation-redis \
  -p 6379:6379 \
  아이디/pharmacy-recommendation-redis

# MariaDB 이미지 빌드
docker build -t 아이디/pharmacy-recommendation-database -f ./database/Dockerfile ./database

# MariaDB 이미지 컨테이너화
docker run -d \
  --name pharmacy-recommendation-database \
  -e MARIADB_DATABASE=pharmacy-recommendation \
  -e MARIADB_ROOT_PASSWORD=${SPRING_DATASOURCE_PASSWORD} \
  -v $(pwd)/database/config:/etc/mysql/conf.d \
  -p 3306:3306 \
  아이디/pharmacy-recommendation-database
```
<br/>

#### Spring 외부 환경 변수

 - `application.yml`
    - local 환경에서 MariaDB DataSource와 Redis 연결을 설정해준다.
    - 계정명과 비밀번호는 노출되면 안되는 값으로 .env 파일을 이용한다.
```yml
spring:
  config:
    activate:
      on-profile: local
  datasource:
    driver-class-name: org.mariadb.jdbc.Driver
    url: jdbc:mariadb://localhost:3306/pharmacy-recommendation
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
  redis:
    host: localhost
    port: 6379
  jpa:
    hibernate:
      ddl-auto: create
    show-sql: true
```
<br/>

 - `.env`
    - docker-compose를 띄울 때 루트 디렉토리의 '.env' 파일의 내용을 환경 변수로 설정한다. 이렇게 설정된 환경 변수는 docker-compose.yml 파일 내에서 사용할 수 있으며, Spring Application 외부 설정 값으로도 사용할 수 있다.
        - Spring 외부 설정 값으로 사용할 때, 도커 컴포즈로 애플리케이션을 실행하면 정상적으로 값이 받아지지만, 로컬에서 실행할 때는 값이 없다. 때문에, 로컬 실행시에는 IntelliJ의 환경 변수를 등록한다.
        - Edit Configuration > Modify options > Environment variable 설정
    - 암호화를 통해 더 높은 보안을 제공하는 오픈 소스 HashiCorp  Vault를 이용할 수도 있다.
```env
SPRING_DATASOURCE_USERNAME=root 
SPRING_DATASOURCE_PASSWORD=1234
```

