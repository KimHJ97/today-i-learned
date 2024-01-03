# 스프링 부트와 내장 톰캣

기존에는 웹 애플리케이션을 개발하고 배포하기 위해서는 별도의 WAS를 설치하고, 애플리케이션 코드를 WAR로 빌드하고, 빌드한 WAR 파일을 WAS에 배포해야 했다.  

이러한 방식은 웹 애플리케이션 서버(WAS)를 별도로 설치해야 하고, WAS 개발 환경을 위한 별도의 설정이 필요하며, 배포 과정도 복잡하게 된다.  

톰캣도 결국에는 자바로 만들어져 있다. 즉, 톰캣을 하나의 라이브러리처럼 포함하는 방식으로 내장 톰캣 기능이 제공되었다.  

<br/>

## 내장 톰캣

 - `build.gradle`
    - 내장 톰캣을 사용하기 위해 'tomcat-embed-core' 라이브러리 의존성을 추가한다.
```gradle
plugins {
    id 'java'
}

group = 'hello'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '17'

repositories {
    mavenCentral()
}

dependencies {
    //스프링 MVC 추가
    implementation 'org.springframework:spring-webmvc:6.0.4'

    //내장 톰켓 추가
    implementation 'org.apache.tomcat.embed:tomcat-embed-core:10.1.5'
}

tasks.named('test') {
    useJUnitPlatform()
}

//일반 Jar 생성
task buildJar(type: Jar) {
    manifest {
        attributes 'Main-Class': 'hello.embed.EmbedTomcatSpringMain'
    }
    with jar
}

//Fat Jar 생성
task buildFatJar(type: Jar) {
    manifest {
        attributes 'Main-Class': 'hello.embed.EmbedTomcatSpringMain'
    }
    duplicatesStrategy = DuplicatesStrategy.WARN
    from { configurations.runtimeClasspath.collect { it.isDirectory() ? it : zipTree(it) } }
    with jar
}

```

<br/>

 - `HelloServlet`
```java
public class HelloServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("HelloServlet.service");
        resp.getWriter().println("hello servlet!");
    }
}
```

<br/>

 - `HelloController`
```java
@RestController
public class HelloController {

    @GetMapping("/hello-spring")
    public String hello() {
        System.out.println("HelloController.hello");
        return "hello spring!";
    }

}
```

<br/>

 - `HelloConfig`
```java
@Configuration
public class HelloConfig {

    @Bean
    public HelloController helloController() {
        return new HelloController();
    }
}
```

<br/>

### 내장 톰캣 - 서블릿

 - `EmbedTomcatServletMain`
    - 내장 톰캣을 생성하고, 톰캣이 제공하는 커넥터를 사용해서 8080 포트에 연결한다.
    - 톰캣에 사용할 contextPath와 docBase를 지정하고, addServlet() 메서드로 서블릿을 등록한다. 이후 addServletMappingDecoded() 메서드로 등록한 서블릿의 경로를 매핑한다.
```java
import hello.servlet.HelloServlet;
import org.apache.catalina.Context;
import org.apache.catalina.LifecycleException;
import org.apache.catalina.connector.Connector;
import org.apache.catalina.startup.Tomcat;

import java.io.File;

public class EmbedTomcatServletMain {
    public static void main(String[] args) throws LifecycleException {
        System.out.println("EmbedTomcatServletMain.main");
        // 톰캣 설정
        Tomcat tomcat = new Tomcat();
        Connector connector = new Connector();
        connector.setPort(8080);
        tomcat.setConnector(connector);

        // 서블릿 등록
        Context context = tomcat.addContext("", "/");

        File docBaseFile = new File(context.getDocBase());
        if (!docBaseFile.isAbsolute()) {
            docBaseFile = new File(((org.apache.catalina.Host) context.getParent()).getAppBaseFile(), docBaseFile.getPath());
        }
        docBaseFile.mkdirs();

        tomcat.addServlet("", "helloServlet", new HelloServlet());
        context.addServletMappingDecoded("/hello-servlet", "helloServlet");
        tomcat.start();
    }
}
```

