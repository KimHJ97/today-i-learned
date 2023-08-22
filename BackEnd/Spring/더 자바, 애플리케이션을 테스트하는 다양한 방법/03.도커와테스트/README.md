# 도커와 테스트

## TestContainers

TestContainers는 자바 기반의 라이브러리로서, 테스트 환경에서 컨테이너화된 데이터베이스, 메시지 브로커, 웹 서비스 등의 외부 시스템과 상호 작용하기 위해 사용되는 도구입니다. 주로 통합 테스트 시에 외부 시스템을 실제 환경과 유사하게 모의(mock)하지 않고 실제 컨테이너로 실행하여 테스트를 수행하는 데 사용됩니다.  
 - [Testcontainers](https://testcontainers.com/)
    - 테스트 실행시 DB를 설정하거나 별도의 프로그램 또는 스크립트를 실행할 필요가 없다.
    - 보다 Production에 가까운 테스트를 만들 수 있다.
 - 컨테이너화된 환경 생성: TestContainers는 테스트 시에 필요한 외부 시스템을 도커 컨테이너로 실행하여 테스트 환경을 구성합니다. 데이터베이스, 메시지 브로커, 웹 서비스 등을 컨테이너로 실행할 수 있습니다.
 - 편리한 설정 및 관리: TestContainers는 자체적으로 컨테이너 생성, 구성 및 관리를 수행합니다. 사용자는 간단한 설정을 통해 필요한 환경을 구성하고, TestContainers가 컨테이너를 관리하게 됩니다.
 - 다양한 컨테이너 타입 지원: 다양한 종류의 컨테이너를 지원합니다. 주요 데이터베이스 (MySQL, PostgreSQL, MongoDB 등), 메시지 브로커 (Kafka, RabbitMQ 등), 웹 서비스 (Elasticsearch, Redis 등) 등을 컨테이너로 실행할 수 있습니다.
 - 자동화된 테스트 수명 주기: TestContainers는 테스트 메서드의 수명 주기 내에서 컨테이너를 시작하고 종료합니다. 이를 통해 테스트의 시작과 종료 시에 필요한 작업을 자동으로 수행할 수 있습니다.
 - 언어 및 프레임워크 지원: TestContainers는 Java 기반의 프로젝트뿐만 아니라 JUnit, TestNG, Spock 등 다양한 테스트 프레임워크와 함께 사용할 수 있습니다.

<br/>

## 테스트용 DB(H2 DB) 사용하기

보통 테스트 코드에서 DB 작업에 대해서 인메모리 데이터베이스인 H2 DB를 사용할 수 있다.  

 - pom.xml 의존성 추가하기
```XML
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency>
```
 - application.properties DB 설정 추가하기
    - 'test/java/resources/applicaion-test.properties' 파일을 만든다.
```properties
spring.datasource.url=jdbc:h2:memory:/studydb
spring.datasource.username=sa
spring.datasource.password=password
spring.datasource.driver-class-name=org.h2.Driver

spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
```
 - StudyServiceTest
    - H2 DB를 통해 Repository로 실제 DB에 CRUD 작업을 테스트할 수 있다.
    - @SpringBootTest
        - 해당 어노테이션 내부의 @ExtendWith({SpringExtension.class})가 정의되어 있어 JUnit5에 대해서 SpringExtension 확장이 적용되어 있다.
        - @SpringBootApplication이 붙어있는 메인 클래스를 찾고, 컴포넌트 스캔으로 모든 빈을 등록한다.
    - StudyRepository를 @Mock이 아닌, @Autowired로 실제 객체를 주입받는다.
```Java
@SpringBootTest
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class StudyServiceTest {

    @Mock MemberService memberService;

    @Autowired StudyRepository studyRepository;

    ..
}
```

<br/>

## 테스트와 개발 동일한 DB 사용하기

테스트 코드에서 DB 작업을 테스트하기 위해 H2 DB를 이용할 수 있다.  
하지만, 개발용 DB와 운영용 DB와 빌드용 DB 등을 모두 동일한 데이터베이스를 사용하고 싶을 수 있다.  
그 이유로는 테스트에서 사용되는 인메모리 DB와 실제 운영에서 사용하는 DB가 다르면 서로 다르게 동작할 수 있기 때문이다.  
가령 스프링에서 트랜잭션을 이용하는 경우 기본적으로 DB에서 제공하는 Isolcation을 따르게 된다.  
때문에, DB가 다르면 로컬이나 CI 환경에서 발견하지 못한 문제가 운영 환경에서 발견될 수 있다.  

 - docker
    - 개발용 DB와 테스트용 DB 컨테이너를 실행한다.
```sh
## 개발용 DB
$ docker run -p 5432:5432 --name study-db -e POSTGRES_USER=study -e POSTGRES_PASSWORD=study -e POSTGRES_DB=study -d postgres

## 테스트용 DB
$ docker run -p 15432:5432 --name study-testdb -e POSTGRES_USER=studytest -e POSTGRES_PASSWORD=studytest -e POSTGRES_DB=studytest -d postgres
```

 - application.properties
    - 개발용 DB와 테스트용 DB에 대해서 동일한 DB를 사용하도록 한다.
    - 다만, 도커를 통해 테스트용 DB를 만들어 사용한다.
```properties
# 'main/java/resources/application.properties'
spring.jpa.hibernate.ddl-auto=update

spring.datasource.url=jdbc:postgresql://localhost:5432/study
spring.datasource.username=study
spring.datasource.password=study

# 'test/java/resources/application-test.properties'
spring.jpa.hibernate.ddl-auto=create-drop

spring.datasource.url=jdbc:postgresql://localhost:15432/studytest
spring.datasource.username=studytest
spring.datasource.password=studytest
```

<br/>

## Testcontainers 사용하기

직접 개발용 DB와 테스트용 DB를 도커 컨테이너로 만들어서 테스트를 진행할 수 있었다.  
하지만, 이러한 방법은 관리해야하는 스크립트가 늘어나고, 테스트를 실행하기 전에 테스트용 DB 컨테이너가 실행 중이어야 한다.  
이러한 불편함을 Testcontainers 라이브러리를 이용하여 해결할 수 있다.  
 - https://java.testcontainers.org/test_framework_integration/junit_5/

<br/>

 - pom.xml 의존성 추가
    - Testcontainers에 여러 모듈을 제공하는데 각 모듈은 별도로 설치해야 한다.
    - https://java.testcontainers.org/modules/databases/
```XML
<!-- Testcontainers -->
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>1.12.4</version>
    <scope>test</scope>
</dependency>

<!-- Testcontainers Postgresql 모듈 -->
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <version>1.12.4</version>
    <scope>test</scope>
</dependency>
```

 - application-test.properties
    - Testcontainers가 DB 컨테이너를 띄어줄 때 port가 임의로 띄어지게 된다.
    - 떄문에, Datasource에 대한 url와 driver를 변경하여 Testcontainers 드라이버가 자동으로 찾아주도록한다.
```properties
spring.datasource.url=jdbc:tc:postgresql:///studytest
spring.datasource.driver-class-name=org.testcontainers.jdbc.ContainerDatabaseDriver

spring.jpa.hibernate.ddl-auto=create-drop
```

 - StudyServiceTest
    - @Testcontainers
        - JUnit 5 확장팩으로 테스트 클래스에 @Container를 사용한 필드를 찾아서 컨테이너 라이프 사이클 관련 메소드를 실행해준다.
     - @Container
        - 인스턴스 필드에 사용하면 모든 테스트마다 컨테이너를 재시작하고, 스태틱 필드에 사용하면 클래스 내부 모든 테스트에서 동일한 컨테이너를 재사용한다.
```Java
// Testcontainers 객체를 직접 사용하여 컨테이너 띄우기
@SpringBootTest
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class StudyServiceTest {

    @Mock MemberService memberService;

    @Autowired StudyRepository studyRepository;

    static PostgreSQLContainer postgreSQLContainer = new PostgreSQLContainer().withDatabaseName("studytest");

    @BeforeAll
    static void beforeAll() {
        postgreSQLContainer.start();
    }

    @AfterAll
    static void afterAll() {
        postgreSQLContainer.stop();
    }

    ..
}

// @Testcontainers와 @Container 어노테이션 이용하기
@SpringBootTest
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@Testcontainers
class StudyServiceTest {

    @Mock MemberService memberService;

    @Autowired StudyRepository studyRepository;

    @Container
    static PostgreSQLContainer postgreSQLContainer = new PostgreSQLContainer().withDatabaseName("studytest");

    @BeforeEach
    void beforeEach() {
        studyRepository.deleteAll();
    }

    ..
}
```

<br/>

## Testcontainers 기능 살펴보기

때로 Testcontainers에서 지원하지 않는 모듈에 대해서 컨테이너를 띄우고 테스트하고 싶은 경우가 있다. 이러한 경우 GenericContainer 클래스를 이용하여 이미지 이름을 통해 컨테이너를 사용할 수 있다.  
다만, 단순히 이미지를 통해 컨테이너를 띄우는 것이기 때문에 데이터베이스에 특화된 메서드는 제공되지 않는다. (ex: withDatabaseName())  
이러한 특정 값들은 환경 변수 설정으로 세팅해야한다.  
※ Testcontainers는 호스트 포트를 직접 지정할 수 없다. 항상 충돌되지 않고 사용 가능한 포트 중에 하나를 찾아서 실행하게 되어있다. 그렇게 랜덤하게 매핑한 포트 정보를 확인할 수 있는 메서드가 제공되기는 하다.
※ __GenericContainer 클래스를 이용하여 직접 이미지를 지정하여 테스트 컨테이너를 띄우기 위해서는 'quay.io/testcontainers/ryuk' 이미지가 로컬에 pull 되어야한다.__ [참고](https://github.com/OpenLiberty/guide-microshed-testing/issues/67)
 - 컨테이너 만들기
    - new GenericContainer(String imageName)
 - 네트워크
    - withExposedPorts(int...)
    - getMappedPort(int)
 - 환경 변수 설정
    - withEnv(key, value)
 - 볼륨 설정
    - withClasspathResourceMapping(호스트경로, 컨테이너경로, BindMode.READ_ONLY)
 - 명령어 실행
    - withCommand(String cmd...)
 - 사용할 준비가 됐는지 확인하기
    - waitingFor(Wait)
    - Wait.forHttp(String url)
    - Wait.forLogMessage(String message)
 - 로그 살펴보기
    - getLogs()
    - followOutput()
```Java
@SpringBootTest
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@Testcontainers
@Slf4j
class MyClassTest {

    // Logger LOGGER = LoggerFactory.getLogger(MyClassTest.class);

    @Container
    static GenericContainer container = new GenericContainer("postgres")
            .withExposedPorts(5432)
            .withEnv("POSTGRES_DB", "studytest")
            .withEnv("POSTGRES_PASSWORD", "studytest")
            .withEnv("POSTGRES_USER", "studytest");

    @BeforeAll
    static void beforeAll() {
        Slf4jLogConsumer logConsumer = new Slf4jLogConsumer(log);
        container.followOutput(logConsumer);
    }

    @BeforeEach
    void beforeEach() {
        // 호스트 포트
        int mappedPort = container.getMappedPort(5432);
        String logs = container.getLogs();
    }
}
```

<br/>

## 컨테이너 정보를 스프링 테스트에서 참조하기

 - @ContextConfiguration
    - 스프링이 제공하는 애노테이션으로, 스프링 테스트 컨텍스트가 사용할 설정 파일 또는 컨텍스트를 커스터마이징할 수 있는 방법을 제공한다.
 - ApplicationContextInitializer
    - 스프링 ApplicationContext를 프로그래밍으로 초기화 할 때 사용할 수 있는 콜백 인터페이스로, 특정 프로파일을 활성화 하거나, 프로퍼티 소스를 추가하는 등의 작업을 할 수 있다.
 - TestPropertyValues
    - 테스트용 프로퍼티 소스를 정의할 때 사용한다.
 - Environment
    - 스프링 핵심 API로, 프로퍼티와 프로파일을 담당한다.
 - 전체 흐름
    - Testcontainer를 사용해서 컨테이너 생성
    - ApplicationContextInitializer를 구현하여 생선된 컨테이너에서 정보를 축출하여 Environment에 넣어준다.
    - @ContextConfiguration을 사용해서 ApplicationContextInitializer 구현체를 등록한다.
    - 테스트 코드에서 Environment, @Value, @ConfigurationProperties 등 다양한 방법으로 해당 프로퍼티를 사용한다.

```Java
@SpringBootTest
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@Testcontainers
@Slf4j
@ContextConfiguration(initializers = MyClassTest.ContainerPropertyInitializer.class)
class MyClassTest {

    // Logger LOGGER = LoggerFactory.getLogger(MyClassTest.class);

    @Autowired Environment environment;

    @Value("${container.port}") int port;

    @Container
    static GenericContainer container = new GenericContainer("postgres")
            .withExposedPorts(5432)
            .withEnv("POSTGRES_DB", "studytest")
            .withEnv("POSTGRES_PASSWORD", "studytest")
            .withEnv("POSTGRES_USER", "studytest");

    @BeforeAll
    static void beforeAll() {
        Slf4jLogConsumer logConsumer = new Slf4jLogConsumer(log);
        container.followOutput(logConsumer);
    }

    @BeforeEach
    void beforeEach() {
        // 호스트 포트
        environment.getProperty("container.port");
    }

    static class ContainerPropertyInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

        @Override
        public void initialize(ConfigurableApplicationContext context) {
            TestPropertyValues.of("container.port=" + container.getMappedPort(5432))
                    .applyTo(context.getEnvironment());
        }
    }
}
```

<br/>

## Testcontainers 도커 컴포즈 사용하기

Testcontainers에서는 도커 컴포즈를 읽어서 여러 개의 컨테이너를 띄울 수도 있다.  
 - Docker Compose: https://docs.docker.com/compose/
    - 여러 컨테이너를 한번에 띄우고 서로 간의 의존성 및 네트워크 등을 설정할 수 있는 방법
    - docker-compose up / down
 - Testcontainser의 docker compose 모듈을 사용할 수 있다.
    - https://www.testcontainers.org/modules/docker_compose/
 - 대체 라이브러리
    - https://github.com/palantir/docker-compose-rule


<br/>

 - docker-compose.yml
    - 'src/test/java/resoureces/docker-compose.yml'
```YML
version: "3"

services:
  study-db:
    image: postgres
    ports:
      - 5432:5432
    environment:
      POSTGRES_PASSWORD: study
      POSTGRES_USER: study
      POSTGRES_DB: study
```

 - 
```Java
@SpringBootTest
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@Testcontainers
@Slf4j
@ContextConfiguration(initializers = MyClassTest.ContainerPropertyInitializer.class)
class MyClassTest {

    @Value("${container.port}") int port;

    @Container
    static DockerComposeContainer composeContainer =
            new DockerComposeContainer(new File("src/test/resources/docker-compose.yml"))
            .withExposedService("study-db", 5432);

    static class ContainerPropertyInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

        @Override
        public void initialize(ConfigurableApplicationContext context) {
            TestPropertyValues.of("container.port=" + composeContainer.getServicePort("study-db", 5432))
                    .applyTo(context.getEnvironment());
        }
    }
}
```