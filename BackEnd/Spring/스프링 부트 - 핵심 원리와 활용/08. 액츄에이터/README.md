# 액츄에이터

스프링 부트가 제공하는 액추에이터는 프로덕션 준비 기능을 매우 편리하게 사용할 수 있는 다양한 편의 기능들을 제공한다. 더 나아가서 마이크로미터, 프로메테우스, 그라파나 같은 최근 유행하는 모니터링 시스템과 매우 쉽게 연동할 수 있는 기능도 제공한다.  

 - `build.gradle`
    - Spring Boot Actuator, Spring Web, Spring Data JPA, H2 Database, Lombok 의존성을 추가한다.
```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-actuator' //actuator 추가

    compileOnly 'org.projectlombok:lombok'
    runtimeOnly 'com.h2database:h2'
    annotationProcessor 'org.projectlombok:lombok'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'

    //test lombok 사용
    testCompileOnly 'org.projectlombok:lombok'
    testAnnotationProcessor 'org.projectlombok:lombok'
}
```

<br/>

## 액츄에이터 시작

액츄에이터가 제공하는 프로덕션 준비 기능을 사용하려면 스프링 부트 액츄에이터 라이브러리를 추가해야 한다.  

 - `http://localhost:8080/actuactor`
```
{
    "_links": {
        "self": {
            "href": "http://localhost:8080/actuator",
            "templated": false
        },
        "health-path": {
            "href": "http://localhost:8080/actuator/health/{*path}",
            "templated": true
        },
        "health": {
            "href": "http://localhost:8080/actuator/health",
            "templated": false
        }
    }
}
```

<br/>

 - `application.yml`
    - 액츄에이터는 헬스 상태 뿐만 아니라 수 많은 기능을 제공하는데, 이러 기능이 웹 환경에 보이도록 설정해주어야 한다.
    - 각각의 엔드포인트는 '/actuator/{엔드포인트명}' 같은 형식으로 접근할 수 있다.
        - '/actuator/health': 에플리케이션 헬스 정보
        - '/actuator/beans': 스프링 컨테이너에 등록된 빈
```
management:
  endpoints:
    web:
      exposure:
        include: "*"
```

<br/>

## 엔드포인트 설정

엔드포인트를 활성화한다는 것은 해당 기능 자체를 사용할지 말지 'on', 'off'를 선택하는 것이다.  
엔드포인트를 노출하는 것은 활성화된 엔드포인트를 HTTP에 노출할지 아니면 JMX에 노출할지 선택하는 것이다.  
엔드포인트를 활성화하고 추가로 HTTP을 통해서 웹에 노출할지, 아니면 JMX를 통해서 노출할지 두 위치에 모두 노출할지 노출 위치를 지정해주어야 한다.  

엔드포인트는 'shutdown'을 제외하고 대부분 기본으로 활성화되어 있다. 따라서, 어떤 엔드포인트를 노출할지 선택만 하면 된다. HTTP와 JMX를 선택할 수 있는데, 대부분 HTTP를 선택한다.  

<br/>

 - `모든 엔드포인트를 웹에 노출`
```yml
management:
  endpoints:
    web:
      exposure:
        include: "*"
```

<br/>

 - `shutdown 엔드포인트 활성화`
    - 특정 엔드포인트를 활성화하려면 'management.endpoint.{엔드포인트명}.enabled=true'를 적용하면 된다.
```yml
management:
  endpoint:
    shutdown:
      enabled: true
  endpoint:
    web:
      exposure:
        include: "*"
```

<br/>

 - `JMX 노출 예시`
    - JMX에 'health, info'를 노출한다.
```yml
management:
  endpoint:
    jmx:
      exposure:
        include: "health,info"
```

<br/>

 - `WEB 노출 예시`
    - web에 모든 엔드포인트를 노출하지만, 'env, beans'는 제외한다.
```yml
management:
  endpoint:
    web:
      exposure:
        include: "*"
        exclude: "env,beans"
```

<br/>

## 다양한 엔드포인트

