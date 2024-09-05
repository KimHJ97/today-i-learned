# 테스트 프레임워크 활용법 탐구하기

## JUnit 5

 - @ParameterizedTest
    - 테스트에 필요한 매개변수를 전달해주는 어노테이션
    - @ValuesSource, @CsvSource를 사용하여 매개변수를 지정할 수 있다.
 - @RepeatedTest
    - 지정된 횟수(value)만큼 반복적으로 실행되도록 설정하는 어노테이션
    - getCurrentRepetition(): 현재 반복 횟수
    - getTotalRepetitions(): 총 반복 횟수
 - @Timeout
    - 단위 테스트에 대한 시간 제한 설정하는 어노테이션
    - 주어진 시간 안에 테스트가 끝나지 않으면 에러 발생하고 실패 처리
```java
@ParameterizedTest
@ValueSource(strings = {"", " "})
@NullAndEmptySource
void valueSourceTest(String param) {
    System.out.println(param);
}

@ParameterizedTest
@CsvSource(value = {"1, 2", "3, 4", "5, 6"})
void csvSourceTest(int input, int expected) {
    assertEquals(expected, input + 1);
}

@RepeatedTest(value = 10)
void repeatedTest(RepetitionInfo info){
    System.out.println("repetitionInfo = " + info.getCurrentRepetition() + "/" + info.getTotalRepetitions());
}

@Test
@Timeout(3) // 3초
void timeoutTest() throws InterruptedException {
    sleep(4000);
}
```

 - @TestFactory
    - 테스트 케이스를 생성하는 팩토리
    - @TestFactory 어노테이션이 붙은 메서드는 private 및 static으로 선언할 수 없다.
```java
@SpringBootTest
@Transactional
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY, connection = EmbeddedDatabaseConnection.H2)
@ActiveProfiles("test")
public class TestFactoryExample {
    @Autowired
    private PerformanceRepository performanceRepository;

    @Autowired
    private TicketingService ticketingService;

    @TestFactory
    Stream<DynamicTest> 통합_테스트_예시() {
        return Stream.of(
            dynamicTest("공연 정보 저장 테스트", () -> {
                // Given
                Performance p = new Performance();

                // When
                performanceRepository.save(p);
                Performance insertedPerformance = performanceRepository.findByName("레베카");

                // Then
                Assertions.assertNotNull(insertedPerformance);
                Assertions.assertEquals(p.getName(), insertedPerformance.getName());
                Assertions.assertEquals(p.getStartDate(), insertedPerformance.getStartDate());
            }),
            dynamicTest("공연 예약 테스트", () -> {
                // Given
                Performance insertedPerformance = performanceRepository.findByName("레베카");
                Ticket t = new Ticket();

                // When
                Ticket reservedTicket = ticketingService.ticketing(t);

                // Then
                Assertions.assertEquals(t, reservedTicket);
            }
        )
    }
}
```

## Mockito

Mockito는 Java에서 단위 테스트(Unit Test)를 할 때 널리 사용되는 Mocking Framework입니다. 이 프레임워크를 사용하면, 실제 객체를 생성하지 않고, 가짜(Mock) 객체를 만들어 테스트할 수 있습니다. 이렇게 하면 외부 종속성(예: 데이터베이스, 웹 서비스 등)을 분리하고, 특정 클래스나 메서드의 동작만을 독립적으로 테스트할 수 있습니다.  

모킹을 처리하는 이유는 주요 관심사에 집중하기 위함이다.  

 - Mock 객체 생성
    - Mockito는 실제 객체의 동작을 흉내 내는 Mock 객체를 생성합니다. 이를 통해 테스트하고자 하는 객체와 의존성이 있는 객체를 가짜로 만들어 독립적인 테스트가 가능합니다.
```java
MyClass mockObject = Mockito.mock(MyClass.class);
```

 - 메서드 동작 설정
    - 특정 메서드가 호출될 때 어떤 동작을 하도록 설정할 수 있습니다. 예를 들어, mockObject.someMethod()가 호출되면 특정 값을 반환하게 할 수 있습니다.
```java
when(mockObject.someMethod()).thenReturn(someValue);
```

 - 호출 여부 검증
    - 특정 메서드가 호출되었는지 확인할 수 있습니다. 이 기능은 객체가 예상한 대로 동작했는지 검증할 때 유용합니다.
```java
verify(mockObject).someMethod();
```

 - 인자 검사
    - 메서드가 호출될 때 전달된 인자가 예상한 것과 일치하는지 확인할 수 있습니다.
```java
verify(mockObject).someMethod(specificArg);
```

 - 메서드 예외 처리
    - 특정 메서드가 호출될 때 예외를 발생시키도록 설정할 수도 있습니다. 이를 통해 예외 상황을 테스트할 수 있습니다.
