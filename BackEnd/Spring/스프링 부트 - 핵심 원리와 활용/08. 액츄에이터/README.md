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

