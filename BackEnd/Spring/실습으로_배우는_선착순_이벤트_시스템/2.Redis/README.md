# Redis를 활용하여 문제 해결하기

## 작업 환경 세팅

Redis를 사용하기 위해서 Docker를 통해 Redis 이미지를 다운로드하고 컨테이너화 한다.

 - Terminal 작업
```Bash
$ docker pull redis
$ docker run --name myredis -d -p 6379:6379 redis
$ docker ps
```

 - build.gradle 작업
    - Spring Data Redis 의존성 추가
```
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    ..
}
```

<br/>

## Redis 활용

레디스에서는 INCR 이라는 명령어를 제공한다.  
INCR은 주어진 키(Key)의 값을 1씩 증가시키는 명령어로 원자적(atomic)으로 동작하며, 동시에 여러 클라이언트가 사용해도 안전하게 값을 증가시킬 수 있다.  

 - CouponCountRepository
    - Redis 명령어를 수행할 저장소를 만든다.
    - RedisTemplate를 이용하여 명령어를 수행한다.
```Java
@Repository
public class CouponCountRepository {

    private final RedisTemplate<String, String> redisTemplate;

    public CouponCountRepository(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public Long increment() {
        return redisTemplate
                .opsForValue()
                .increment("coupon_count");
    }
}
```

 - ApplyService
    - 쿠폰 발급 메서드를 수정한다.
    - MySQL을 이용하여 쿠폰의 갯수를 가져오는 부분을 Redis의 INCR 값으로 대체한다.
    - 쿠폰 발급전에 발급된 쿠폰의 갯수를 증가시키고, 발급된 쿠폰의 갯수가 100개보다 많으면 발급하지 않도록 한다.
```Java
@Service
public class ApplyService {

    private final CouponRepository couponRepository;
    private final CouponCountRepository couponCountRepository;

    public ApplyService(CouponRepository couponRepository, CouponCountRepository couponCountRepository) {
        this.couponRepository = couponRepository;
        this.couponCountRepository = couponCountRepository;
    }
    
    public void apply(Long userId) {
        long count = couponCountRepository.increment();

        if (count > 100) {
            return;
        }

        couponRepository.save(new Coupon(userId));
    }
}
```

 - 문제점
    - 해당 방식은 발급하는 쿠폰의 갯수가 많아지면 많아질수록 RDBMS에 부하를 주게 된다.
    - 만약, 사용하는 RDBMS가 특정 이벤트 전용이 아니라 다양한 곳에서 사용하고 있다고 한다면 다른 서비스까지 장애가 발생할 수 있다.
    - MySQL 데이터베이스 서버의 성능이 1분에 100개에 INSERT가 가능하다고 가정했을 때, 쿠폰 발급 이벤트가 10,000개가 요청이 됐다고 가정한다. 해당 이벤트 도중에 주문 생성과 회원 가입 요청이 들어온다면 쿠폰 발급이 100분이 소요되고, 그 이후에 다른 요청이 처리 될 것이다.
    - 즉, 짧은 시간내에 많은 요청이 들어오게 된다면 DB 서버의 리소스에 부하가 발생하고 서비스 지연 혹은 오류로 이어지게 된다.