각각의 엔드포인트를 통해서 개발자는 애플리케이션 내부의 수 많은 기능을 관리하고 모니터링 할 수 있다.  
스프링 부트가 기본으로 제공하는 다양한 엔드포인트에 대해서 알아본다.  

 - 공식 문서: https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints
 - beans : 스프링 컨테이너에 등록된 스프링 빈을 보여준다.
 - conditions : condition 을 통해서 빈을 등록할 때 평가 조건과 일치하거나 일치하지 않는 이유를 표시한다.
 - configprops : @ConfigurationProperties 를 보여준다.
 - env : Environment 정보를 보여준다.
 - health : 애플리케이션 헬스 정보를 보여준다.
 - httpexchanges : HTTP 호출 응답 정보를 보여준다. HttpExchangeRepository 를 구현한 빈을 별도로 등록해야 한다.
 - info : 애플리케이션 정보를 보여준다.
 - loggers : 애플리케이션 로거 설정을 보여주고 변경도 할 수 있다.
 - metrics : 애플리케이션의 메트릭 정보를 보여준다.
 - mappings : @RequestMapping 정보를 보여준다.
 - threaddump : 쓰레드 덤프를 실행해서 보여준다.
 - shutdown : 애플리케이션을 종료한다. 이 기능은 기본으로 비활성화 되어 있다.

<br/>

## 헬스 정보

헬스 정보는 단순히 애플리케이션이 요청에 응답을 할 수 있는지 판단하는 것을 넘어서 애플리케이션이 사용하는 데이터베이스가 응답하는지, 디스크 사용량에는 문제가 없는지 같은 다양한 정보들을 포함해서 만들어진다.  

만약, 헬스 컴포넌트 중에 하나라도 문제가 있으면 전체 상태는 DOWN이 된다.  

 - `헬스 정보 자세히 출력`
```yml
management:
  endpoint:
    health:
      show-details: always
```

<br/>

 - `헬스 정보 간단히 노출`
```yml
management:
  endpoint:
    health:
      show-components: always
```

<br/>

 - `헬스 공식 문서`
    - 스프링 공식 문서: https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints.health.auto-configured-health-indicators
    - 헬스 기능 직접 구현: https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints.health.writing-custom-health-indicators

<br/>

## 애플리케이션 정보

info 엔드포인트는 애플리케이션의 기본 정보를 노출한다.  

```
 - env, java, os 는 기본으로 비활성화 되어 있다.

java: 자바 런타임 정보
os: OS 정보
env: Environment 에서 info. 로 시작하는 정보
build: 빌드 정보, META-INF/build-info.properties 파일이 필요하다.
git: git 정보, git.properties 파일이 필요하다
```

<br/>

 - `application.yml`
    - 'http://localhost:8080/actuator/info'
```yml
management:
  info:
    java:
      enabled: true
    os:
      enabled: true
```

<br/>

 - `env`
    - 외부 설정(env) 값들을 남길 수 있다.
```yml
management:
  info:
    env:
      enabled: true

info:
  app:
    name: hello-actuator
      company: yh
```

<br/>

 - `build`
    - 빌드 정보를 노출하려면 빌드 시점에 META-INF/build-info.properties 파일을 만들어야 한다.
    - build.gradle 파일에 빌드 정보를 추가하고, 빌드를 진행한다. 그러면, resources/main/META-INF/build-info.properties 파일을 확인할 수 있다.
    - build는 기본적으로 활성화되어있어, 해당 파일만 있으면 바로 확인할 수 있다.
```gradle
springBoot {
    buildInfo()
}
```

<br/>

 - `git`
    - build 와 유사하게 빌드 시점에 사용한 git 정보도 노출할 수 있다. git 정보를 노출하려면 git.properties 파일이 필요하다
    - 프로젝트가 git으로 관리되어야 한다. 만약, git으로 관리되지 않으면 빌드시 오류가 발생한다.
```gradle
plugins {
    // ...
    id "com.gorylenko.gradle-git-properties" version "2.4.1" //git info
}
```

<br/>

## 로거

loggers 엔드포인트를 사용하면 로깅과 관련된 정보를 확인하고, 또 실시간으로 변경할 수도 있다.  

 - `LogController`
```java
@Slf4j
@RestController
public class LogController {

    @GetMapping("/log")
    public String log() {
        log.trace("trace log");
        log.debug("debug log");
        log.info("info log");
        log.warn("warn log");
        log.error("error log");
        return "ok";
    }
}
```

<br/>

 - `application.yml`
  - 'hello.controller' 패키지와 그 하위는 debug 레벨로 출력하도록 설정한다.
```yml
logging:
  level:
    hello.controller: debug
```

