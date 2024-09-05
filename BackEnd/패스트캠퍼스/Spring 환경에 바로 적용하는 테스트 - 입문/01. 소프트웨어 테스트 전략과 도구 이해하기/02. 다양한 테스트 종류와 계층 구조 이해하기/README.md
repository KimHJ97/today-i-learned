# 다양한 테스트 종류와 계층 구조 이해하기

## JUnit 5

 - 자바 프로그래밍 언어용 Unit Test Framework 
 - 테스트를 위한 API로 JUnit Jupiter API를 제공한다. 
 - 최신 버전은 JUnit5이고, JDK-1.8 이상부터 사용 가능하다. 
 - 컴포넌트는 JUnit Platform과 JUnit Jupiter, Junit Vintage으로 구성되어 있다. 

### JUnit 5 환경 구성

Spring Boot 2.2+ 부터는 기본적으로 의존성이 추가되어 별도로 의존성을 추가하지 않아도 된다.  

```groovy
dependencies {
    testImplementation 'org.junit.jupiter:junit-jupiter-api:5.6.0'
    testRuntimeOnly 'org.junit.jupiter:junit-jupiter-engine'
}
```

### JUnit 5 사용법

 - @Test
    - 테스트 메서드 위에 정의
    - 반환 타입은 void로 선언
```java
@Test
void test() {
    assertEquals(1, 1);
}
```

 - 단언 메서드
    - 단언 메서드는 테스트의 실행 결과를 판별해주는 메서드를 말한다.
    - assertEquals(expected, actual): 실제 값이 기대하는 값과 같은지 검사한다.
    - fail(): 테스트를 실패시킨다.
    - assertThrows(): 메서드 수행시 예외가 발생할 것을 예상하여 검사한다.
```java
@Test
void test() {
    String exprected = "A";
    String actual = "A";
    assertEquals(expected, actual);
}

@Test
void failTest() {
    try {
        // 1 / 0은 ArithmeticException 예외가 발생한다. fail()이 수행되지 않는다.
        int divideResult = 1 / 0;
        fail();
    } catch (ArithmeticException e) {

    }
}

@Test
void throwsTest() {
    Assertions.assertThrows(ArithmeticException.class, () => {
        int divideResult = 1 / 0;
    })
}
```

 - 라이프 사이클
    - @BeforeAll
        - 테스트가 실행 전 1번만 수행된다.
        - static 메서드 위에 선언
    - @AfterAll
        - 테스트가 종료 후 1번만 수행된다.
        - static 메서드 위에 선언
    - @BeforeEach
        - 각 테스트 실행 전마다 수행된다.
        - 테스트를 실행하는데 필요한 준비 작업을 할 때 사용
    - @AfterEach
        - 각 테스트 종료 마다 수행된다.
        - 테스트 실행 후 리소스를 정리할 때 사용
```java
public class Test {
    @BeforeAll
    static void beforeAll() {
        System.out.println("BeforeAll");
    }

    @BeforeEach
    void beforeEach() {
        System.out.println("BeforeEach");
    }

    @AfterAll
    static void afterAll() {
        System.out.println("AfterAll");
    }

    @AfterEach
    void afterEach() {
        System.out.println("AfterEach");
    }

    @Test
    void test() {
        System.out.println("Test");
        assertEquals(1, 1);
    }
}
```

## nGrinder

nGrinder란, NHN에서 진행한 오픈소스 프로젝트로 서버의 부하 테스트를 위한 도구이다.  
nGrinder의 경우, Script 수정을 통해서 세밀한 성능 테스트를 진행 할 수 있고, Junit 기반으로 되어 있어서 IDE에서 먼저 확인 해보고 디버깅할 수 있다.  

 - Controller
    - 성능 측정을 위한 웹 인터페이스 제공
    - 테스트 프로세스 조정
    - 테스트 통계 수집 및 표시
    - 스크립트 수정 기능 제공
 - Agent
    - 에이전트 모드에서 실행할 때 대상 시스템에 부하를 주는 프로세스 및 쓰레드를 실행
    - 모니터 모드에서 실행 시, 대상 시스템 성능 모니터링

