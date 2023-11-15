# Spring Boot Profile

Spring Boot 프로젝트에서 설정 파일(application.yml)에 옵션을 적용하는 것으로 다양한 설정을 할 수 있다.  
이떄, 로컬 개발 환경과 테스트 서버 그리고 운영 서버에 따라 설정을 다르게 적용해야 할 때가 있다.  
이때, Spring Boot의 Multi Profile을 이용하여 손쉽게 해당 Profile에 맞는 설정을 구성할 수 있다.  
 - 실행시 spring.profiles.active 옵션으로 profile을 적용할 수 있다.
    - java -jar -Dspring.profiles.active=prod 애플리케이션.jar &

<br/>

## 2.4 버전 이전

 - 폴더 구조
```
resources
  ├── application.yml
  ├── application-dev.yml
  ├── application-local.yml
  ├── application-prod.yml
  └── application-test.yml
```

 - application.yml
```YML
spring.config.use-legacy-processing: true
spring:
  profiles:
    active: local

---
spring:
  profiles: local
    include: local

---
spring:
  profiles: dev
    include: dev

---
spring:
  profiles: prod
    include: prod
```

<br/>

## 2.4 버전 이후

 - 설정 파일 옵션
```
 - spring.profiles.active
    - 프로파일을 명시하지 않을 경우 기본적으로 사용될 프로파일을 지정한다.

 - spring.config.import
    - 외부 설정 파일을 현재 설정 파일에 import 하는 데 사용된다.

 - spring.config.activate.on-profile
    - 특정 프로파일이 활성화되었을 때 특정 설정을 활성화하도록 지정한다.
    - classpath:파일명.yml -> 프로젝트 내 classpath에서 파일을 가져온다.
    - file:폴더경로/파일명.yml -> 서버나 PC의 외부 Config 파일을 가져온다.
    - http://URL경로/파일명.yml -> HTTP URL 형태로 인터넷 상의 Config 파일을 가져온다.
```

 - application.yml
```YML
spring:
  profiles:
    active: local
  config:
    import:
      - classpath:custom-config.yml

---
spring:
  config:
    activate:
      on-profile: local

---
spring:
  config:
    activate:
      on-profile: dev

---
spring:
  config:
    activate:
      on-profile: prod
```

 - appplication.yml
    - 그룹 이용한 방식
```YML
spring:
  profiles:
    group:
      local: local,common
      dev: dev,common
      prod: prod,common

---
spring:
  config:
    activate:
      on-profile: common
server:
  port: 8080


---
spring:
  config:
    activate:
      on-profile: local

---
spring:
  config:
    activate:
      on-profile: dev

---
spring:
  config:
    activate:
      on-profile: prod
```

<br/>

## 참고

 - Spring Profiles
    - https://sgc109.github.io/2020/07/06/spring-profiles/
    - https://gaemi606.tistory.com/entry/Spring-Boot-profile%EC%84%A4%EC%A0%95
