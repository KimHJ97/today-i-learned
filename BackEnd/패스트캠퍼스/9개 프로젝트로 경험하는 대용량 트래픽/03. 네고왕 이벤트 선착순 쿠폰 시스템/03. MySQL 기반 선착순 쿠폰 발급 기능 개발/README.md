# MySQL 기반 선착순 쿠폰 발급 기능 개발

## 쿠폰 엔티티 발급 기능

 - ``
```java
// 예외 코드
public enum ErrorCode {
    INVALID_COUPON_ISSUE_QUANTITY, // 발급 수량 검증 에러
    INVALID_COUPON_ISSUE_DATE,     // 발급 기한 검증 에러
    COUPON_NOT_EXIST,
    DUPLICATED_COUPON_ISSUE,
}

// CouponIssueException(커스텀 예외)
@Getter
public class CouponIssueException extends RuntimeException {

    private final ErrorCode errorCode;
    private final String message;

    public CouponIssueException(ErrorCode errorCode, String message) {
        this.errorCode = errorCode;
        this.message = message;
    }

    @Override
    public String getMessage() {
        return "[%s] %s".formatted(errorCode, message);
    }
}
```

 - `Coupon 엔티티`
```java
@Entity
@Table(name = "coupons")
public class Coupon extends BaseTimeEntity {

    // ..

    // 발급 수량 검증
    public boolean availableIssueQuantity() {
        if (totalQuantity == null) {
            return true;
        }
        return totalQuantity > issuedQuantity;
    }

    // 발급 기한 검증
    public boolean availableIssueDate() {
        LocalDateTime now = LocalDateTime.now();
        return dateIssueStart.isBefore(now) && dateIssueEnd.isAfter(now);
    }

    // 발급 처리
    public void issue() {
        if (!availableIssueQuantity()) {
            // throw new RuntimeException("수량 검증");
            throw new CouponIssueException(INVALID_COUPON_ISSUE_QUANTITY, "발급 가능한 수량을 초과합니다. total : %s, issued: %s".formatted(totalQuantity, issuedQuantity));
        }
        if (!availableIssueDate()) {
            // throw new RuntimeException("기한 검증");
            throw new CouponIssueException(INVALID_COUPON_ISSUE_DATE, "발급 가능한 일자가 아닙니다. request : %s, issueStart: %s, issueEnd: %s".formatted(LocalDateTime.now(), dateIssueStart, dateIssueEnd));
        }

        issuedQuantity++;
    }
}
```
<br/>

 - `CouponTest`
