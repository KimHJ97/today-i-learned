# 스프링 부트 스타터와 라이브러리 관리

## 라이브러리 직접 관리

 - `build.gradle`
    - 'io.spring.dependency-management' 플러그인을 주석처리한다.
    - 수 많은 라이브러리의 버전을 골라서 선택한다.
```gradle
plugins {
    id 'org.springframework.boot' version '3.0.2'
    //id 'io.spring.dependency-management' version '1.1.0'
    id 'java'
}

group = 'hello'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '17'

dependencies {

    //1. 라이브러리 직접 지정
    //스프링 웹 MVC
    implementation 'org.springframework:spring-webmvc:6.0.4'
    //내장 톰캣
    implementation 'org.apache.tomcat.embed:tomcat-embed-core:10.1.5'
    //JSON 처리
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.14.1'
    //스프링 부트 관련
    implementation 'org.springframework.boot:spring-boot:3.0.2'
    implementation 'org.springframework.boot:spring-boot-autoconfigure:3.0.2'
    //LOG 관련
    implementation 'ch.qos.logback:logback-classic:1.4.5'
    implementation 'org.apache.logging.log4j:log4j-to-slf4j:2.19.0'
    implementation 'org.slf4j:jul-to-slf4j:2.0.6'
    //YML 관련
    implementation 'org.yaml:snakeyaml:1.33'
}
```

<br/>

## 스프링 부트 라이브러리 버전 관리

스프링 부트는 개발자 대신에 수 많은 라이브러리의 버전을 직접 관리해준다.  
개발자는 라이브러리 의존성만 추가하면, 스프링 부트가 부트 버전에 맞는 최적화된 버전을 선택해준다.  

 - `build.gradle`
```gradle
plugins {
    id 'org.springframework.boot' version '3.0.2'
    //id 'io.spring.dependency-management' version '1.1.0'
    id 'java'
}

group = 'hello'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '17'

dependencies {
    //2. 스프링 부트 라이브러리 버전 관리
    //스프링 웹, MVC
    implementation 'org.springframework:spring-webmvc'
    //내장 톰캣
    implementation 'org.apache.tomcat.embed:tomcat-embed-core'
    //JSON 처리
    implementation 'com.fasterxml.jackson.core:jackson-databind'
    //스프링 부트 관련
    implementation 'org.springframework.boot:spring-boot'
    implementation 'org.springframework.boot:spring-boot-autoconfigure'
    //LOG 관련
    implementation 'ch.qos.logback:logback-classic'
    implementation 'org.apache.logging.log4j:log4j-to-slf4j'
    implementation 'org.slf4j:jul-to-slf4j'
    //YML 관련
    implementation 'org.yaml:snakeyaml'
}
```

<br/>

 - `버전 정보 BOM`
    - 깃허브 주소: https://github.com/spring-projects/spring-boot/blob/main/spring-boot-project/spring-boot-dependencies/build.gradle
    - 스프링 공식 문서: https://docs.spring.io/spring-boot/docs/current/reference/html/dependency-versions.html#appendix.dependency-versions.coordinates
    - 해당 build.gradle 문서안에 보면 bom 이라는 항목이 있다. 해당 bom 안에는 각각의 라이브러리에 대한 버전이 명시되어 있다.

<br/>

## 스프링 부트 스타터

웹 프로젝트를 하나 실행하려면 스프링 웹 MVC, 내장 톰캣, JSON 처리, 스프링 부트 관련, LOG, YML 등 다양한 라이브러리가 필요하다. 스프링 부트는 프로젝트를 시작할 때 라이브러리 관리 문제를 쉽게 사용할 수 있도록 관련 라이브러리를 모아둔 스프링 부트 스타터를 제공한다.  

<br/>

 - `build.gradle`
    - 스프링과 웹을 사용하고 싶으면 'spring-boot-starter-web' 의존성을 추가한다. 스프링 웹 MVC, 내장 톰캣, JSON 처리, 스프링 부트 관련, LOG, YML 등이 포함되어 있다.
    - 스프링과 JPA를 사용하고 싶으면 'spring-boot-starter-data-jpa' 의존성을 추가한다. 스프링 데이터 JPA, 하이버네이트 등을이 포함되어 있다.
```gradle
plugins {
    id 'org.springframework.boot' version '3.0.2'
    //id 'io.spring.dependency-management' version '1.1.0'
    id 'java'
}

group = 'hello'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '17'

dependencies {
    //3. 스프링 부트 스타터
    implementation 'org.springframework.boot:spring-boot-starter-web'
}
```

<br/>

 - `자주 사용되는 스프링 부트 스타터`
    - 공식 문서: https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.build-systems.starters
    - spring-boot-starter : 핵심 스타터, 자동 구성, 로깅, YAML
    - spring-boot-starter-jdbc : JDBC, HikariCP 커넥션풀
    - spring-boot-starter-data-jpa : 스프링 데이터 JPA, 하이버네이트
    - spring-boot-starter-data-mongodb : 스프링 데이터 몽고
    - spring-boot-starter-data-redis : 스프링 데이터 Redis, Lettuce 클라이언트
    - spring-boot-starter-thymeleaf : 타임리프 뷰와 웹 MVC
    - spring-boot-starter-web : 웹 구축을 위한 스타터, RESTful, 스프링 MVC, 내장 톰캣
    - spring-boot-starter-validation : 자바 빈 검증기(하이버네이트 Validator)
    - spring-boot-starter-batch : 스프링 배치를 위한 스타터

<br/>

### 라이브러리 버전 변경

스프링 부트가 관리하는 외부 라이브러리 버전을 변경하고 싶은 경우에 아래처럼 사용할 수 있다.  


 - `build.gradle`
    - 스프링 공식 문서: https://docs.spring.io/spring-boot/docs/current/reference/html/dependency-versions.html#appendix.dependency-versions.properties
```gradle
plugins {
    id 'org.springframework.boot' version '3.0.2'
    //id 'io.spring.dependency-management' version '1.1.0'
    id 'java'
}

group = 'hello'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '17'

//스프링 부트 외부 라이브러리 버전 변경
ext['tomcat.version'] = '10.1.4'

dependencies {
    //3. 스프링 부트 스타터
    implementation 'org.springframework.boot:spring-boot-starter-web'
}
```

