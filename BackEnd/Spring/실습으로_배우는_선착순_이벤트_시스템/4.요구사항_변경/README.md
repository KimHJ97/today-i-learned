# 요구사항 변경

현재 한 명이 여러 개의 쿠폰을 중복해서 발급이 가능하다.  
하지만, 대부분의 선착선 이벤트는 1인당 쿠폰 발급 1개로 제한하는 경우가 많다.  

<br/>

1인당 쿠폰 발급 갯수를 1개로 제한하기 위해서는 데이터베이스의 유니크 키를 사용하는 방법이 있을 수 있다.  
userId와 couponType 컬럼을 추가하고, 해당 컬럼에 유니크 키를 만들어 데이터베이스에 1개만 생성될 수 있도록 하는 방법이다. (실용적이지는 않음)  

<br/>

두 번째로는 범위로 Lock을 잡고, 처음에 쿠폰 발급 여부를 가져와서 판단하는 방식이다.  
하지만, API에서 쿠폰 발급 가능 여부만 판단하고 실제로 쿠폰 생성은 컨슈머에서 진행하고 있다.  
즉, 시간차로 인해 2개 이상 발급이 가능할 수 있다.  

<br/>

세 번째로는 현재 userId별로 쿠폰 발급 갯수를 1개로 제한하기만 하면 되기 떄문에, set 데이터 타입을 이용할 수 있다.  
set은 값을 유니크하게 저장할 수 있는 자료 구조이다. 따라서, 값을 2번 저장해도 1개만 남는 특성이 있으며, 요소의 존재 여부를 빠르게 확인할 수 있다.  

<br/>

## 프로젝트 코드

 - AppliedUserRepository
```Java
@Repository
public class AppliedUserRepository {
    private final RedisTemplate<String, String> redisTemplate;

    public AppliedUserRepository(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public Long add(Long userId) {
        return redisTemplate
                .opsForSet()
                .add("applied_user", userId.toString());
    }
}
```

 - ApplyService
```Java
@Service
public class ApplyService {

    private final CouponRepository couponRepository;
    private final CouponCountRepository couponCountRepository;
    private final CouponCreateProducer couponCreateProducer;
    private final AppliedUserRepository appliedUserRepository;

    public ApplyService(CouponRepository couponRepository, CouponCountRepository couponCountRepository, CouponCreateProducer couponCreateProducer, AppliedUserRepository appliedUserRepository) {
        this.couponRepository = couponRepository;
        this.couponCountRepository = couponCountRepository;
        this.couponCreateProducer = couponCreateProducer;
        this.appliedUserRepository = appliedUserRepository;
    }

    public void apply(Long userId) {
        Long apply = appliedUserRepository.add(userId);
        if(apply != 1) {
            return;
        }

        long count = couponCountRepository.increment();

        if (count > 100) {
            return;
        }

        couponCreateProducer.create(userId);
    }
}
```

 - ApplyServiceTest
```Java
@SpringBootTest
class ApplyServiceTest {
    ..

    @Test
    public void 한명당_한개의쿠폰만_발급() throws InterruptedException {
        int threadCount = 1000;
        ExecutorService executorService = Executors.newFixedThreadPool(32);
        CountDownLatch latch = new CountDownLatch(threadCount);

        for (int i = 0; i < threadCount; i++) {
            long userId = i;
            executorService.submit(() -> {
                try {
                    applyService.apply(1L);
                } finally {
                    latch.countDown();
                }
            });
        }
        latch.await();

        Thread.sleep(10000);

        // then
        long count = couponRepository.count();
        assertThat(count).isEqualTo(1);
    }
}
```