```java
class CouponTest {

    @Test
    @DisplayName("발급 수량이 남아있다면 true를 반환한다.")
    void availableIssueQuantity_1() {
        // given
        Coupon coupon = Coupon.builder()
                .totalQuantity(100)
                .issuedQuantity(99)
                .build();

        // when
        boolean result = coupon.availableIssueQuantity();

        // then
        Assertions.assertTrue(result);
    }

    @Test
    @DisplayName("발급 수량이 소진되었다면 false를 반환한다.")
    void availableIssueQuantity_2() {
        // given
        Coupon coupon = Coupon.builder()
                .totalQuantity(100)
                .issuedQuantity(100)
                .build();

        // when
        boolean result = coupon.availableIssueQuantity();

        // then
        Assertions.assertFalse(result);
    }

    @Test
    @DisplayName("최대 발급 수량이 설정되지 않았다면 true를 반환한다.")
    void availableIssueQuantity_3() {
        // given
        Coupon coupon = Coupon.builder()
                .totalQuantity(null)
                .issuedQuantity(100)
                .build();

        // when
        boolean result = coupon.availableIssueQuantity();

        // then
        Assertions.assertTrue(result);
    }

    @Test
    @DisplayName("발급 기간이 시작되지 않았다면 false를 반환한다.")
    void availableIssueDate_1() {
        // given
        Coupon coupon = Coupon.builder()
                .dateIssueStart(LocalDateTime.now().plusDays(1))
                .dateIssueEnd(LocalDateTime.now().plusDays(2))
                .build();

        // when
        boolean result = coupon.availableIssueDate();

        // then
        Assertions.assertFalse(result);
    }

    @Test
    @DisplayName("발급 기간에 해당되면 true를 반환한다.")
    void availableIssueDate_2() {
        // given
        Coupon coupon = Coupon.builder()
                .dateIssueStart(LocalDateTime.now().minusDays(1))
                .dateIssueEnd(LocalDateTime.now().plusDays(2))
                .build();

        // when
        boolean result = coupon.availableIssueDate();

        // then
        Assertions.assertTrue(result);
    }

    @Test
    @DisplayName("발급 기간이 종료되면 false를 반환한다.")
    void availableIssueDate_3() {
        // given
        Coupon coupon = Coupon.builder()
                .dateIssueStart(LocalDateTime.now().minusDays(2))
                .dateIssueEnd(LocalDateTime.now().minusDays(1))
                .build();

        // when
        boolean result = coupon.availableIssueDate();

        // then
        Assertions.assertFalse(result);
    }

    @Test
    @DisplayName("발급 수량과 발급 기간이 유효하다면 발급에 성공한다")
    void issue_1() {
        // given
        Coupon coupon = Coupon.builder()
                .totalQuantity(100)
                .issuedQuantity(99)
                .dateIssueStart(LocalDateTime.now().minusDays(1))
                .dateIssueEnd(LocalDateTime.now().plusDays(2))
                .build();
        // when
        coupon.issue();
        // then
        Assertions.assertEquals(coupon.getIssuedQuantity(), 100);
    }

    @Test
    @DisplayName("발급 수량을 초과하면 예외를 반환한다")
    void issue_2() {
        // given
        Coupon coupon = Coupon.builder()
                .totalQuantity(100)
                .issuedQuantity(100)
                .dateIssueStart(LocalDateTime.now().minusDays(1))
                .dateIssueEnd(LocalDateTime.now().plusDays(2))
                .build();
        // when & then
        CouponIssueException exception = Assertions.assertThrows(CouponIssueException.class, coupon::issue);
        Assertions.assertEquals(exception.getErrorCode(), INVALID_COUPON_ISSUE_QUANTITY);
    }

    @Test
    @DisplayName("발급 기간이 아니면 예외를 반환한다")
    void issue_3() {
        // given
        Coupon coupon = Coupon.builder()
                .totalQuantity(100)
                .issuedQuantity(99)
                .dateIssueStart(LocalDateTime.now().plusDays(1))
                .dateIssueEnd(LocalDateTime.now().plusDays(2))
                .build();
        // when & then
        CouponIssueException exception = Assertions.assertThrows(CouponIssueException.class, coupon::issue);
        Assertions.assertEquals(exception.getErrorCode(), INVALID_COUPON_ISSUE_DATE);
    }
}
```
<br/>

## 쿠폰 발급 기능

 - `build.gradle.kts`
    - QueryDSL 의존성 추가
    - gradle 명령어로 compileJava 태스크를 실행하면 Q클래스가 생성된다.
```kts
subprojects {
    dependencies {
        ..
        implementation("com.querydsl:querydsl-jpa:5.0.0:jakarta")
        annotationProcessor("com.querydsl:querydsl-apt:5.0.0:jakarta")
        annotationProcessor("jakarta.annotation:jakarta.annotation-api")
        annotationProcessor("jakarta.persistence:jakarta.persistence-api")
    }
}
```
<br/>

 - `QueryDslConfiguration`
    - QueryDSL를 사용하기 위해 JPAQueryFactory 빈을 정의한다.
```java
@RequiredArgsConstructor
@Configuration
public class QueryDslConfiguration {

  @PersistenceContext
  private final EntityManager entityManager;

  @Bean
  public JPAQueryFactory jpaQueryFactory() {
    return new JPAQueryFactory(entityManager);
  }
}
```
<br/>

 - `Repository`
    - CouponJpaRepository: Coupon 엔티티를 제어하기 위한 Repository
    - CouponIssueJpaRepository: CouponIssue 엔티티를 제어하기 위한 Repository
    - CouponIssueRepository: CouponIssue 엔티티에 대해서 QueryDSL를 사용하는 구현체
