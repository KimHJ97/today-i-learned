# 더 나은 테스트를 작성하기 위한 구체적 조언

 - 한 문단에 한 주제
    - 테스트 코드에 분기문이나 반복문 같은 논리 구조가 들어가면, 테스트 코드를 이해하기 어렵다.
    - 만약, 케이스 확장이 필요하다면 @ParameterizedTest 등을 활용하거나, 케이스별로 테스트 코드를 나누어 작성하는 것이 좋다.
    - 한 가지 테스트에서는 한 가지 목적의 검증만 테스트한다. (@DisplayName을 한 문장으로 만들 수 있는가?)
 - 완벽하게 제어하기
    - 현재 시간이나 랜덤 값 같은 제어할 수 없는 값들은 상위 계층으로 분리하여 테스트 가능한 구조로 만드는 것이 좋다. (사용하는 곳에서 원하는 값을 주입하여 테스트할 수 있도록 한다.)
    - 외부 시스템과 연동하는 경우에는 모의 객체(Mock)를 이용할 수 있다. 테스트 결과가 외부 시스템에 의존되어서는 안 된다.
 - 테스트 환경의 독립성을 보장하자
    - 테스트 환경을 구성하는 Given 절에는 최대한 생성자 기반으로 생성하는 것이 좋다.
    - Given 절에 생성자를 통해 주어지는 값을 생성하고, 추가적인 로직을 수행한 값으로 When 절에 넘기게 되면, 맥락을 이해하기 위해 Given 절에 논리적인 구조도 이해해야하고 이후에 코드도 이해해야하는 복잡함이 증가한다.
    - 또한, Given 절에 추가적인 로직으로 인해 테스트가 실패할 수도 있다. 테스트가 실패하는 이유로는 When 절 혹은 Then 절 이여야만 한다.
 - 테스트 간 독립성을 보장하자
    - 테스트 간 순서에 따라 성공 실패가 바뀌어서는 안 된다.
    - 테스트 간에는 순서가 무관해야 하고, 각각 독립적으로 언제 수행되든 항상 같은 결과를 내주어야 한다. (공유 자원에 대해 지양해야 한다.)
 - 한 눈에 들어오는 Test Fixture 구성하기
    - Fixture: 고정물, 고정되어 있는 물체
    - 테스트를 위해 원하는 상태로 고정시킨 일련의 객체
    - @BeforeEach를 이용하여 Given 절에 필요한 값들을 세팅하는 경우 테스트 코드를 확인하기 위해 위 아래 스크롤을 하며 확인하여야 하고, 모든 테스트가 해당 값에 의존하게 된다. 때문에, @BeforeEach에 Given 절을 정의하기 보다는 테스트 코드 안에 Given을 통해 값을 지정해주는 것이 좋다. @BeforeEach는 각 테스트 입장에서 봤을 때 해당 내용을 몰라도 테스트 내용을 이해하는 데 문제가 없는 경우에 사용하면 좋다. 또, 수정해도 모든 테스트에 영향을 주지 않는 경우에 사용하면 좋다.
    - data.sql 같은 미리 다른 곳에서 셋업하는 형태도 데이터의 파편화가 일어나고, 관리해야하는 포인트가 늘어나게 되어 권장하지 않는다.
    - Given 절에 필요한 값들만 설정하여 정확하게 명시해준다.
    - Fixture를 만들기 위한 빌더를 한 곳에서 관리하는 것보다 장기적으로 보았을 때 테스트 클래스마다 빌더를 만들어주는 것이 권장된다. (애플리케이션이 커지면 복잡도가 커진다.)
 - Test Fixture 클렌징
    - deleteAllInBatch() 메서드는 테이블 데이터를 벌크성으로 정리할 수 있는 메서드이다. 하지만, 외래키 조건이 걸려있는 경우 순서에 따라 영향을 받기 떄문에 순서를 고려해야 한다. (DELETE FROM 테이블명)
    - deleteAll() 메서드는 연관 테이블의 데이터를 지워준다. 하지만, 테이블의 데이터를 전체 조회하고, 데이터를 한 건씩 지운다. (모든 데이터 조회 -> 외래키 데이터 조회 -> 한 건씩 삭제)
    - @Transactional을 이용하여 롤백을 진행할 수 있다. 사이드 이팩트에 대한 주의해야 한다. (테스트 코드에 @Transactional이 걸려있고, 구현 코드에 @Transactional이 없으면 테스트는 성공하는데 실제 운영 환경에서 동작안할 수 있다.)
 - private 메서드의 테스트는 어떻게 하는가?
    - 클라이언트 입장에서 보았을 때 공개된 API(public 메서드)만 알면 된다. 외부로 노출되지 않은 내부 기능까지 알아야 할 필요가 없다.
    - 떄문에, private 메서드를 테스트할 필요가 없다. 또, 공개된 API를 테스트하다보면 자동으로 내부에서 사용되는 private 메서드까지 검증이 된다.
    - 만약, private 메서드 테스트가 필요하다면 해당 메서드에 대해서 객체를 분리하고 책임을 나누어야 하는가에 대한 고민을 하고 진행하면 된다.