### nGrinder 환경 구성

 - JDK 11 설치
    - https://www.oracle.com/kr/java/technologies/javase/jdk11-archive-downloads.html
```java
echo -e '
export JAVA_HOME="/Users/user/dev/jdk/jdk-11.0.21.jdk/Contents/Home"
export PATH="$PATH:$JAVA_HOME/bin"
' >> ~/.bashrc
source ~/.bashrc

java --version
```

 - nGrinder Controller 설치
    - https://github.com/naver/ngrinder/releases/
    - 적절한 버전을 선택 후 *.war 파일 다운로드
```bash
java -jar -Djava.io.tmpdir=./tmp ngrinder-controller-3.5.9.war --port=8300
```

 - Web UI 접속
    - 초기 ID: admin
    - 초기 PW: admin

 - Agent 설치
    - nGrinder Agent는 Controller의 Web UI안에서 다운로드 받을 수 있다.
```
★ Agent tar 파일 다운로드
계정 > Download Agent 클릭

★ Agent 실행
1. tar 파일 압축 해제
2. agent 실행
 - run_agent.bat
 - run_agent.sh
```

### 성능 테스트 엔드포인트 및 시나리오 설정

 - 엔드포인트 설정
    - WebUI > Script > Create > Create a script
        - Script 종류: Groovy
        - Script 이름: 이름
        - URL to be tested: GET
        - Type URL: https://www.google.com
 - 성능 테스트 시나리오 설정
    - WebUI > Performance Tests > Create Test
        - Agent: 1
        - Vuser per agent: 100
        - Script: 엔트포인트 선택
        - Duration: 3분
        - Run Count: None
        
## JMeter

서버가 제공하는 서비스에 대한 성능, 부하, 스트레스에 대한 수치를 측정하고 사용자에게 보여주는 테스트 도구를 말한다.  

 - JMeter의 경우, 개발되어 있는 기능만 사용할 수 있다.
 - JMeter의 경우, Java Swing으로 개발되어 IDE와 연동은 불가하다

### JMeter 환경 구성

 - https://jmeter.apache.org
     - jmeter.bat, jmeter.sh 실행

### JMeter 성능 테스트

 - Thread 생성
    - 테스트 계획 우클릭 > Add > Threads > Thread Group
        - Number of Threads: 가상 사용자 수
        - Ramp-up period: 요청 주기(초 단위)
        - Loop Count: 테스트를 반복하는 횟수
 - Sampler 생성
    - Thread Group 우클릭 > Sampler > HTTP Request
        - Protocol: 통신 프로토콜 선택(기본값: HTTP)
        - Server Name or IP: 엔드포인트의 IP 또는 호스트 주소
        - Port Number: 엔드포인트의 서비스 포트 번호
        - HTTP Request: HTTP Method 선택
        - Path: 엔드포인트 경로
 - lISTENER 생성
    - Test Plan 우클릭 : Add > Listener > View Results Tree 메뉴 클릭

## 운영 이슈 테스트: Chaos Monkey 소개 및 활용법

클라우드 기반 분산 시스템 환경에서 시스템의 신뢰성을 확인하기 위해, 인위적인 혼돈(Chaos)을 가하여 시스템의 취약한 부분을 찾고 보강하는 방식의 엔지니어링 기법을 말한다.  
여기서 말하는 인위적인 혼돈은 응답 지연, 네트워크 지연, 예외 발생, 애플리케이션 종료, 메모리 누수 등을 말한다.  
 - 시스템이 비정상적인 조건에서 어떻게 동작하는지 확인함으로써, 예상치 못한 결합(or 장애)를 찾고 이를 해결하여 전체적인 시스템의 아키텍처에 대한 신뢰성을 높이고, 안정적인 서비스를 제공하기 위함.