```java
when(mockObject.someMethod()).thenThrow(new RuntimeException("Error"));
```

 - 스파이
    - 실제 객체를 생성하고, 그 객체의 일부 메서드는 실제로 실행하면서, 다른 메서드는 모킹할 수 있습니다. 이를 통해 실제 객체의 동작과 모킹을 혼합한 테스트를 수행할 수 있습니다.
```java
MyClass spyObject = Mockito.spy(new MyClass());
```

### Mockito 사용법

 - Mockito.mock() 메서드 사용
```java
@Test
@DisplayName("Mockito를 이용하여 Mocking 하기")
void createStudyService() {
    MemberService memberService = Mockito.mock(MemberService.class);
    StudyRepository studyRepository = Mockito.mock(StudyRepository.class);

    StudyService studyService = new StudyService(memberService, studyRepository);

    assertNotNull(studyService);
}
```

 - @Mock 어노테이션 사용
    - 테스트 클래스 위에 확장팩을 정의한다.
```java
@ExtendWith(MockitoExtension.class)
class StudyServiceTest {

    @Mock
    MemberService memberService;

    @Mock
    StudyRepository studyRepository;

    @Test
    @DisplayName("@Mock 어노테이션을 이용하여 Mocking 하기")
    void createStudyService() {
        StudyService studyService = new StudyService(this.memberService, this.studyRepository);

        assertNotNull(studyService);
    }

    @Test
    @DisplayName("@Mock 어노테이션 파라미터에서 Mocking 하기")
    void createStudyService2(
            @Mock MemberService memberService,
            @Mock StudyRepository studyRepository) {
        StudyService studyService = new StudyService(this.memberService, this.studyRepository);

        assertNotNull(studyService);
    }
}
```

 - @MockBean 사용
    - 용도: Spring Boot 환경에서 스프링 빈을 모킹할 때 사용됩니다.
    - 특징: @Mock과 유사하지만, Spring Application Context에 등록된 Bean을 모킹하기 위해 사용됩니다. 주로 Spring Boot 통합 테스트에서 서비스나 리포지토리 빈을 Mocking할 때 사용됩니다.
    - Spring Context: @MockBean은 Spring의 ApplicationContext에 Mock 객체를 주입하기 때문에 Spring의 다른 Bean이 이 모킹된 객체를 사용할 수 있습니다.
```java
@SpringBootTest
public class MyServiceIntegrationTest {

    @MockBean
    private MyRepository myRepository;  // Spring 컨텍스트에 등록된 Mock 객체

    @Test
    public void testServiceWithMockRepository() {
        when(myRepository.findSomething()).thenReturn(someValue);
        // Spring의 실제 환경에서 테스트 진행
    }
}
```

 - @InjectMocks
    - 용도: 모킹된 객체(@Mock으로 생성된 객체들)를 주입해 테스트하려는 실제 객체를 생성할 때 사용됩니다.
    - 특징: Mockito는 이 어노테이션이 붙은 객체에 @Mock으로 생성된 객체들을 자동으로 주입하여 의존성을 해결합니다. 즉, 테스트 대상 객체의 내부에 있는 의존성 객체들을 모킹한 후, 그 모킹된 객체들을 테스트 대상에 주입하는 역할을 합니다.
    - 의존성 주입: @InjectMocks는 생성자, 세터, 필드 주입 방식으로 Mock 객체를 주입할 수 있습니다. 테스트하려는 실제 클래스에 모킹된 의존성들이 주입됩니다.
```java
public class MyServiceTest {

    @Mock
    private MyRepository myRepository;  // Mock 객체

    @InjectMocks
    private MyService myService;  // Mock 객체가 주입된 실제 객체

    @Test
    public void testServiceMethod() {
        when(myRepository.findSomething()).thenReturn(someValue);
        // myService에서 myRepository가 자동으로 Mock 객체로 주입됨
    }
}
```

## @WebMvcTest