```java
/* CouponJpaRepository */
public interface CouponJpaRepository extends JpaRepository<Coupon, Long> {
}

/* CouponIssueJpaRepository */
public interface CouponIssueJpaRepository extends JpaRepository<CouponIssue, Long> {
}

/* CouponIssueRepository */
@RequiredArgsConstructor
@Repository
public class CouponIssueRepository {

    private final JPQLQueryFactory queryFactory;

    public CouponIssue findFirstCouponIssue(long couponId, long userId) {
        return queryFactory.selectFrom(couponIssue)
                .where(couponIssue.couponId.eq(couponId))
                .where(couponIssue.userId.eq(userId))
                .fetchFirst();
    }
}
```

 - `CouponIssueService`
```java
@RequiredArgsConstructor
@Service
public class CouponIssueService {

    private final CouponJpaRepository couponJpaRepository;
    private final CouponIssueJpaRepository couponIssueJpaRepository;
    private final CouponIssueRepository couponIssueRepository;

    // 쿠폰 발급
    @Transactional
    public void issue(long couponId, long userId) {
        Coupon coupon = findCoupon(couponId);
        coupon.issue();
        saveCouponIssue(couponId, userId);
    }

    // 쿠폰 조회
    @Transactional(readOnly = true)
    public Coupon findCoupon(long couponId) {
        return couponJpaRepository.findById(couponId).orElseThrow(() -> {
            throw new CouponIssueException(COUPON_NOT_EXIST, "쿠폰 정책이 존재하지 않습니다. %s".formatted(couponId));
        });
    }

    // 쿠폰 발급 저장
    @Transactional
    public CouponIssue saveCouponIssue(long couponId, long userId) {
        checkAlreadyIssuance(couponId, userId);
        CouponIssue couponIssue = CouponIssue.builder()
                .couponId(couponId)
                .userId(userId)
                .build();
        return couponIssueJpaRepository.save(couponIssue);
    }

    // 이미 해당 유저가 쿠폰을 발급한 경험이 있는지 검증
    private void checkAlreadyIssuance(long couponId, long userId) {
        CouponIssue issue = couponIssueRepository.findFirstCouponIssue(couponId, userId);
        if (issue != null) {
            throw new CouponIssueException(DUPLICATED_COUPON_ISSUE, "이미 발급된 쿠폰입니다. user_id: %d, coupon_id: %d".formatted(userId, couponId));
        }
    }
}
```
<br/>

### 테스트 코드

 - `TestConfig`
```java
@Transactional
@ActiveProfiles("test")
@TestPropertySource(properties = "spring.config.name=application-core")
@SpringBootTest(classes = CouponCoreConfiguration.class)
public class TestConfig {
}
```
<br/>

 - ``
