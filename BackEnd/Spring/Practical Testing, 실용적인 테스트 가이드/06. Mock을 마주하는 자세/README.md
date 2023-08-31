# Mock을 마주하는 자세

## 사전 지식

 - 요구 사항 추가
    - 일일 매출 통계 확인 및 메일 전송 기능

<br/>

### 일일 매출 통계 확인 및 메일 전송 소스 코드

 - MailSendHistory 엔티티 클래스 & Repository 클래스
```Java
// MailSendHistory
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
public class MailSendHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fromEmail;
    private String toEmail;
    private String subject;
    private String content;

    @Builder
    public MailSendHistory(String fromEmail, String toEmail, String subject, String content) {
        this.fromEmail = fromEmail;
        this.toEmail = toEmail;
        this.subject = subject;
        this.content = content;
    }
}

// MailSendHistoryRepository
@Repository
public interface MailSendHistoryRepository extends JpaRepository<MailSendHistory, Long> {
}
```

 - MailSendClient
    - 메일 전송을 담당하는 컴포넌트
    - 테스트 코드에서는 외부 API 요청 등으로 테스트 실행시 마다 실패하거나 성공할 수가 있다. 때문에, 해당 컴포넌트를 모의 객체(@MockBean)으로 만들어 동작을 정의한다.
```Java
@Slf4j
@Component
public class MailSendClient {
    public boolean sendEmail(String fromEmail, String toEmail, String subject, String content) {
        log.info("메일 전송");
        throw new IllegalArgumentException("메일 전송");
    }
}
```

 - MailService
    - 메일 전송 서비스 레이어
    - MailSendClient 클래스를 이용하여 메일 전송 기능을 수행하고, 그 외 메일 전송 후처리에 필요한 비즈니스 로직을 담당한다.
```Java
@RequiredArgsConstructor
@Service
public class MailService {

    private final MailSendClient mailSendClient;
    private final MailSendHistoryRepository mailSendHistoryRepository;
    public boolean sendMail(String fromEmail, String toEmail, String subject, String content) {
        boolean result = mailSendClient.sendEmail(fromEmail, toEmail, subject, content);
        if(result) {
            mailSendHistoryRepository.save(MailSendHistory.builder()
                    .fromEmail(fromEmail)
                    .toEmail(toEmail)
                    .subject(subject)
                    .content(content)
                    .build()
            );
            return true;
        }

        return false;
    }
}
```

 - OrderStatisticsService
    - 주문 통계 서비스 레이어
    - orderDate부터 +1일 까지의 매출액을 조회하고, 총 매출을 계산한다. 이후에 MailService를 이용하여 메일 전송을 수행한다.
```Java
@RequiredArgsConstructor
@Service
public class OrderStatisticsService {

    private final OrderRepository orderRepository;
    private final MailService mailService;

    public boolean sendOrderStatisticsMail(LocalDate orderDate, String email) {
        // 해당 일자에 결제완료된 주문들을 가져와서
        List<Order> orders = orderRepository.findOrdersBy(
                orderDate.atStartOfDay(),
                orderDate.plusDays(1).atStartOfDay(),
                OrderStatus.PAYMENT_COMPLETED
        );

        // 총 매출 합계를 계산하고
        int totalAmount = orders.stream()
                .mapToInt(Order::getTotalPrice)
                .sum();

        // 메일 전송
        boolean result = mailService.sendMail("no-reply@cafekiosk.com",
                email,
                String.format("[매출통계] %s", orderDate),
                String.format("총 매출 합계는 %s원입니다.", totalAmount)
        );

        if(!result) {
            throw new IllegalArgumentException("매출 통계 메일 전송에 실패했습니다.");
        }

        return true;
    }
}
```

<br/>

#### 테스트 코드

 - OrderStatisticsServiceTest