Chaos Monkey란 카오스 엔지니어링을 간편하게 테스트 할 수 있도록 기능을 제공하는 도구(Tool)이다. Chaos Monkey는 Netflix에 개발했다. SpringBoot에 적용할 수 있는 적용 라이브러리(Chaos Monkey For Spring Boot)도 제공한다.  
 - AOP를 이용해서 공격 대상(특정 어노테이션이 붙은 클래스의 메서드)이 호출된 경우, 해당 Watcher 활성화 부여를 판단한 후, 활성화된 공격 유형(Assaults) 중 랜덤하게 하나씩 골라서 공격한다.
 - 공격 대상(Watcher): @Controller, @RestController, @Service, @Repository, @Componenet
 - 공격 유형(Assaults): 응답 지연, 예외 발생, 애플리케이션 조욜, 메모리 누수

### Chaos Monkey 환경 구성

 - build.gradle
```groovy
dependencies {
    implementation("de.codecentric:chaos-monkey-spring-boot:3.1.0")
    implementation("org.springframework.boot:spring-boot-starter-actuator")

}
```

 - application.yml
    - Actuator 관련 설정과 Chaos Monkey 관련 설정
```yml
# 카오스 몽키 공격 대상 설정
chaos:
  monkey:
    watcher:
      enabled: false # 활성화 여부
      repository: true
      rest-controller: true

management:
  endpoint:
    chaosmonkey:
      enabled: true
    chaosmonkeyjmx:
      enabled: true
  endpoints:
    web:
      exposure:
        include:
          - health
          - info
          - chaosmonkey
```

### Chaos Monkey

```bash
# Chaos Monkey 활성화 상태 조회
curl --location 'http://localhost:8080/actuator/chaosmonkey/status'

# Chaos Monkey 활성화
curl --location 'http://localhost:8080/actuator/chaosmonkey/enable'

# Chaos Monkey 응답 지연 설정
curl --location 'http://localhost:8080/actuator/chaosmonkey/assaults' \
--header 'Content-Type: application/json' \
--data '{
    "level": 1,
    "latencyRangeStart": 10000,
    "latencyRangeEnd": 20000,
    "latencyActive": true
}
'

# Chaos Monkey 응답 지연 설정 확인
curl --location 'http://localhost:8080/actuator/chaosmonkey/assaults'
```

## ArchUnit 소개 및 사용법

ArchUnit은 프로젝트의 아키텍처의 규칙을 Test 코드로 표현하고 규칙의 위배되는 패키지 및 파일이 없는지 검사하고 검사 결과 유무에 따라 Fail과 Success를 리턴하는 유닛 테스트를 말한다.  
프로젝트 내에 Package, Class, Layer 간의 규칙을 위배되는 dependency와 Circular dependency(순환 참조)에 대한 점검을 통해서 객체 간의 관계를 강제화 시키는 일을 할 수 있다.  

### ArchUnit 환경 구성

 - build.gradle
```groovy
dependencies {
    // ArchUnit
    implementation("com.tngtech.archunit:archunit:1.2.1")
    testImplementation("com.tngtech.archunit:archunit-junit5:1.2.1")
}
```

### ArchUnit 예시

```java
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

@AnalyzeClasses(packages = "com.example")
public class ArchUnitTests {

    @ArchTest
    public static final ArchRule 컨트롤러는_서비스패키지만_접근가능하다=
        classes().that().resideInAnyPackage("..controller..")
            .should().accessClassesThat().resideInAnyPackage("..service..")
            .orShould().accessClassesThat().resideInAnyPackage("..http..");

    @ArchTest
    public static final ArchRule 컨트롤러는_레파지토리패키지에_접근불가하다=
        noClasses().that().resideInAnyPackage("..controller..")
            .should().accessClassesThat().resideInAnyPackage("..repository..");
}
```

```java
@AnalyzeClasses(packages = "com.example")
public class LayeredArchitectureTests {

    @aRCHtEST
    Architectures.LayeredArchitecture layeredArchitectureRule = layeredArchitecture()
            .consideringAllDependencies()
            .layer("Controller").definedBy("..controller..")
            .layer("Service").definedBy("..service..")
            .layer("Repository").definedBy("..repository..")
            .whereLayer("Controller").mayNotBeAccessedByAnyLayer()
            .whereLayer("Service").mayOnlyBeAccessedByLayers("Controller")
            .whereLayer("Repository").mayOnlyBeAccessedByLaYERS("Service");
}
```