<br/>

## @ParameterizedTest

단순히 하나의 테스트 케이스이지만, 값을 여러개를 바꾸어가면서 테스트를 하고 싶은 경우가 있다.  
이러한 경우 @ParameterizedTest 어노테이션을 이용할 수 있다.  
 - @ParameterizedTest로 파라미터를 변경하면서 여러 번의 테스트를 진행할 수 있다.
 - 파라미터 값(Source)은 @ValueSource, @NullSource, @EmptySource, @EnumSource, @CsvSource, @CsvFileSource, @MethodSource 등 여러 개의 어노테이션으로 정의할 수 있다.
 - https://junit.org/junit5/docs/current/user-guide/#writing-tests-parameterized-tests

<br/>

 - ProductType
```Java
@Getter
@RequiredArgsConstructor
public enum ProductType {

    HANDMADE("제조 음료"),
    BOTTLE("병 음료"),
    BAKERY("베이커리");

    private final String text;

    public static boolean containsStockType(ProductType type) {
        return List.of(BOTTLE, BAKERY).contains(type);
    }
}
```

 - ProductTypeTest
    - 한 가지 테스트이지만, 값을 변경하면서 테스트를 진행한다.
```Java
class ProductTypeTest {

    @DisplayName("상품 타입이 재고 관련 타입인지를 체크한다.")
    @Test
    void containsStockType1() {
        // Given
        ProductType givenType1 = ProductType.HANDMADE;
        ProductType givenType2 = ProductType.BOTTLE;
        ProductType givenType3 = ProductType.BAKERY;

        // When
        boolean result1 = ProductType.containsStockType(givenType1);
        boolean result2 = ProductType.containsStockType(givenType2);
        boolean result3 = ProductType.containsStockType(givenType3);

        // Then
        assertThat(result1).isFalse();
        assertThat(result2).isTrue();
        assertThat(result3).isTrue();
    }

    // ParameterizedTest + @CsvSource
    @DisplayName("상품 타입이 재고 관련 타입인지를 체크한다.")
    @CsvSource({"HANDMADE,false", "BOTTLE,true", "BAKERY,true"})
    @ParameterizedTest
    void containsStockType2(ProductType productType, boolean expected) {
        // when
        boolean result = ProductType.containsStockType(productType);

        // then
        assertThat(result).isEqualTo(expected);
    }

    // @ParameterizedTest + @MethodSource
    @DisplayName("상품 타입이 재고 관련 타입인지를 체크한다.")
    @MethodSource("provideProductTypesForCheckingStockType")
    @ParameterizedTest
    void containsStockType3(ProductType productType, boolean expected) {
        // when
        boolean result = ProductType.containsStockType(productType);

        // then
        assertThat(result).isEqualTo(expected);
    }

        private static Stream<Arguments> provideProductTypesForCheckingStockType() {
        return Stream.of(
                Arguments.of(ProductType.HANDMADE, false),
                Arguments.of(ProductType.BOTTLE, true),
                Arguments.of(ProductType.BAKERY, true)
        );
    }
}
```

<br/>

## @DynamicTest

환경을 설정하고, 사용자 시나리오를 테스트하고 싶은 경우가 있다.  
이러한 경우 @DynamicTest를 사용할 수 있다.  

