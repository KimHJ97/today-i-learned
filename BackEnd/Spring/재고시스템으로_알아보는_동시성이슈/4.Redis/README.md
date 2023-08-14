# Redis 이용해보기

 - Lettuce
    - setnx 명령어를 활용하여 분산락 구현 (spin lock 방식)
 - Redisson
    - pub-sub 기반으로 Lock 구현 제공

<br/>

## 작업 환경 세팅

 - Redis 이미지 다운로드 및 컨테이너 실행
```Bash
$ docker pull redis
$ docker run --name myredis -d -p 6379:6379 redis
$ docker ps
```

 - Redis 의존성 추가하기
```
dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-data-redis'
	implementation 'org.redisson:redisson-spring-boot-starter:3.17.4'

	..
}
```

<br/>

## Lettuce 활용

MySQL Named Lock과 동일하게 로직 수행전에 Key와 setnx 명령어를 활용하여 Lock을 수행하고, 로직이 끝나면 unlock 메소드를 통해서 락을 해제한다.
 - 락 설정 후 작업을 마치지 못해 락이 영구히 남아 있을 수 있습니다. 이를 방지하기 위해 락의 만료 시간을 설정하거나, 락이 설정되었을 때 클라이언트가 예외 상황에서도 락을 해제하도록 보장하는 로직을 구현해야 합니다.
 - Redis의 SETNX 명령어는 단일 명령으로 락을 설정하는 데 사용됩니다. 좀 더 복잡한 동기화 시나리오에는 레디스의 다른 명령어나 라이브러리를 함께 활용해야 할 수 있습니다.

 - RedisLockRepository
```Java
@Component
public class RedisLockRepository {

    private RedisTemplate<String, String> redisTemplate;

    public RedisLockRepository(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public Boolean lock(Long key) {
        return redisTemplate
                .opsForValue()
                .setIfAbsent(generateKey(key), "lock", Duration.ofMillis(3_000));
    }

    public Boolean unlock(Long key) {
        return redisTemplate.delete(generateKey(key));
    }

    private String generateKey(Long key) {
        return key.toString();
    }
}
```

 - LettuceLockStockFacade
```Java
@Component
public class LettuceLockStockFacade {

    private RedisLockRepository redisLockRepository;
    private StockService stockService;

    public LettuceLockStockFacade(RedisLockRepository redisLockRepository, StockService stockService) {
        this.redisLockRepository = redisLockRepository;
        this.stockService = stockService;
    }

    public void decrease(Long key, Long quantity) throws InterruptedException {
        while (!redisLockRepository.lock(key)) {
            Thread.sleep(100);
        }

        try {
            stockService.decrease(key, quantity);
        } finally {
            redisLockRepository.unlock(key);
        }
    }
}
```

<br/>

## Redisson 활용

Redisson은 자신이 갖고있는 Lock을 해제할 때 채널에 메시지를 보내서 Lcok을 획득해야하는 쓰레드들에게 Lock 획득을 하라고 전달한다.  
Lock 획득을 해야하는 쓰레드들은 메시지 전달을 받았을 때 Lock 획득을 시도하게 된다.  
Lettuce는 계속 Lock 획득을 시도하는 반면에, Redisson은 Lock 해지가 되었을 때 한 번 혹은 몇 번만 수행하기 때문에 Redis의 부하를 줄여준다.  

<br/>

 - RedissonLockStockFacade
```Java
@Component
public class RedissonLockStockFacade {

    private RedissonClient redissonClient;
    private StockService stockService;

    public RedissonLockStockFacade(RedissonClient redissonClient, StockService stockService) {
        this.redissonClient = redissonClient;
        this.stockService = stockService;
    }

    public void decrease(Long key, Long quantity) {
        RLock lock = redissonClient.getLock(key.toString());

        try {
            boolean available = lock.tryLock(10, 1, TimeUnit.SECONDS);

            if (!available) {
                System.out.println("lock 획득 실패");
                return;
            }

            stockService.decrease(key, quantity);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        } finally {
            lock.unlock();
        }
    }
}
```

<br/>

## Lettuce와 Redisson 장단점

 - Lettuce
    - 구현이 간단하다.
    - Spring Data Redis를 이용하면 Lettuce가 기본 라이브러리로 별도의 라이브러리를 설치하지 않아도 된다.
    - Spin Lock 방식으로 동시에 많은 쓰레드가 Lock 획득 대기 상태라면 Redis에 부하가 갈 수 있다.
 - Redisson
    - 락 획득 재시도를 기본으로 제공한다.
    - pub-sub 방식으로 구현이 되어있기 때문에 Lettuce와 비교했을 때 Redis에 부하가 덜 간다.
    - 별도의 라이브러리 의존성을 추가해야 한다.
    - Lock을 라이브러리 차원에서 제공해주기 떄문에 사용법을 공부해야 한다.

실무에서는 보통 재시도가 필요하지 않은 Lock은 Lettuce 활용하고, 재시도가 필요한 경우에는 Redisson을 활용한다.