@WebMvcTest는 Spring Boot에서 컨트롤러(Controller) 계층만을 테스트할 때 사용하는 어노테이션입니다. 이 어노테이션을 사용하면, **웹 계층(Web Layer)**에 집중하여 테스트를 수행할 수 있도록 필요한 빈(Bean)들만 로드하고, 서비스나 데이터베이스와 같은 다른 계층의 빈들은 로드하지 않습니다.  

 - 웹 계층만 테스트:
    - @WebMvcTest는 Spring MVC의 웹 관련 컴포넌트들(컨트롤러, 필터, 인터셉터 등)만 로드합니다. 따라서 Service, Repository 등의 계층은 로드되지 않고, Controller와 관련된 빈만 활성화됩니다.
    - 주로 HTTP 요청과 응답을 테스트하고, 컨트롤러가 의도한 대로 작동하는지를 검증하는 데 사용됩니다.
 - 필요한 빈만 로드:
    - @WebMvcTest는 웹과 관련된 빈만 로드하기 때문에 테스트가 가볍고 빠르게 실행됩니다.
    - MockMvc와 같은 도구를 통해, 실제 서블릿 컨테이너를 구동하지 않고도 MVC 동작을 검증할 수 있습니다.
 - @Controller 또는 @RestController에 집중:
    - @WebMvcTest는 컨트롤러의 특정 동작을 테스트하기 위해 사용됩니다. 컨트롤러와 관련된 모든 애플리케이션 컨텍스트를 초기화하는 대신, 지정된 컨트롤러만 테스트합니다.
    - 컨트롤러의 특정 부분만 테스트하고자 할 때는 @WebMvcTest(SomeController.class)와 같이 컨트롤러 클래스를 명시할 수 있습니다.
 - Mock 서비스 주입:
    - @WebMvcTest는 웹 계층만을 로드하기 때문에, 서비스나 레포지토리 계층은 모킹(Mock)해야 합니다. 이를 위해 **@MockBean**을 사용하여 필요한 의존성을 모킹할 수 있습니다.
```java
@WebMvcTest(MyController.class)  // MyController를 테스트 대상으로 설정
public class MyControllerTest {

    @Autowired
    private MockMvc mockMvc;  // MockMvc를 사용하여 컨트롤러 동작을 테스트

    @MockBean
    private MyService myService;  // MyService를 Mock으로 주입

    @Test
    public void testGetEndpoint() throws Exception {
        when(myService.getData()).thenReturn("Mocked Data");  // 서비스 계층을 모킹

        mockMvc.perform(get("/my-endpoint"))   // HTTP GET 요청을 시뮬레이션
               .andExpect(status().isOk())     // 상태 코드 200 OK 검증
               .andExpect(content().string("Mocked Data"));  // 응답 내용 검증
    }
}
```

## @SpringBootTest

@SpringBootTest는 Spring Boot에서 애플리케이션을 통합적으로 테스트할 때 사용하는 어노테이션입니다. 이 어노테이션을 사용하면 전체 애플리케이션 컨텍스트가 로드되고, 실제로 애플리케이션이 구동되는 환경에서 테스트가 수행됩니다. 이를 통해 여러 계층(컨트롤러, 서비스, 리포지토리 등)을 통합적으로 테스트할 수 있습니다.  
 - 전체 애플리케이션 컨텍스트 로드:
    - @SpringBootTest는 스프링 부트 애플리케이션을 실제로 구동하는 것처럼 전체 애플리케이션 컨텍스트를 로드합니다. 즉, 모든 빈(Bean)이 애플리케이션의 실제 환경과 동일하게 생성되고 초기화됩니다.
    - 서비스 계층, 리포지토리 계층, 데이터베이스와의 상호작용 등을 포함한 통합 테스트를 실행할 수 있습니다.
 - 통합 테스트:
    - 단위 테스트(Unit Test)와 달리, 애플리케이션의 여러 계층이 서로 어떻게 상호작용하는지를 통합적으로 테스트합니다.
    - 예를 들어, 컨트롤러에서 요청을 처리하고, 서비스가 비즈니스 로직을 수행하며, 레포지토리가 데이터베이스와 상호작용하는 흐름을 전체적으로 테스트할 수 있습니다.
 - 실제 데이터베이스와 통신 가능:
    - @SpringBootTest는 실제 데이터베이스와 연결하거나, 테스트용 임베디드 데이터베이스(H2 같은)를 사용할 수 있습니다. 이를 통해 데이터베이스 통신을 포함한 테스트가 가능합니다.
 - 웹 환경 설정 가능:
    - @SpringBootTest는 기본적으로 웹 환경을 지원하지 않지만, 필요에 따라 실제 웹 서버를 실행하여 테스트할 수 있습니다.
    - webEnvironment 속성을 통해 웹 서버의 실행 방식을 설정할 수 있습니다.


### @SpringBootTest 설정

 - classes 설정
    - Classes 속성에 선언한 클래스의 Bean만 초기화 후 등록한다.
    - Application의 규모가 대규모일 경우, Bean이 많아서 테스트를 실행하는데 소요되는 시간이 많이 걸릴 수 있다. 이럴 때 classes 설정을 사용해 우회할 수 있다.
    - @Configuration으로 지정한 Bean도 등록할 수 있다.