```java
class CouponIssueServiceTest extends TestConfig {

    @Autowired
    CouponIssueService sut;

    @Autowired
    CouponIssueJpaRepository couponIssueJpaRepository;

    @Autowired
    CouponIssueRepository couponIssueRepository;

    @Autowired
    CouponJpaRepository couponJpaRepository;

    @BeforeEach
    void clean() {
        couponJpaRepository.deleteAllInBatch();
        couponIssueJpaRepository.deleteAllInBatch();
    }

    @Test
    @DisplayName("쿠폰 발급 내역이 존재하면 예외를 반환한다")
    void saveCouponIssue_1() {
        // given
        CouponIssue couponIssue = CouponIssue.builder()
                .couponId(1L)
                .userId(1L)
                .build();
        couponIssueJpaRepository.save(couponIssue);

        // when & then
        CouponIssueException exception = Assertions.assertThrows(CouponIssueException.class, () -> {
            sut.saveCouponIssue(couponIssue.getCouponId(), couponIssue.getUserId());
        });
        Assertions.assertEquals(exception.getErrorCode(), ErrorCode.DUPLICATED_COUPON_ISSUE);
    }

    @Test
    @DisplayName("쿠폰 발급 내역이 존재하지 않는다면 쿠폰을 발급한다")
    void saveCouponIssue_2() {
        // given
        long couponId = 1L;
        long userId = 1L;

        // when
        CouponIssue result = sut.saveCouponIssue(couponId, userId);

        // then
        Assertions.assertTrue(couponIssueJpaRepository.findById(result.getId()).isPresent());
    }

    @Test
    @DisplayName("발급 수량, 기한, 중복 발급 문제가 없다면 쿠폰을 발급한다")
    void issue_1() {
        // given
        long userId = 1;
        Coupon coupon = Coupon.builder()
                .couponType(CouponType.FIRST_COME_FIRST_SERVED)
                .title("선착순 테스트 쿠폰")
                .totalQuantity(100)
                .issuedQuantity(0)
                .dateIssueStart(LocalDateTime.now().minusDays(1))
                .dateIssueEnd(LocalDateTime.now().plusDays(1))
                .build();
        couponJpaRepository.save(coupon);

        // when
        sut.issue(coupon.getId(), userId);

        // then
        Coupon couponResult = couponJpaRepository.findById(coupon.getId()).get();
        Assertions.assertEquals(couponResult.getIssuedQuantity(), 1);

        CouponIssue couponIssueResult = couponIssueRepository.findFirstCouponIssue(coupon.getId(), userId);
        Assertions.assertNotNull(couponIssueResult);
    }


    @Test
    @DisplayName("발급 수량에 문제가 있다면 예외를 반환한다")
    void issue_2() {
        // given
        long userId = 1;
        Coupon coupon = Coupon.builder()
                .couponType(CouponType.FIRST_COME_FIRST_SERVED)
                .title("선착순 테스트 쿠폰")
                .totalQuantity(100)
                .issuedQuantity(100)
                .dateIssueStart(LocalDateTime.now().minusDays(1))
                .dateIssueEnd(LocalDateTime.now().plusDays(1))
                .build();
        couponJpaRepository.save(coupon);

        // when & then
        CouponIssueException exception = Assertions.assertThrows(CouponIssueException.class, () -> {
            sut.issue(coupon.getId(), userId);
        });
        Assertions.assertEquals(exception.getErrorCode(), INVALID_COUPON_ISSUE_QUANTITY);
    }

    @Test
    @DisplayName("발급 기한에 문제가 있다면 예외를 반환한다")
    void issue_3() {
        // given
        long userId = 1;
        Coupon coupon = Coupon.builder()
                .couponType(CouponType.FIRST_COME_FIRST_SERVED)
                .title("선착순 테스트 쿠폰")
                .totalQuantity(100)
                .issuedQuantity(0)
                .dateIssueStart(LocalDateTime.now().minusDays(2))
                .dateIssueEnd(LocalDateTime.now().minusDays(1))
                .build();
        couponJpaRepository.save(coupon);

        // when & then
        CouponIssueException exception = Assertions.assertThrows(CouponIssueException.class, () -> {
            sut.issue(coupon.getId(), userId);
        });
        Assertions.assertEquals(exception.getErrorCode(), INVALID_COUPON_ISSUE_DATE);
    }

    @Test
    @DisplayName("중복 발급 검증에 문제가 있다면 예외를 반환한다")
    void issue_4() {
        // given
        long userId = 1;
        Coupon coupon = Coupon.builder()
                .couponType(CouponType.FIRST_COME_FIRST_SERVED)
                .title("선착순 테스트 쿠폰")
                .totalQuantity(100)
                .issuedQuantity(0)
                .dateIssueStart(LocalDateTime.now().minusDays(1))
                .dateIssueEnd(LocalDateTime.now().plusDays(1))
                .build();
        couponJpaRepository.save(coupon);

        CouponIssue couponIssue = CouponIssue.builder()
                .couponId(coupon.getId())
                .userId(userId)
                .build();
        couponIssueJpaRepository.save(couponIssue);

        // when & then
        CouponIssueException exception = Assertions.assertThrows(CouponIssueException.class, () -> {
            sut.issue(coupon.getId(), userId);
        });
        Assertions.assertEquals(exception.getErrorCode(), DUPLICATED_COUPON_ISSUE);
    }

    @Test
    @DisplayName("쿠폰이 존재하지 않는다면 예외를 반환한다")
    void issue_5() {
        // given
        long userId = 1;
        long couponId = 1;

        // when & then
        CouponIssueException exception = Assertions.assertThrows(CouponIssueException.class, () -> {
            sut.issue(couponId, userId);
        });
        Assertions.assertEquals(exception.getErrorCode(), COUPON_NOT_EXIST);
    }
}
```

