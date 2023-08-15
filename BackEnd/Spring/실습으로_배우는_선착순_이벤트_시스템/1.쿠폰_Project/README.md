# 선착순 이벤트 프로젝트 만들기

## Spring Boot 프로젝트 만들기

 - https://start.spring.io/
```
Project
 - Gradle Project

Spring Boot
 - 3.0.9

Project Metadata
 - Group: com.example
 - Artifact: coupon-system
 - Name: coupon-system
 - Description: Demo project for Spring Boot
 - Package name: com.example.couponsystem
 - Packaging: Jar
 - Java: 17
```

 - 필요없는 파일 삭제 및 모듈 생성
```
1. '/src' 디렉토리 삭제

2. coupon-system 하위에 새로운 모듈 생성
 - [프로젝트 우클릭 > New > Module..]
    - Project: Gradle Project
    - Spring Boot: 3.0.9
    - Project Metadata
        - Group: com.example
        - Artifact: api
        - Name: api
        - Description: Demo project for Spring Boot
        - Package name: com.example.api
        - Packaging: Jar
        - Java: 17
    - Dependencies
        - Spring Web
        - MySQL Driver
        - Spring Data JPA
```

## 선착순 쿠폰 이벤트 시스템 코드 만들기

 - 요구사항 정의
```
선착순 100명에게 할인 쿠폰을 제공하는 이벤트를 진행한다.

이 이벤트는 아래와 같은 조건을 만족하여야 한다.
 - 선착순 100명에게만 지급되어야 한다.
 - 101개 이상이 지급되면 안 된다.
 - 순간적으로 몰리는 트래픽을 버틸 수 있어야 한다.
```

<br/>

 - application.yml
```yml
spring:
  jpa:
    hibernate:
      ddl-auto: create
    show-sql: true
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://127.0.0.1:3306/coupon_example
    username: root
    password: 1234
```

 - Coupon 엔티티 클래스
```Java
@Entity
public class Coupon {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    public Coupon() {
    }

    public Coupon(Long userId) {
        this.userId = userId;
    }

    public Long getId() {
        return id;
    }
}
```

 - CouponRepository
```Java
public interface CouponRepository extends JpaRepository<Coupon, Long> {
}
```

 - ApplyService
    - 쿠폰의 갯수를 조회하고, 100개 미만이라면 쿠폰을 발급한다.
```Java
@Service
public class ApplyService {

    private final CouponRepository couponRepository;

    public ApplyService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }
    
    public void apply(Long userId) {
        long count = couponRepository.count();

        if (count > 100) {
            return;
        }

        couponRepository.save(new Coupon(userId));
    }
}
```

 - ApplyServiceTest
    - 쿠폰 발급 메소드에 대해서 테스트한다.
    - 한 번만 응모하는 경우, 여러번 동시에 응모하는 경우를 테스타한다.
    - ExecutorService는 병렬 작업을 간단하게 할 수 있도록 도와주는 Java API이다.
    - CountDownLatch는 다른 쓰레드에서 수행하는 작업을 기다리도록 도와주는 클래스이다.
    - 레이스 컨디션: 두 개 이상의 쓰레드가 공유 데이터에 액세스하고, 동시 작업을 하려고 할 때 발생하는 문제
```Java
@SpringBootTest
class ApplyServiceTest {

    @Autowired
    private ApplyService applyService;

    @Autowired
    private CouponRepository couponRepository;

    @Test
    public void 한번만응모() {
        applyService.apply(1L);
        long count = couponRepository.count();

        // then
        assertThat(count).isEqualTo(1);
    }

    @Test
    public void 여러명응모() throws InterruptedException {
        int threadCount = 1000;
        ExecutorService executorService = Executors.newFixedThreadPool(32);
        CountDownLatch latch = new CountDownLatch(threadCount);

        for (int i = 0; i < threadCount; i++) {
            long userId = i;
            executorService.submit(() -> {
                try {
                    applyService.apply(userId);
                } finally {
                    latch.countDown();
                }
            });
        }
        latch.await();

        // then
        long count = couponRepository.count();
        assertThat(count).isEqualTo(100);
    }
}
```