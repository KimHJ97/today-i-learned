# 프로젝트 환경 설정

## 1. 프로젝트 구성

### 멀티 모듈 방식

 - `프로젝트 구성`
```
 - Name: coupon
 - Language: Java
 - Type: Gradle - Groovy
 - Group: com.example
 - Artifact: coupon
 - Package name: com.example.coupon
 - Spring Boot: 3.1.5
```
<br/>

위와 같은 구성으로 프로젝트를 만들고, src 폴더를 제거한다.  
이후, 프로젝트 우클릭 new Module.. 을 선택하여 모듈을 만든다.  
 - coupon-core, coupon-api, coupon-consumer
 - 각 모듈을 만들고 src 폴더와 build.gradle 파일을 제외하고 모두 삭제한다.

<br/>

#### coupon-core 모듈

 - API와 Consumer에서 공통적으로 사용하는 기능을 담는 프로젝트
```
 - Name: coupon-core
 - Language: Java
 - Type: Gradle - Groovy
 - Group: com.example
 - Artifact: coupon-core
 - Package name: com.example.couponcore
 - Spring Boot: 3.1.5
```
<br/>

 - `build.gradle`
```groovy
val bootJar: org.springframework.boot.gradle.tasks.bundling.BootJar by tasks

bootJar.enabled = false

repositories {
    mavenCentral()
}

dependencies {
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")
    implementation("com.fasterxml.jackson.core:jackson-databind")
    implementation("org.redisson:redisson-spring-boot-starter:3.16.4")
    implementation("org.springframework.boot:spring-boot-starter")
    implementation("com.github.ben-manes.caffeine:caffeine")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
```
<br/>

#### coupon-api 모듈

 - 사용자의 요청을 받는 API 서버
```
 - Name: coupon-api
 - Language: Java
 - Type: Gradle - Groovy
 - Group: com.example
 - Artifact: coupon-api
 - Package name: com.example.couponapi
 - Spring Boot: 3.1.5
```
<br/>

 - `build.gradle`
```groovy
dependencies {
    implementation(project(":coupon-core"))
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
```
<br/>

#### coupon-consumer 모듈

 - 쿠폰을 비동기적으로 발급시 처리하는 서버
```
 - Name: coupon-consumer
 - Language: Java
 - Type: Gradle - Groovy
 - Group: com.example
 - Artifact: coupon-consumer
 - Package name: com.example.couponconsumer
 - Spring Boot: 3.1.5
```
<br/>

 - `build.gradle`
```groovy
dependencies {
    implementation(project(":coupon-core"))
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
```
<br/>

#### coupon 프로젝트

 - `settings.gradle.kts`
    - coupon 프로젝트 하위로 core, api, consumer 프로젝트를 관리한다.
```kts
rootProject.name = "coupon-version-control"
include("coupon-core", "coupon-api", "coupon-consumer")
```
<br/>

 - `build.gradle`
    - subprojects 항목으로 하위 자식 모듈들에 대한 설정을 정의한다.
```groovy
val bootJar: org.springframework.boot.gradle.tasks.bundling.BootJar by tasks

bootJar.enabled = false

plugins {
    java
    id("org.springframework.boot") version "3.1.5"
    id("io.spring.dependency-management") version "1.1.3"
}

group = "com.example"
version = "0.0.1-SNAPSHOT"

java {
    sourceCompatibility = JavaVersion.VERSION_17
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    mavenCentral()
}


subprojects {
    apply(plugin = "java")
    apply(plugin = "io.spring.dependency-management")
    apply(plugin = "org.springframework.boot")

    repositories {
        mavenCentral()
    }

    dependencies {
        implementation("org.springframework.boot:spring-boot-starter-data-jpa")
        implementation("org.springframework.boot:spring-boot-starter-data-redis")
        compileOnly("org.projectlombok:lombok")
        annotationProcessor("org.projectlombok:lombok")
        runtimeOnly("com.h2database:h2")
        runtimeOnly("com.mysql:mysql-connector-j")
        implementation("org.springframework.boot:spring-boot-starter")
        implementation("com.querydsl:querydsl-jpa:5.0.0:jakarta")
        implementation("org.springframework.boot:spring-boot-starter-actuator")
        implementation("io.micrometer:micrometer-registry-prometheus")
        annotationProcessor("com.querydsl:querydsl-apt:5.0.0:jakarta")
        annotationProcessor("jakarta.annotation:jakarta.annotation-api")
        annotationProcessor("jakarta.persistence:jakarta.persistence-api")
        testImplementation("org.springframework.boot:spring-boot-starter-test")
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}
```
<br/>

#### 추가 설정

 - `coupon-core: CouponCoreConfiguration.java`
    - coupon-core 프로젝트의 CouponCoreApplication.java 파일을 삭제하고, 공통 설정을 관리할 설정 파일을 만든다.
```java
@ComponentScan
@EnableAutoConfiguration
public class CouponCoreConfiguration {
}
```
<br/>

 - `coupon-api, coupon-consumer: XxxApplication`
    - coupon-core 모듈의 설정 파일을 임포트한다.
    - Spring의 외부 설정 파일(application.yml)을 coupon-core와 현재 모듈의 설정 파일을 사용하도록 설정한다.
```java
@Import(CouponCoreConfiguration.class)
@SpringBootApplication
public class XxxApplication {
    public static void main(String[] args) {
        System.setProperty("spring.config.name", "application-core,application-xxx");
        SpringApplication.run(XxxApplication.class, args);
    }
}
```
<br/>

 - `coupon-api, coupon-consumer: application-xxx.yml`
    - 각각 서버의 맞는 포트를 설정한다.