```Java
@SpringBootTest
class OrderStatisticsServiceTest {

    @Autowired
    private OrderStatisticsService orderStatisticsService;

    @Autowired
    private OrderProductRepository orderProductRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MailSendHistoryRepository mailSendHistoryRepository;

    @MockBean
    private MailSendClient mailSendClient;

    @AfterEach
    void tearDown() {
        orderProductRepository.deleteAllInBatch();
        orderRepository.deleteAllInBatch();
        productRepository.deleteAllInBatch();
        mailSendHistoryRepository.deleteAllInBatch();
    }

    @DisplayName("결제완료 주문들을 조회하여 매출 통계 메일을 전송한다.")
    @Test
    void sendOrderStatisticsMail() {
        // Given
        LocalDateTime now = LocalDateTime.of(2023, 8, 31, 10, 0);

        Product product1 = createProduct(HANDMADE, "001", 1000);
        Product product2 = createProduct(HANDMADE, "002", 2000);
        Product product3 = createProduct(HANDMADE, "003", 3000);
        List<Product> products = List.of(product1, product2, product3);
        productRepository.saveAll(products);

        Order order1 = createPaymentCompletedOrder(LocalDateTime.of(2023, 8, 30, 23, 59, 59), products);
        Order order2 = createPaymentCompletedOrder(now, products);
        Order order3 = createPaymentCompletedOrder(LocalDateTime.of(2023, 8, 31, 23, 59, 59), products);
        Order order4 = createPaymentCompletedOrder(LocalDateTime.of(2023, 9, 1, 0, 0), products);

        // stubbing
        when(mailSendClient.sendEmail(any(String.class), any(String.class), any(String.class), any(String.class)))
                .thenReturn(true);

        // When
        boolean result = orderStatisticsService.sendOrderStatisticsMail(LocalDate.of(2023, 8, 31), "test@test.com");

        // Then
        assertThat(result).isTrue();

        List<MailSendHistory> histories = mailSendHistoryRepository.findAll();
        assertThat(histories).hasSize(1)
                .extracting("content")
                .contains("총 매출 합계는 12000원입니다.");
    }

    private Order createPaymentCompletedOrder(LocalDateTime now, List<Product> products) {
        Order order = Order.builder()
                .products(products)
                .orderStatus(OrderStatus.PAYMENT_COMPLETED)
                .registeredDateTime(now)
                .build();
        return orderRepository.save(order);
    }

    private Product createProduct(ProductType type, String productNumber, int price) {
        return Product.builder()
                .type(type)
                .productNumber(productNumber)
                .price(price)
                .sellingStatus(SELLING)
                .name("메뉴 이름")
                .build();
    }
}
```

<br/>

### Test Double

"Test Double"은 소프트웨어 테스트에서 실제 컴포넌트를 대체하여 테스트를 수행하는 객체를 일컫는 말입니다.  
소프트웨어 테스트를 더 효과적으로 수행하기 위해 실제 컴포넌트를 대신하여 사용되며, 주로 다양한 테스트 시나리오를 시뮬레이션하거나 의존성을 격리할 때 활용됩니다.
 - https://martinfowler.com/articles/mocksArentStubs.html  
 - Dummy
    - 실제로는 사용되지 않는 파라미터나 인자를 전달하기 위해 사용됩니다. 예를 들어, 메서드 시그니처를 맞추기 위해 전달되지만 실제로 사용되지 않는 객체입니다.
    - 아무 것도 하지 않는 깡통 객체
 - Stub (상태 검증)
    - 특정 상황에서 고정된 값을 반환하도록 설정된 객체입니다. 예를 들어, 데이터베이스나 외부 서비스를 흉내내는 데 사용될 수 있습니다.
    - 테스트에서 요청한 것에 대해 미리 준비한 결과를 제공하는 객체, 그 외에는 응답하지 않는다.
 - Spy
    - 실제 객체처럼 동작하면서, 호출된 메서드의 정보를 기록하거나 행동을 변경할 수 있는 객체입니다. 일종의 감시자 역할을 합니다.
    - Stub이면서 호출된 내용으 기록하여 보여줄 수 있는 객체, 일부는 실제 객체처럼 동작시키고 일부만 Stubbing 할 수 있다.
 - Mock (행위 검증)
    - 호출된 메서드의 호출 여부, 호출 횟수, 매개변수 등을 검증하고 미리 정의된 결과를 반환하는 객체입니다. 테스트 중에 객체 간의 상호작용을 검증하는데 유용합니다.
    - 행위에 대한 기대를 명세하고, 그에 따라 동작하도록 만들어진 객체
 - Fake
    - 실제 구현과 유사하지만 간소화되거나 실제 환경에서 사용되는 것보다 더 단순한 구현을 가진 객체입니다. 가령, 메모리 내에서 동작하는 가벼운 데이터베이스 구현이나 파일 시스템 구현 등이 있을 수 있습니다.
    - 단순한 형태로 동일한 기능을 수행하나, 프로덕션에서 쓰기에는 부족한 객체 (ex. FakeRepository)

<br/>

### @Mock, @Spy, @InjectMocks (순수 Mockito 이용)

 - Mockito 클래스 직접 이용
    - MailService 클래스에는 MailSendClient와 MailSendHistoryRepository가 의존성 주입되어 있다.
    - Mockito.mock(타입.class) 으로 모의 객체를 생성해주고, MailService 생성자를 통해 모의 객체를 의존성 주입해준다.
    - Mockito.when()을 통해 모의객체(Mock)의 행동을 지정해줄 수 있다.
    - Mockito.verify()를 통해 모의 객체에 메서드 정보 기록을 확인할 수 있다. (Test Double의 Spy 개념)