```java
@SpringBootTest(classes = {TicketController.class, TicketService.class})
```

 - webEnvironment 설정
    - Spring Boot의 내장되어 있는 톰캣 서버의 설정을 할 수 있는 속성이다.
        - WebEnvironment.NONE: 웹 서버를 실행하지 않음.
        - WebEnvironment.MOCK: MockMvc를 사용해 가짜 웹 환경에서 테스트.
        - WebEnvironment.RANDOM_PORT: 실제 내장 서버를 구동하고 무작위 포트로 테스트.
        - WebEnvironment.DEFINED_PORT: 지정된 포트에서 실제 서버 구동.
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
```

 - @ActiveProfiles
    - Spring Boot의 application.yml 혹은 application.properties의 profile 설정을 통해서 테스트에 적절한 설정 값을 읽어 올 수 있게 한다.
```java
@ActiveProfiles("local")
```

 - @AutoConfigureTestDatabase
    - 테스트에 사용될 DB에 대한 구성 및 설정할 때 사용되는 어노테이션
    - 내장형 Test DB로 선택 및 설정할 수 있다.
    - 환경에 맞게 구축된 실 서비스 DB를 선택할 수도 있다.
    - replace:
        - 테스트 중에 사용할 데이터베이스를 대체할지 여부를 결정합니다. 이 속성의 기본값은 AutoConfigureTestDatabase.Replace.ANY입니다. 주요 옵션은 다음과 같습니다:
        - AutoConfigureTestDatabase.Replace.ANY: 데이터 소스가 임베디드 데이터베이스로 대체됩니다. 테스트에서 임베디드 데이터베이스가 있으면 그걸 사용하고, 없으면 실제 데이터베이스가 사용됩니다.
        - AutoConfigureTestDatabase.Replace.NONE: 데이터베이스 설정을 대체하지 않습니다. 즉, 실제 데이터베이스가 설정되어 있으면 그대로 사용합니다.
    - connection:
        - 사용할 데이터베이스 연결 유형을 지정합니다. 예를 들어, H2, HSQLDB, Derby와 같은 임베디드 데이터베이스를 명시할 수 있습니다.
```java
@SpringBootTest
@AutoConfigureTestDatabase(
    replace = AutoConfigureTestDatabase.Replace.NONE,
    connection = EmbeddedDatabaseConnection.H2
)
public class MyRepositoryTest {

}
```

## @DataJpaTest

@DataJpaTest는 Spring Boot에서 JPA 관련 테스트를 수행할 때 사용하는 어노테이션입니다. 이 어노테이션은 데이터베이스와 관련된 기능, 특히 **JPA(EntityManager, Repository)**와 관련된 기능을 테스트할 때 유용합니다. JPA 관련 테스트만을 위해 필요한 설정들만 로드하고, JPA 계층을 집중적으로 테스트할 수 있도록 지원합니다.  
 - JPA 관련 컴포넌트만 로드:
    - @DataJpaTest는 애플리케이션에서 JPA와 관련된 컴포넌트들만 로드합니다. 주로 **엔티티(Entity)**와 **JPA 리포지토리(Repository)**에 대한 테스트를 수행할 때 사용됩니다.
    - 컨트롤러, 서비스와 같은 웹 계층이나 비즈니스 로직 계층은 로드하지 않기 때문에 가볍고 빠르게 실행됩니다.
 - 임베디드 데이터베이스 사용:
    - 기본적으로 @DataJpaTest는 임베디드 데이터베이스(H2, HSQLDB, Derby 등)를 사용합니다. 실제 데이터베이스를 사용할 필요 없이 테스트 환경에서 임베디드 데이터베이스를 사용해 JPA 관련 기능을 테스트할 수 있습니다.
    - 실제 데이터베이스를 사용하고자 할 경우에는 @AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)와 같은 어노테이션을 추가하여 설정할 수 있습니다.
 - 트랜잭션 관리:
    - 테스트는 기본적으로 트랜잭션으로 실행되며, 테스트가 끝나면 자동으로 롤백됩니다. 이를 통해 데이터베이스 상태를 일관되게 유지하면서 여러 번의 테스트를 연속적으로 실행할 수 있습니다.
    - 트랜잭션이 롤백되기 때문에 데이터베이스 상태가 테스트 간에 영향을 받지 않으며, 독립적인 테스트가 가능합니다.
 - Hibernate 및 JPA 기능 테스트:
    - 엔티티 매핑, 데이터베이스 CRUD(Create, Read, Update, Delete) 동작, 쿼리 메서드 등 JPA 관련 기능을 테스트하는 데 적합합니다.
 - TestEntityManager
    - EntityManager의 Test Double로써 영속성 컨텍스트에 저장하는 역할을 한다.
    - @DataJpaTest의 경우, 실제로 DB에 데이터가 적재되는 것이 아니라, 영속성 Context까지만 데이터가 전달하고 flush() 를 하지 않기 때문에 Log 상에 쿼리 관련 로그가 보이지 않는다.

