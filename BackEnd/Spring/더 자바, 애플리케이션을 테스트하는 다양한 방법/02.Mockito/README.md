# Mockito

Mockito는 자바 프로그래밍 언어를 위한 오픈 소스 모의(Mock) 객체 생성 프레임워크입니다. 모의 객체는 실제 객체와 유사하게 동작하지만, 실제 객체처럼 복잡한 설정이나 리소스를 필요로하지 않습니다. 이를 통해 소프트웨어 테스트를 더 쉽게 작성하고 관리할 수 있게 해줍니다.  
 - Mock: 진짜 객체와 비슷하게 동작하지만 프로그래머가 직접 그 객체의 행동을 관리하는 객체
 - [Mockito](https://site.mockito.org/): Mock 객체를 쉽게 만들고 관리하고 검증할 수 있는 방법을 제공한다.
 - 대체 라이브러리: [EasyMock](https://easymock.org/), [JMock](http://jmock.org/)

<br/>

## Mockito 시작하기

 - 의존성 추가하기
    - Spring Boot인 경우 기존적으로 Mockito가 포함되어 있다.
    - Spring Boot가 아닌 경우 Mockito 의존성을 추가해야 한다.
        - mockito-core: Mockito 기능을 제공하는 코어 라이브러리
        - mockito-junit-jupiter: JUnit에서 Mockito를 연동하여 사용할 수 있도록한 JUnit 확장 구현체
```XML
<!-- Spring Boot -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>

<!-- Spring Framework -->
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <version>3.1.0</version>
    <scope>test</scope>
</dependency>

<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-junit-jupiter</artifactId>
    <version>3.1.0</version>
    <scope>test</scope>
</dependency>
```

<br/>

 - Mock을 활용한 테스트 방법
    - Mockito 레퍼런트: https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html
    - Mock을 만드는 방법
    - Mock이 어떻게 동작해야 하는지 관리하는 방법
    - Mock의 행동을 검증하는 방법

<br/>

## Mock 객체 만들기

 - StudyService
    - MemberService: 구현체 없이 인터페이스만 정의(규약만 정의했다고 가정한다.)
```Java
// StudyRepository
public interface StudyRepository extends JpaRepository<Study, Long> {
}

// MemberService
public interface MemberService {

    Optional<Member> findById(Long memberId);
}

// StudyService
public class StudyService {

    private final MemberService memberService;

    private final StudyRepository repository;

    public StudyService(MemberService memberService, StudyRepository repository) {
        assert memberService != null;
        assert repository != null;
        this.memberService = memberService;
        this.repository = repository;
    }

    public Study createNewStudy(Long memberId, Study study) {
        Optional<Member> member = memberService.findById(memberId);
        study.setOwner(member.orElseThrow(() -> new IllegalArgumentException("Member doesn't exist for id: " + memberId)));
        return repository.save(study);
    }
}
```

<br/>

 - StudyServiceTest
    - StudyService의 메서드를 테스트하기 위해서는 StudyService의 객체를 생성하고, 해당 메서드를 수행하고 결과를 테스트해야한다.
    - StudyService의 인스턴스를 생성하기 위해서는 MemberService와 StudyRepository에 대한 구현체가 필요하다. 하지만, 둘 다 인터페이스만 있고 구현체가 존재하지 않아서 인스턴스를 생성할 수가 없다. 이러한 경우 Mocking을 이용할 수 있다.
        - 익명 클래스 이용
        - Mockito.mock() 메서드 이용
        - @Mock 어노테이션 이용 (+ @ExtendWith)
```Java
@ExtendWith(MockitoExtension.class)
class StudyServiceTest {

    @Mock
    MemberService memberService;

    @Mock
    StudyRepository studyRepository;

    @Test
    @DisplayName("직접 객체를 만들어서 Mocking 하기")
    void createStudyService() {
        MemberService memberService = new MemberService() {
            @Override
            public Optional<Member> findById(Long memberId) {
                return Optional.empty();
            }
        };

        StudyRepository studyRepository = new StudyRepository() {
            @Override
            public List<Study> findAll() {
                return null;
            }
            ..
        }

        StudyService studyService = new StudyService(memberService, studyRepository);

        assertNotNull(studyService);
    }

    @Test
    @DisplayName("Mockito를 이용하여 Mocking 하기")
    void createStudyService2() {
        MemberService memberService = Mockito.mock(MemberService.class);
        StudyRepository studyRepository = Mockito.mock(StudyRepository.class);

        StudyService studyService = new StudyService(memberService, studyRepository);

        assertNotNull(studyService);
    }

    @Test
    @DisplayName("@Mock 어노테이션을 이용하여 Mocking 하기")
    void createStudyService3() {
        StudyService studyService = new StudyService(this.memberService, this.studyRepository);

        assertNotNull(studyService);
    }

    @Test
    @DisplayName("@Mock 어노테이션 파라미터에서 Mocking 하기")
    void createStudyService4(
            @Mock MemberService memberService,
            @Mock StudyRepository studyRepository) {
        StudyService studyService = new StudyService(this.memberService, this.studyRepository);

        assertNotNull(studyService);
    }
}
```

<br/>

 - Mock 객체 만들기 정리
```Java
// 1. Mockito.mock() 메소드 이용
void 테스트() {
    MemberService memberService = mock(MemberService.class);
    StudyRepository studyRepository = mock(StudyRepository.class);
    StudyService studyService = new StudyService(memberService, studyRepository);
}

// 2. @Mcok 어노테이션 이용 (+ JUnit 5 Extension으로 MockitoExtension을 사용해야 한다.)
@ExtendWith(MockitoExtension.class)
class StudyServiceTest {

    @Mock MemberService memberService;

    @Mock StudyRepository studyRepository;

    void 테스트() {
        StudyService studyService = new StudyService(memberService, studyRepository);
    }
}

// 3. @Mock 어노테이션 파라미터에 이용 (+ JUnit 5 Extension으로 MockitoExtension을 사용해야 한다.)
@ExtendWith(MockitoExtension.class)
class StudyServiceTest {

    void 테스트(
        @Mock MemberService memberService,
        @Mock StudyRepository studyRepository
    ) {
        StudyService studyService = new StudyService(memberService, studyRepository);
    }
}
```

<br/>

## Mock 객체 Stubbing

Mock 객체 Stubbing은 Mockito와 같은 모의(Mock) 객체 라이브러리를 사용하여 모의 객체의 메서드 호출에 대한 반환 값을 미리 정의하는 작업을 말합니다. 이를 통해 테스트 시나리오에 맞게 모의 객체의 동작을 설정할 수 있습니다.  
Mock 객체의 행동을 정의해주지 않으면 기본적으로 반환 값이 있는 메서드는 Null을 반환하고, Primitive 타입은 기본 Primitive 값을 반환하고, 콜렉션은 비어있는 콜렉션, Void 메서드는 예외를 던지지 않고 아무런 일도 발생하지 않는다.  
 - Mock 객체의 행동을 정의하는 것
    - 외부 서비스나 리소스에 의존하는 경우: 모의 객체를 사용하여 외부 의존성을 피하고, 테스트를 더 격리된 환경에서 수행할 수 있습니다.
    - 특정 조건에 따른 메서드 호출 결과 설정: 특정 입력 값에 대해 원하는 결과를 반환하도록 모의 객체의 메서드를 설정할 수 있습니다.
    - 예외 처리 시나리오 테스트: 모의 객체의 메서드 호출 시 특정 예외를 발생시키도록 정의할 수 있습니다.
    - 특정 메서드 호출 횟수 검증: 메서드가 특정 횟수만큼 호출되는지를 검증하거나, 호출 횟수를 조건에 따라 다르게 정의할 수 있습니다.
 - Mock 객체 행동 조작
    - 특정한 매개 변수를 받은 경우 특정한 값을 리턴하거나 예외를 던지도록 만들 수 있다.
        - [How about some stubbing?](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html#2)
        - [Argument Matchers](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html#3)
    - Void 메서드 특정 매개변수를 받거나 호출된 경우 예외를 발생시킬 수 있다.
        - [Stubbing void methods with exceptions](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html#5)
    - 메서드가 동일한 매개변수로 여러번 호출될 때 각기 다르게 행동하도록 조작할 수 있다.
        - [Stubbing consecutive calls](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html#10)

<br/>

 - StudyServiceTest
```Java
@ExtendWith(MockitoExtension.class)
class StudyServiceTest {

    @Test
    @DisplayName("Mock 객체 Stubbing")
    void mockStubbingTest(
            @Mock MemberService memberService,
            @Mock StudyRepository studyRepository) {

        // Given
        Member member = new Member();
        member.setId(1L);
        member.setEmail("hj_kim97@naver.com");

        // memberSerivce의 findById() 메서드의 1L 매개변수로 호출이 되면,
        // Optional.of(member) 객체를 반환하도록 행동을 정의 (Stubbing)
        when(memberService.findById(1L)).thenReturn(Optional.of(member));

        // When
        Optional<Member> findMember = memberService.findById(1L);

        // Then
        assertEquals("hj_kim97@naver.com", findMember.get().getEmail());
    }

    @Test
    @DisplayName("범용적인 파라미터 매칭 Stubbing")
    void argumentMatchersTest(@Mock MemberService memberService) {

        Member member = new Member();
        member.setId(1L);
        member.setEmail("hj_kim97@naver.com");

        // memberService의 findById() 메서드에 어느 매개변수든 Optional.of(member) 객체를 반환
        when(memberService.findById(ArgumentMatchers.any())).thenReturn(Optional.of(member));

        assertEquals("hj_kim97@naver.com", memberService.findById(1L).get().getEmail());
        assertEquals("hj_kim97@naver.com", memberService.findById(2L).get().getEmail());
    }

    @Test
    @DisplayName("예외 발생 Stubbing")
    void exceptionTest(@Mock MemberService memberService) {
        
        // 1L 매개변수로 findById() 메서드가 호출되면 예외 발생
        when(memberService.findById(1L)).thenThrow(new RuntimeException());
        assertThrows(RuntimeException.class, () -> {
            memberService.findById(1L);
        });

        // 반환값이 없는 void 메서드인 경우 예외 발생
        doThrow(new IllegalArgumentException()).when(memberService).validate(1L);
        assertThrows(IllegalArgumentException.class, () -> {
            memberService.validate(1L);
        });
    }

    @Test
    @DisplayName("메소드 호출 순서에 따른 Stubbing")
    void methodCallOrderTest(@Mock MemberService memberService) {
        
        Member member = new Member();
        member.setId(1L);
        member.setEmail("hj_kim97@naver.com");

        // 처음 findById() 메서드 호출시: Optional.of(member) 반환
        // 두번째 findById() 메서드 호출시: RuntimeException 예외 발생
        // 세번쨰 findById() 메서드 호출시: Optional.empty() 반환
        when(memberService.findById(ArgumentMatchers.any()))
            .thenReturn(Optional.of(member))
            .thenThrow(new RuntimeException())
            .thenReturn(Optional.empty());

        Optional<Member> findMember = memberService.findById(1L);
        assertEquals("hj_kim97@naver.com", findMember.get().getEmail());

        assertThrows(RuntimeException.class, () -> {
            memberService.findById(2L);
        });

        assertEquals(Optional.empty(), memberService.findById(3L));
    }
}
```

<br/>

 - Mock 객체 Stubbing 연습
    - memberService 객체에 findById 메소드를 1L 값으로 호출하면 member 객체를 리턴하도록 Stubbing
    - studyRepository 객체에 save 메소드를 study 객체로 호출하면 study 객체 그대로 리턴하도록 Stubbing
```Java
@ExtendWith(MockitoExtension.class)
class StudyServiceTest {

    @Mock MemberService memberService,
    @Mock StudyRepository studyRepository

    @Test
    void test() {
        StudyService studyService = new StudyService(memberService, studyRepository);
        assertNotNull(studyService);

        Member member = new Member();
        member.setId(1L);
        member.setEmail("hj_kim97@naver.com");

        Study study = new Study(10, "테스트");

        // TODO: memberService 객체에 findById 메소드를 1L 값으로 호출하면 Optional.of(member) 객체를 리턴하도록 Stubbing
        when(memberService.findById(1L)).thenReturn(Optional.of(member));

        // TODO: studyRepository 객체에 save 메소드를 study 객체로 호출하면 study 객체 그대로 리턴하도록 Stubbing
        when(studyRepository.save()).thenReturn(study);

        studyService.createNewStudy(1L, study);
        assertNotNull(study.getOwner());
        assertEquals(member, study.getOwner());
    }
}
```

<br/>

## Mock 객체 확인

Mock 객체가 어떻게 사용되었는지 확인할 수 있다.  
 - 특정 메소드가 특정 매개변수로 몇번 호출되었는지, 최소 한 번은 호출됐는지, 전혀 호출되지 않았는지
    - [Verifying exact number of invocations](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html#exact_verification)
 - 어떤 순서대로 호출됐는지
    - [Verification in order](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html#in_order_verification)
 - 특정 시간 이내에 호출됐는지
    - [Verification with timeout](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html#verification_timeout)
 - 특정 시점 이후에 아무 일도 벌어지지 않았는지
    - [Finding redundant invocations](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html#finding_redundant_invocations)
```Java
// 1. 특정 메소드가 몇 번 호출됐는지
    //using mock
    mockedList.add("once");

    mockedList.add("twice");
    mockedList.add("twice");

    mockedList.add("three times");
    mockedList.add("three times");
    mockedList.add("three times");

    //following two verifications work exactly the same - times(1) is used by default
    verify(mockedList).add("once");
    verify(mockedList, times(1)).add("once");

    //exact number of invocations verification
    verify(mockedList, times(2)).add("twice");
    verify(mockedList, times(3)).add("three times");

    //verification using never(). never() is an alias to times(0)
    verify(mockedList, never()).add("never happened");

// 2. 어떤 순서대로 호출됐는지
    // A. Single mock whose methods must be invoked in a particular order
    List singleMock = mock(List.class);

    //using a single mock
    singleMock.add("was added first");
    singleMock.add("was added second");

    //create an inOrder verifier for a single mock
    InOrder inOrder = inOrder(singleMock);

    //following will make sure that add is first called with "was added first", then with "was added second"
    inOrder.verify(singleMock).add("was added first");
    inOrder.verify(singleMock).add("was added second");

// 3. 특정 시간 이내 호출되었는지
    //passes when someMethod() is called no later than within 100 ms
    //exits immediately when verification is satisfied (e.g. may not wait full 100 ms)
    verify(mock, timeout(100)).someMethod();
    //above is an alias to:
    verify(mock, timeout(100).times(1)).someMethod();

    //passes as soon as someMethod() has been called 2 times under 100 ms
    verify(mock, timeout(100).times(2)).someMethod();

    //equivalent: this also passes as soon as someMethod() has been called 2 times under 100 ms
    verify(mock, timeout(100).atLeast(2)).someMethod();

// 특정 시점 이후에 아무 일도 벌어지지 않았는지
    //using mocks
    mockedList.add("one");
    mockedList.add("two");

    verify(mockedList).add("one");

    //following verification will fail
    verifyNoMoreInteractions(mockedList);
```

<br/>

 - Mock 객체 확인하기 예제
    - StudyService
        - createNewStudy() 메서드에서 정상적으로 Study가 생성되었다면, notify() 메서드를 호출하여 알림을 보낸다.
    - StudyServiceTest
        - StudyService의 createNewStudy() 메서드를 호출하였을 때, notify()에 대한 결과를 확인할 수 있는 방법이 없다. 다만, 한가지 확인할 수 있는 것은 해당 메서드가 호출되었는지 Mock 객체를 확인할 수 있다.
```Java
// StudyService
public class StudyService {

    private final MemberService memberService;

    private final StudyRepository repository;

    public StudyService(MemberService memberService, StudyRepository repository) {
        assert memberService != null;
        assert repository != null;
        this.memberService = memberService;
        this.repository = repository;
    }

    public Study createNewStudy(Long memberId, Study study) {
        Optional<Member> member = memberService.findById(memberId);
        if (member.isPresent()) {
            study.setOwnerId(memberId);
        } else {
            throw new IllegalArgumentException("Member doesn't exist for id: '" + memberId + "'");
        }
        Study newstudy = repository.save(study);
        memberService.notify(newstudy);
        return newstudy;
    }
}

// StudyServiceTest
@ExtendWith(MockitoExtension.class)
class StudyServiceTest {

    @Mock MemberService memberService,
    @Mock StudyRepository studyRepository

    @Test
    void test() {
        // Given
        StudyService studyService = new StudyService(memberService, studyRepository);
        assertNotNull(studyService);

        Member member = new Member();
        member.setId(1L);
        member.setEmail("hj_kim97@naver.com");

        Study study = new Study(10, "테스트");

        when(memberService.findById(1L)).thenReturn(Optional.of(member));
        when(studyRepository.save()).thenReturn(study);

        // When
        studyService.createNewStudy(1L, study);

        // Then
        assertNotNull(study.getOwner());
        // notify() 메서드가 1번 호출되었는지 검증, 호출이 안되었으면 에러 발생
        verify(memberService, times(1)).notify(any());
        // validate() 메서드가 전혀 호출되지 않는지검증
        verify(memberService, never()).validate(any());
    }
}
```

<br/>

## BDD 스타일 Mockito API

BDD는 TDD(테스트 주도 개발)의 확장된 개념으로 시작되었으며, 개발자들이 코드를 작성하기 전에 원하는 기능을 먼저 명확하게 정의하고, 그 기능이 어떻게 동작해야 하는지를 명세하는 것을 강조합니다. 이로써 개발자는 코드 작성 전에 원하는 기능에 대한 이해를 돕고, 이해 관계자들과의 의사 소통을 원활하게 하며, 테스트 가능하고 검증 가능한 코드를 작성하게 됩니다.  
 - BDD: 애플리케이션이 어떻게 행동해야 하는지에 대한 공통된 이해를 구성하는 방법
 - 행동에 대한 스팩
    - Title
    - Narrative
        - As a / I want / so that
    - Acceptance criteria
        - Given / When / Then

<br/>

Mockito에서 Mock 객체의 행동을 정의할 때 when()을 통해 정의할 수 있다.  
하지만, 이렇게 when()을 통해 Stubbing 하는 부분은 BDD 스타일에서 Given에 해당하지만, 메소드가 when()으로 가독성이나 이해를 해치게 된다.  
때문에, Mockito에서는 BDD 스타일로 Stubbing 할 수 있도록 API를 제공한다.  
 - when().thenReturn() -> given().willReturn()
 - verify() -> then().should()
 - [BDDMockito](https://javadoc.io/static/org.mockito/mockito-core/3.2.0/org/mockito/BDDMockito.html)
 - [BDD Style Verification](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html#BDD_behavior_verification)
```Java
// When -> Given
when(memberService.findById(1L)).thenReturn(Optional.of(member));
when(studyRepository.save(study)).thenReturn(study);

given(memberService.findById(1L)).willReturn(Optional.of(member));
given(studyRepository.save(study)).willReturn(study);

// Verify -> Then
verify(memberService, time(1)).notify(study);
verifyNoMoreInteractions(memberService);

then(memberService).should(times(1)).notify(study);
then(memberService).shouldHaveNoMoreInteractions();
```

<br/>

 - Mockito 연습 문제
    - StudyService 코드에 대한 테스트를 Mockito를 사용해서 Mock 객체를 만들고 Stubbing과 Verifying을 사용해서 테스트를 작성
```Java
// StudyService
public Study openStudy(Study study) {
    study.open();
    Study openedStudy = repository.save(study);
    memberService.notify(openedStudy);
    return openedStudy;
}

// StudyServiceTest
@DisplayName("다른 사용자가 볼 수 있도록 스터디를 공개한다.")
@Test
void openStudy() {
    // Given
    StudyService studyService = new StudyService(memberService, studyRepository);
    Study study = new Study(10, "더 자바, 테스트");
    assertNull(study.getOpenedDateTime());
    // TODO studyRepository Mock 객체의 save 메소드를호출 시 study를 리턴하도록 만들기.
    given(studyRepository.save(study)).willReturn(study);

    // When
    studyService.openStudy(study);

    // Then
    // TODO study의 status가 OPENED로 변경됐는지 확인
    assertEquals(StudyStatus.OPEND, study.getStatus());
    // TODO study의 openedDataTime이 null이 아닌지 확인
    assertNotNull(study.getOpenedDateTime());
    // TODO memberService의 notify(study)가 호출 됐는지 확인.
    then(memberService).should().notify(study);
}

```