```Java
class MailServiceTest {

    @DisplayName("메일 전송 테스트")
    @Test
    void sendMail() {
        // Given
        MailSendClient mailSendClient = Mockito.mock(MailSendClient.class);
        MailSendHistoryRepository mailSendHistoryRepository = Mockito.mock(MailSendHistoryRepository.class);

        MailService mailService = new MailService(mailSendClient, mailSendHistoryRepository);

        Mockito.when(mailSendClient.sendEmail(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(true);

        // When
        boolean result = mailService.sendMail("", "", "", "");

        // Then
        assertThat(result).isTrue();
        Mockito.verify(mailSendHistoryRepository, times(1)).save(any(MailSendHistory.class));
    }
}
```

<br/>

 - 어노테이션 이용
    - @ExtendWith()를 통해 JUnit5의 Mockito 확장을 등록한다.
    - @Mock 을 통해 모의 객체를 자동으로 생성할 수 있다.
    - @InjectMocks를 통해 해당 객체의 생성자를 보고, @Mock 으로 선언된 모의 객체들을 Inject 해준다.
```Java
@ExtendWith(MockitoExtension.class)
class MailServiceTest {

    @Mock
    private MailSendClient mailSendClient;

    @Mock
    private MailSendHistoryRepository mailSendHistoryRepository;

    @InjectMocks
    private MailService mailService;

    @DisplayName("메일 전송 테스트")
    @Test
    void sendMail() {
        // Given
        Mockito.when(mailSendClient.sendEmail(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(true);

        // When
        boolean result = mailService.sendMail("", "", "", "");

        // Then
        assertThat(result).isTrue();
        Mockito.verify(mailSendHistoryRepository, times(1)).save(any(MailSendHistory.class));
    }
}
```

<br/>

 - @Spy 어노테이션
    - @Mock을 통해 모의 객체를 생성하면, 해당 모의 객체를 모든 메서드가 동작하게 된다. 즉, 행동을 정의해주지 않으면 결국에는 아무런 행동을 수행하지 않는다.
    - @Spy는 실제 객체를 기반으로 모의 객체를 만들어준다. 즉, 행동을 정의해주지 않으면 실제 객체에 행동을 수행하게 된다.
    - @Spy는 Mockito.when()으로 Stubbing이 되지 않고, doAnswer(), doNothing(), doReturn() 등으로 Stubbing 해야 한다.
```Java
@ExtendWith(MockitoExtension.class)
class MailServiceTest {

    @Mock
    private MailSendClient mailSendClient;

    @Mock
    private MailSendHistoryRepository mailSendHistoryRepository;

    @InjectMocks
    private MailService mailService;

    @DisplayName("메일 전송 테스트")
    @Test
    void sendMail() {
        // Given
        doReturn(true)
            .when(mailSendClient)
            .sendEmail(anyString(), anyString(), anyString(), anyString());

        // When
        boolean result = mailService.sendMail("", "", "", "");

        // Then
        assertThat(result).isTrue();
        Mockito.verify(mailSendHistoryRepository, times(1)).save(any(MailSendHistory.class));
    }
}
```

<br/>

### BDDMockito

테스트 코드를 BDD 스타일로 많이 작성하게 된다.  
하지만, Mockito를 이용하면 given절에 when() 메서드를 사용하여 혼란이 야기된다.  
떄문에, Mockito 객체가 아닌 BDDMockito가 제공되어 BDD 스타일의 모의 객체를 정의할 수 있는 클래스가 제공된다.  
BDDMockito는 Mockito 클래스를 상속받은 클래스로 모든 동작을 동일하고, BDD 스타일로 메서드가 제공되는 것이다.  

```Java
@ExtendWith(MockitoExtension.class)
class MailServiceTest {

    @Mock
    private MailSendClient mailSendClient;

    @Mock
    private MailSendHistoryRepository mailSendHistoryRepository;

    @InjectMocks
    private MailService mailService;

    @DisplayName("메일 전송 테스트 Mockito")
    @Test
    void sendMailMockito() {
        // Given
        BDDMockito.given(mailSendClient.sendEmail(anyString(), anyString(), anyString(), anyString()))
            .willReturn(true);

        ..
    }

    @DisplayName("메일 전송 테스트 BDDMockito")
    @Test
    void sendMailBDDMockito() {
        // Given
        BDDMockito.given(mailSendClient.sendEmail(anyString(), anyString(), anyString(), anyString()))
            .willReturn(true);

        ..
    }
}
```

<br/>

### 키워드 정리

 - Test Double, Stubbing
    - dummy, fake, stub, spy, mock
 - @Mock, @MockBean, @Spy, @SpyBean, @InjectMocks
 - BDDMockito
 - Classicist VS Mockist
    - Classicist: Mock 객체의 사용은 상대적으로 적으며, 대부분의 의존성은 진짜 객체로 대체 (외부 시스템만 Mock 처리)
    - Mockist: 목(Mock) 객체의 활발한 사용을 강조