```yml
# api 서버
spring:
  application:
    name: coupon-api
server:
  port: 8080

# consumer 서버
spring:
  application:
    name: coupon-consumer
server:
  port: 8081
```
<br/>

## 2. MySQL, Redis 설정

 - `docker-compose.yml`
    - Redis와 MySQL에 관한 컨테이너 정보가 정의되어 있다.
    - Redis: coupon-redis 컨테이너명을 사용하고, 내부 Redis 서버 포트는 6380 포트를 사용하고, 도커 클라이언트로 6380 포트로 접속한다.
    - MySQL: coupon-mysql 컨테이너명을 사용하고, MySQL 캐릭터셋을 utf8mb4를 사용하고, 도커 클라이언트로 3306 포트로 접속한다.
    - 컨테이너 띄우기: docker-compose up -d
```yml
version: '3.7'
services:
  redis:
    container_name: coupon-redis
    image: redis:7.2-alpine
    command: redis-server --port 6380
    labels:
      - "name=redis"
      - "mode=standalone"
    ports:
      - 6380:6380
  mysql:
    container_name: coupon-mysql
    image: ubuntu/mysql:edge
    command: mysqld --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci --explicit_defaults_for_timestamp=1
    ports:
      - 3306:3306
    environment:
      - MYSQL_DATABASE=coupon
      - MYSQL_USER=abcd
      - MYSQL_PASSWORD=1234
      - MYSQL_ROOT_PASSWORD=1234
      - TZ=UTC
    volumes:
      - ./mysql/init:/docker-entrypoint-initdb.d
```

<br/>

### coupon-core 프로젝트

 - `applicattion-core.yml`
    - MySQL, Redis 정보를 설정한다.
```yml
spring:
  config:
    activate:
      on-profile: local
  datasource:
    hikari:
      jdbc-url: jdbc:mysql://localhost:3306/coupon?useUnicode=yes&characterEncoding=UTF-8&rewriteBatchedStatements=true
      driver-class-name: com.mysql.cj.jdbc.Driver
      maximum-pool-size: 10
      max-lifetime: 30000
      connection-timeout: 3000
      username: abcd
      password: 1234
  jpa:
    hibernate:
      ddl-auto: none
    show-sql: true
    properties:
      hibernate:
        format_sql: true
  data:
    redis:
      host: localhost
      port: 6380

```
<br/>

## 3. 부하 테스트툴 설정

Locust는 Python으로 작성된 고성능 로드 테스트 도구입니다. 이는 대규모 웹 애플리케이션 및 웹 사이트의 성능을 테스트하고 스케일링에 대한 실제 부하를 시뮬레이션하는 데 사용됩니다. 기본적으로, Locust는 코드를 사용하여 가상 사용자를 생성하고 이러한 사용자의 행동을 정의하고 제어하는 방식으로 동작합니다.  

 - 공식 사이트: https://locust.io/
 - __Python 기반__: Locust는 Python으로 작성되어 있으며 Python의 간결함과 유연성을 제공합니다.
 - __설치 및 사용의 간편성__: Locust를 설치하고 사용하는 것이 간단합니다. 로드 테스트 시나리오를 정의하기 위한 코드는 상대적으로 직관적이며, 사용자가 요구하는 특정 시나리오를 유연하게 작성할 수 있습니다.
 - __가상 사용자 모델링__: Locust는 사용자의 행동을 정의하는 Python 클래스를 사용하여 가상 사용자를 모델링합니다. 이를 통해 웹 애플리케이션의 실제 사용자 행동을 신실하게 시뮬레이션할 수 있습니다.
 - __분산 로드 테스트__: Locust는 여러 대의 컴퓨터에서 동시에 실행되는 여러 Locust 인스턴스를 통해 분산 로드 테스트를 수행할 수 있습니다. 이를 통해 대규모 시스템에 대한 부하 테스트를 더욱 현실적으로 시뮬레이션할 수 있습니다.
 - __실시간 모니터링 및 리포팅__: Locust는 실행 중인 테스트의 성과를 실시간으로 모니터링하고, 결과를 리포팅하는 기능을 제공합니다. 이를 통해 사용자는 테스트의 진행 상황을 실시간으로 파악하고, 성능 문제를 식별하고 해결할 수 있습니다.

<br/>

### Locust 환경 구축

load-test 라는 폴더를 만들어, 부하 테스트에 대한 스크립트를 관리한다.  

 - `docker-compose.yml`
    - 컨테이너 실행: docker-compose up -d
    - 워커 늘리기: docker-compose up -d --scale worker=3
```yml
version: '3.7'
services:
  master:
    image: locustio/locust
    ports:
      - "8089:8089"
    volumes:
      - ./:/mnt/locust
    command: -f /mnt/locust/locustfile-hello.py --master -H http://host.docker.internal:8080

  worker:
    image: locustio/locust
    volumes:
      - ./:/mnt/locust
    command: -f /mnt/locust/locustfile-hello.py --worker --master-host master
```
<br/>

 - `locustfile-hello.py`
```python
from locust import task, FastHttpUser, stats

stats.PERCENTILES_TO_CHART = [0.95, 0.99]

class HelloWorld(FastHttpUser):
    connection_timeout = 10.0
    network_timeout = 10.0

    @task
    def hello(self):
        response = self.client.get("/hello")
```