<br/>

 - `로깅 레벨 확인`
  - 조회: '/actuator/loggers'
  - 자세히 조회: '/actuator/loggers/hello.controller'
  - 로그를 별도로 설정하지 않으면 스프링 부트는 기본으로 INFO 레벨로 설정한다. 실행 결과를 보면 ROOT의 configuredLevel이 INFO인 것을 확인할 수 있다.
```json
{
  "levels":[
    "OFF",
    "ERROR",
    "WARN",
    "INFO",
    "DEBUG",
    "TRACE"
  ],
  "loggers":{
    "ROOT":{
      "configuredLevel":"INFO",
      "effectiveLevel":"INFO"
    },
    "_org.springframework":{
      "effectiveLevel":"INFO"
    },
    "hello":{
      "effectiveLevel":"INFO"
    },
    "hello.ActuatorApplication":{
      "effectiveLevel":"INFO"
    },
    "hello.controller":{
      "configuredLevel":"DEBUG",
      "effectiveLevel":"DEBUG"
    },
    "hello.controller.LogController":{
      "effectiveLevel":"DEBUG"
    }
  }
}
```

<br/>

### 실시간 로그 레벨 변경

loggers 엔드포인트를 사용하면 애플리케이션을 재실행하지 않고, 실시간으로 로그 레벨을 변경할 수 있다.  
HTTP 클라이언트를 이용하여 POST 요청의 JSON 형식으로 변경을 전달할 수 있다.  

 - '/actuator/loggers/hello.controller'
  - 해당 URL의 POST 요청으로 content/type을 application/json으로 아래 Body를 전달한다.
```json
{
  "configuredLevel": "TRACE"
}
```

<br/>

## HTTP 요청 응답 기록

HTTP 요청과 응답의 과거 기록을 확인하고 싶다면 httpexchanges 엔드포인트를 사용하면 된다.  
HttpExchangeRepository 인터페이스의 구현체를 빈으로 등록하면 httpexchanges 엔드포인트를 사용할 수 있다.  
스프링 부트는 기본으로 InMemoryHttpExchangeRepository 구현체를 제공한다.  

'actuator/httpexchanges' 로 요청하면 HTTP 요청과 응답 정보를 확인할 수 있다. 해당 기능은 매우 단순하고 기능에 제한이 많아 개발 단계에서만 사용하고, 실제 운영 서비스에서는 모니터링 툴이나 핀포인트, Zipkin 같은 다른 기술을 사용하는 것이 좋다.  

 - `ActuatorApplication`
  - HttpExchangeRepository 인터페이스의 구현체인 InMemoryHttpExchangeRepository를 스프링 빈으로 등록한다.
  - InMemoryHttpExchangeRepository는 최대 100개의 HTTP 요청을 제공한다. 최대 요청이 넘어가면 과거 요청을 삭제한다. setCapacity() 메서드로 최대 요청수를 설정할 수 있다.
```java
@SpringBootApplication
public class ActuatorApplication {

    public static void main(String[] args) {
        SpringApplication.run(ActuatorApplication.class, args);
    }

    @Bean
    public InMemoryHttpExchangeRepository httpExchangeRepository() {
        return new InMemoryHttpExchangeRepository();
    }

}
```

<br/>

## 엑츄에이터 보안

액츄에이터가 제공하는 기능들은 우리 애플리케이션의 내부 정보를 너무 많이 노출한다. 그래서 외부 인터넷 망이 공개된 곳에 액츄에이터의 엔드포인트를 공개하는 것은 보안상 좋은 방안이 아니다. 액츄에이터의 엔드포인트들은 외부 인터넷에서 접근이 불가능하게 막고, 내부에서만 접근 가능한 내부망을 사용하는 것이 안전하다.  

<br/>

예를 들어서 외부 인터넷 망을 통해서 8080 포트에만 접근할 수 있고, 다른 포트는 내부망에서만 접근할 수 있다면 액츄에이터에 다른 포트를 설정하면 된다.  
액츄에이터의 기능을 애플리케이션 서버와는 다른 포트에서 실행하려면 다음과 같이 설정하면 된다. 이 경우 기존 8080 포트에서는 액츄에이터를 접근할 수 없다.

 - `application.properties`
  - 'http://localhost:9292/actuator' 로 엑츄에이터에 접근한다.
```properties
management.server.port=9292
```

<br/>

 - `엔드포인트 경로 변경`
  - '/actuator/{엔드포인트}' 대신에 '/manage/{엔드포인트}'로 접근하게 된다.
```yml
managemen:
  endpoints:
    web:
      base-path: "/manage"
```

