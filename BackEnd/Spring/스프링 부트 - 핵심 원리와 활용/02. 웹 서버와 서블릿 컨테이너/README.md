# 웹 서버와 서블릿 컨테이너

## 웹 서버와 스프링 부트

과거에는 자바로 웹 애플리케이션을 개발하기 위해서는 먼저 서버에 톰캣같은 WAS를 설치하여야 했다. 그리고 WAS에서 동작할 수 있도록 서블릿 스팩에 맞추어 코드를 작성하고 WAR 형식으로 빌드하여 만들어진 WAR 파일을 WAS에 전달하여 배포하는 방식으로 전체 개발 주기가 동작했다.  

최근에는 스프링 부트가 톰캣같은 WAS를 내장하고 있다. 개발자는 코드를 작성하고 JAR로 빌드한 다음에 JAR를 원하는 위치에서 실행하기만 하면 WAS가 함께 실행된다.  

쉽게, main 메서드만 실행하면 되고, WAS 설치나 IDE 같은 개발 환경에서 WAS와 연동하는 복잡한 일을 수행하지 않아도 된다.  

<br/>

## 톰캣 설치

스프링 3.0을 사용하기 위해서는 JDK 17+ 이 요구된다.  

 - 톰캣 10 버전: https://tomcat.apache.org/download-10.cgi
```bash
# 권한 부여
$ chmod 755 *

# 실행
$ ./startup.sh

# 종료
$ ./shutdown.sh
```

<br/>

 - `포트 종료`
    - 8080 포트를 이미 사용중인 경우 아래와 같은 방법으로 종료할 수 있다.
```bash
# Mac OS
$ sudo lsof -i :8080
$ sudo kill -9 PID

# Windows
$ netstat -ano | findstr :8080
$ taskkill /f /pid PID
```

<br/>

## 프로젝트 설정

 - `사전 준비물`
    - JDK 17 이상
    - IntelliJ 또는 Eclipse

<br/>

 - `패키지 구조`
```
root 
  ├─ .gradle/
  ├─ .idea/
  ├─ gradle/
  ├─ src
  │   └─ main
  │        ├─ java/hello/servlet
  │        │    └─ TestServlet
  │        └─ webapp
  │             └─ index.html
  ├─ .gitignore
  ├─ build.gradle
  ├─ gradle
  ├─ gradle.bat
  ├─ settings.gradle
```

<br/>

 - `build.gradle`
```gradle
plugins {
    id 'java'
    id 'war'
}

group = 'hello'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '17'

repositories {
    mavenCentral()
}

dependencies {
    //서블릿
    implementation 'jakarta.servlet:jakarta.servlet-api:6.0.0'
}

tasks.named('test') {
    useJUnitPlatform()
}
```

<br/>

 - `TestServlet`
```java
package hello.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

/**
 * http://localhost:8080/test
 */
@WebServlet(urlPatterns = "/test")
public class TestServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("TestServlet");
        resp.getWriter().println("test");
    }
}
```

<br/>

## WAR 빌드와 배포

 - `빌드`
    - 그래들 프로젝트로 'gradlew'를 이용하여 빌드를 진행한다.
    - 빌드가 완료되면, './build/libs/' 폴더안에 *.war 파일이 생성된다.
```bash
$ gradlew build
```

<br/>

 - `WAR 파일`
    - WEB-INF
        - classes: 실행항 클래스 모음
        - lib: 라이브러리 모음
        - web.xml: 웹 서버 배치 설정 파일(생략 가능)
    - index.html: 정적 리소스

WAR 파일을 풀어보면, index.html 파일과 META-INF 폴더, WEB-INF 폴더가 존재하게 된다.  
루트 디렉토리 자식으로 'src/main/webapp' 폴더 안에 있는 파일이 바로 들어가게 되고, 'src/main/java' 폴더 안에 있는 소스 코드는 WEB-INF 폴더 안에 classes 폴더 밑에 컴파일된 class 파일로 존재하게 된다. 추가적으로 자바 라이브러리도 'WEB-INF/lib' 경로에 존재하게 된다.  

<br/>

 - `톰캣(WAS) 배포하기`

```
1. 만들어진 WAR 파일을 톰캣의 'webapps/' 폴더로 이동시킨다.
2. WAR 파일의 이름을 'ROOT.war'로 변경한다.
3. 톰캣을 실행한다. (startup.bat)
```