<br/>

### 내장 톰캣 - 스프링

내장 톰캣에 스프링 컨테이너를 연동한다.  

 - `EmbedTomcatSpringMain`
    - 내장 톰캣을 생성해서 8080 포트로 연결하도록 설정한다.
    - 스프링 컨테이너를 만들고 필요한 빈을 등록한다.
    - 스프링 MVC 디스패처 서블릿을 만들고 앞서 만든 스프링 컨테이너에 연결한다.
    - 디스패처 서블릿을 내장 톰캣에 등록한다.
    - 내장 톰캣을 실행한다.
```java
public class EmbedTomcatSpringMain {
    public static void main(String[] args) throws LifecycleException {
        System.out.println("EmbedTomcatSpringMain.main");

        // 톰캣 설정
        Tomcat tomcat = new Tomcat();
        Connector connector = new Connector();
        connector.setPort(8080);
        tomcat.setConnector(connector);
        
        // 스프링 컨테이너 생성
        AnnotationConfigWebApplicationContext appContext = new AnnotationConfigWebApplicationContext();
        appContext.register(HelloConfig.class);

        // 스프링 MVC 디스패처 서블릿 생성, 스프링 컨테이너 연결
        DispatcherServlet dispatcher = new DispatcherServlet(appContext);

        // 디스패처 서블릿 등록
        Context context = tomcat.addContext("", "/");

        File docBaseFile = new File(context.getDocBase());
        if (!docBaseFile.isAbsolute()) {
            docBaseFile = new File(((org.apache.catalina.Host) context.getParent()).getAppBaseFile(), docBaseFile.getPath());
        }
        docBaseFile.mkdirs();

        tomcat.addServlet("", "dispatcher", dispatcher);
        context.addServletMappingDecoded("/", "dispatcher");

        tomcat.start();
    }
}
```

<br/>

### 내장 톰캣 - 빌드와 배포

자바의 메인 메서드를 실행하기 위해서는 *.jar 형식으로 빌드해야 한다.  
그리고, Jar 파일 안에는 'META-INF/MANIFEST.MF' 파일에 실행할 메인 메서드의 클래스를 지정해주어야 한다.  

<br/>

 - `META-INF/MANIFEST.MF`
```
Manifest-Version: 1.0
Main-Class: hello.embed.EmbedTomcatSpringMain
```

<br/>

 - `build.gradle`
    - MANIFEST를 작성하는 부분은 Gradle을 이용하면 쉽게 진행할 수 있다.
    - 명령 프롬프트에서 'gradlew clean buildJar' 명령어로 빌드 진행
    - 빌드된 Jar 파일은 'java -jar embed-0.0.1-SNAPSHOT.jar' 명령어로 실행한다.
```gradle
//일반 Jar 생성
task buildJar(type: Jar) {
    manifest {
        attributes 'Main-Class': 'hello.embed.EmbedTomcatSpringMain'
    }
    with jar
}
```

<br/>

Jar 파일은 스팩상 다른 Jar 파일을 포함할 수 없다.  
War와 다르게 Jar 파일은 내부에 라이브러리 역할을 하는 Jar 파일을 포함할 수 없다. 포함한다고 해도 인식이 안된다. 대안으로 라이브러리 Jar 파일을 모두 구해서 MANIFEST 파일에 해당 경로를 적어주면 인식할 수 있지만, 매우 번거롭고 Jar 파일안에 다른 Jar 파일을 포함할 수 없기 때문에 라이브러리 역할을 하는 Jar 파일도 항상 함께 가지고 다녀야 한다.  

<br/>

### 내장 톰캣 - 빌드와 배포2 (Fat Jar)

Jar 안에는 Jar 파일을 포함할 수 없지만, 클래스는 얼마든지 포함할 수 있다.  
라이브러리에 사용되는 Jar를 풀면 class 파일들이 나오는데, 이 class 파일들을 새로 만드는 Jar에 포함시키는 방법이 있다. 이렇게 하면 수 많은 라이브러리에서 나오는 'class' 들을 포함하여 뚱뚱한(fat) Jar가 탄생하게 된다.  