```Java
class StockTest {

    @DisplayName("재고 차감 시나리오")
    @TestFactory
    Collection<DynamicTest> stockDeductionDynamicTest() {
        // given
        Stock stock = Stock.create("001", 1);

        return List.of(
            DynamicTest.dynamicTest("재고를 주어진 개수만큼 차감할 수 있다.", () -> {
                // given
                int quantity = 1;

                // when
                stock.deductQuantity(quantity);

                // then
                assertThat(stock.getQuantity()).isZero();
            }),
            DynamicTest.dynamicTest("재고보다 많은 수의 수량으로 차감 시도하는 경우 예외가 발생한다.", () -> {
                // given
                int quantity = 1;

                // when // then
                assertThatThrownBy(() -> stock.deductQuantity(quantity))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("차감할 재고 수량이 없습니다.");
            })
        );
    }
}
```

<br/>

## 테스트 수행도 비용이다. 환경 통합하기

[Gradle - verification - test] 를 클릭하여 전체 테스트를 진행할 수 있다.  
현재 코드상에 Spring Boot 컨텍스트가 띄어지는 횟수를 세어보면, OrderControllerTest, ProductControllerTest, OrderServiceTest, OrderStatisticsServiceTest, ProductRepositoryTest, StockRepositoryTest로 6번의 스프링 부트 서버가 새로 띄워지게 된다.  
이렇게 스프링 부트 컨텍스트를 읽어오고 가동하는 횟수가 많아지면, 애플리케이션이 커질수록 전체 테스트 수행시간이 엄청나게 길어지게 된다.  
 - @SpringBootTest, @WebMvcTest, @DataJpaTest, @ActiveProfiles("test") 등 테스트 클래스 위에 명시되어 있는 스프링 컨테이너에 실행 환경이 바뀌는 경우 스프링 컨테이너가 새로 띄워진다.
 - 때문에, 이러한 경우 통합 환경을 제공하는 클래스를 만들어주고, 테스트 클래스에 어노테이션을 정의하는 것이 아닌 해당 통합 환경 클래스를 상속 받아 공통 환경을 사용함으로써 스프링 컨텍스트를 띄우는 횟수를 줄일 수 있다.
 - 주의점으로는 @MockBean 같은 경우에 모의 객체 처리하는 코드가 있는 경우에도 새로운 컨테이너가 띄워진다. 이러한 경우에는 외부 시스템 통합 환경 클래스와 단순 통합 환경 클래스를 구분해서 사용할 수도 있다.
 - 추가적으로 컨트롤러 테스트 시에 @WebMvcTest를 이용하는데, 이 부분도 다른 테스트와 성격이 달라 @WebMvcTest를 위한 컨트롤러만의 통합 환경 클래스를 구분하여 사용한다.
    - Service, Repository 레이어 테스트에서 사용할 통합 환경 클래스를 사용한다.
    - @MockBean 등 모의 객체를 처리하는 통합 환경 클래스가 필요한 경우 외부 시스템 모의 객체를 처리하는 해당 통합 환경 클래스를 따로 만들어준다.
    - Controller 레이어 테스트를 위한 @WebMvcTest 통합 환경 클래스를 따로 만들어준다.

<br/>

 - IntegrationTestSupport
```Java
@ActiveProfiles("test")
@SpringBootTest
public abstract class IntegrationTestSupport {

    @MockBean
    protected MailSendClient mailSendClient;
}
```
 - 사용 예시
```Java
// Repository 레이어
@Transactional
class ProductRepositoryTest extends IntegrationTestSupport {
    ..
}
class StockRepositoryTest extends IntegrationTestSupport {
    ..
}

// Service 레이어
class ProductServiceTest extends IntegrationTestSupport {
    ..
}
class OrderServiceTest extends IntegrationTestSupport {
    ..
}
class OrderStatisticsServiceTest extends IntegrationTestSupport {
    ..
}
```

<br/>

 - ControllerTestSupport
```Java
@WebMvcTest(controllers = {
        OrderController.class,
        ProductController.class
})
public abstract class ControllerTestSupport {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @MockBean
    protected OrderService orderService;

    @MockBean
    protected ProductService productService;
}
```
 - 사용 예시
```Java
class OrderControllerTest extends ControllerTestSupport {
    ..
}
class ProductControllerTest extends ControllerTestSupport {
    ..
}
```

<br/>

## 키워드 정리

 - 테스트 하나 당 목적은 하나
 - 완벽한 제어
 - 테스트 환경의 독립성, 테스트 간 독립성
 - Test Fixture
 - deleteAll(), deleteAllInBatch()
 - @ParameterizedTest, @DynamicTest
 - 수행 환경 통합하기
 - private method test
 - 테스트에서만 필요한 코드

