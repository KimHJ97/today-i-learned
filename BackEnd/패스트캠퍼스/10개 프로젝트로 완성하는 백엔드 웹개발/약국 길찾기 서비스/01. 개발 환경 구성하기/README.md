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