<br/>

 - `build.gradle`
```gradle
//Fat Jar 생성
task buildFatJar(type: Jar) {
    manifest {
        attributes 'Main-Class': 'hello.embed.EmbedTomcatSpringMain'
    }
    duplicatesStrategy = DuplicatesStrategy.WARN
    from { configurations.runtimeClasspath.collect { it.isDirectory() ? it : zipTree(it) } }
    with jar
}
```

<br/>

 - `Fat Jar`

Fat Jar 방식을 이용하면 하나의 Jar 파일에 필요한 라이브러리들을 내장할 수 있다. 여기에 내장 톰캣과 스프링 라이브러리를 포함하여 하나의 Jar 파일로 배포, 웹 서버 설치 + 실행까지 모든 것을 단순화할 수 있다.  

Fat Jar는 완벽해 보이지만 몇 가지 단점을 여전히 포함하고 있다.  
첫 번째로 어떤 라이브러리가 포함되어 있는지 확인하기 어렵다. 모두 class로 풀려있어 어떤 라이브러리가 사용되고 있는지 추적하기 어렵다.  
두 번째로 파일명 중복을 해결할 수 없다. 클래스나 리소스명이 같은 경우 하나를 포기해야 하는데, 이것은 심각한 문제를 발생할 수 있다. 예를 들어, 서블릿 컨테이너를 초기화하기 위해 META-INF/services/jakarta.servlet.ServletContainerInitializer에 정의를 해야하는데, A 라이브러리와 B 라이브러리가 모두 해당 파일을 사용하여 서블릿 컨테이너를 초기화한다면 둘 중 하나만 선택되고, 결론적으로 정상 동작하지 않게 된다.  

<br/>

## 편리한 부트 클래스 만들기

내장 톰캣 실행, 스프링 컨테이너 생성, 디스패처 서블릿 등록의 모든 과정을 편리하게 처리해주는 나만의 부트 클래스를 만든다.  

 - `MySpringApplication`
    - configClass : 스프링 설정을 파라미터로 전달받는다.
    - args : main(args) 를 전달 받아서 사용한다. 참고로 예제에서는 단순히 해당 값을 출력한다.
```java
import org.apache.catalina.Context;
import org.apache.catalina.LifecycleException;
import org.apache.catalina.connector.Connector;
import org.apache.catalina.startup.Tomcat;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;

import java.util.List;

public class MySpringApplication {

    public static void run(Class configClass, String[] args) {
        System.out.println("MySpringApplication.run args=" + List.of(args));

        // 톰캣 설정
        Tomcat tomcat = new Tomcat();
        Connector connector = new Connector();
        connector.setPort(8080);
        tomcat.setConnector(connector);

        // 스프링 컨테이너 생성
        AnnotationConfigWebApplicationContext appContext = new AnnotationConfigWebApplicationContext();
        appContext.register(configClass);

        // 스프링 MVC 디스패처 서블릿 생성, 스프링 컨테이너 연결
        DispatcherServlet dispatcher = new DispatcherServlet(appContext);

        // 디스패처 서블릿 등록
        Context context = tomcat.addContext("", "/");
        tomcat.addServlet("", "dispatcher", dispatcher);
        context.addServletMappingDecoded("/", "dispatcher");

        try {
            tomcat.start();
        } catch (LifecycleException e) {
            throw new RuntimeException(e);
        }
    }
}
```

<br/>

 - `MySpringBootApplication`
```java
import org.springframework.context.annotation.ComponentScan;

import java.lang.annotation.*;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@ComponentScan
public @interface MySpringBootApplication {
}
```

<br/>

 - `MySpringBootMain`
```java
import hello.boot.MySpringApplication;
import hello.boot.MySpringBootApplication;

@MySpringBootApplication
public class MySpringBootMain {
    public static void main(String[] args) {
        System.out.println("MySpringBootMain.main");
        MySpringApplication.run(MySpringBootMain.class, args);
    }
}
```