## 쿠폰 발급 API

 - `CouponIssueRequestService`
```java
@RequiredArgsConstructor
@Service
public class CouponIssueRequestService {

    private final CouponIssueService couponIssueService;
    private final Logger log = LoggerFactory.getLogger(this.getClass().getSimpleName());

    public void issueRequestV1(CouponIssueRequestDto requestDto) {
        couponIssueService.issue(requestDto.couponId(), requestDto.userId());
        log.info("쿠폰 발급 완료. couponId: %s, userId: %s".formatted(requestDto.couponId(), requestDto.userId()));
    }

}
```
<br/>

 - `CouponIssueController`
```java
@RequiredArgsConstructor
@RestController
public class CouponIssueController {

    private final CouponIssueRequestService couponIssueRequestService;

    @PostMapping("/v1/issue")
    public CouponIssueResponseDto issueV1(@RequestBody CouponIssueRequestDto body) {
        couponIssueRequestService.issueRequestV1(body);
        return new CouponIssueResponseDto(true, null);
    }
}
```
<br/>

 - `CouponControllerAdvice`
```java
@RestControllerAdvice
public class CouponControllerAdvice {

    @ExceptionHandler(CouponIssueException.class)
    public CouponIssueResponseDto couponIssueExceptionHandler(CouponIssueException exception) {
        return new CouponIssueResponseDto(false, exception.getErrorCode().message);
    }
}
```
<br/>

## 트래픽이 높아지는 경우 문제점 파악

 - `locustfile-issueV1.py`
```py
import random
from locust import task, FastHttpUser, stats

stats.PERCENTILES_TO_CHART = [0.95, 0.99]


class CouponIssueV1(FastHttpUser):
    connection_timeout = 10.0
    network_timeout = 10.0

    @task
    def issue(self):
        payload = {
            "userId": random.randint(1, 10000000),
            "couponId": 1
        }
        with self.rest("POST", "/v1/issue", json=payload):
            pass
```
<br/>

### 병목 지점별 해결 방법

 - API 서버 부하 문제
    - API 서버 확장으로 부하 해소
    - API 서버 수평 확장(Scale out)
 - DB 서버 병목
    - API 서버 확장으로 해소 불가능
    - 캐시, 데이터베이스 서버 확장(Master, Slave), 샤딩 등 이용

### 동시성 이슈

 - 쿠폰 발급 요청시 동시에 발생되는 경우
```
1. User1, 2, 3이 동시에 요청이 들어왔다.
2. 발급된 쿠폰 수량을 확인했는데, 0이다.
3. 발급 수량을 1 증가시키고, 쿠폰을 발급한다.

발급된 수량은 총 3개이지만, 수량 증가는 1개이다.
```
<br/>

 - 쿠폰 발급 요청시 동시에 발생되는 경우(LOCK)
    - LOCK을 적용하면 공유 자원을 동시에 접근해서 문제가 될 수 있는 부분을 순차 처리하도록 한다.
    - 하지만, LOCK은 처리량의 병목을 발생시킨다.
```
1. User1이 발급된 쿠폰 수량을 확인한다. 이떄 Lock이 걸린다.
2. User2가 발급된 쿠폰 수량을 확인하려고 하지만 Lock이 걸려있어 대기한다.
3. User1이 발급 수량을 1 증가시키고, 쿠폰을 발급한다. 이후에 Lock을 해제한다.
4. 대기중이던 User2가 발급된 쿠폰 수량을 확인한다. 이떄 Lock이 걸린다.
..

수량 증가만큼 쿠폰이 정상적으로 발급된다.
```
<br/>
