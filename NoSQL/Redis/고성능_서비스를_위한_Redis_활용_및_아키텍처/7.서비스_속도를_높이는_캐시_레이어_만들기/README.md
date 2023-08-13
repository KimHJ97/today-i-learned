# 서비스 속도를 높이는 캐시 레이어 만들기

## `캐싱(Caching)`

캐싱(Caching)은 데이터나 리소스를 미리 저장하여 이후에 빠르게 접근하거나 재사용하는 기술입니다.  
컴퓨터 시스템에서 캐싱은 성능 향상과 리소스 효율성을 높이기 위해 널리 사용되는 중요한 개념입니다.
 - Cache: 성능 향상을 위해 값을 복사해놓는 임시 기억 장치
 - Cache에 복사본을 저장해놓고 읽음으로서 속도가 느린 장치로의 접근 횟수를 줄임
 - Cache의 데이터는 원본이 아니며 언제든 사라질 수 있음
 - 캐싱 활용 분야
    - 웹 브라우징: 웹 브라우저는 방문한 웹 페이지의 이미지, 스크립트, 스타일 시트 등을 로컬에 캐싱하여 동일한 페이지를 빠르게 로드할 수 있게 합니다. 이는 페이지 로딩 시간을 줄이고 네트워크 트래픽을 감소시키는 데 도움이 됩니다.
    - 데이터베이스: 데이터베이스에서도 데이터를 메모리나 디스크에 캐싱하여 쿼리의 반복 실행 시간을 줄이고 응답 시간을 개선합니다.
    - 프로그래밍: 프로그래밍 언어나 컴파일러는 이전에 계산한 결과를 캐싱하여 중복된 계산을 피하고 실행 속도를 향상시킵니다.
    - API 호출: 외부 서비스의 API 호출 결과를 캐싱하여 반복 요청 시에 네트워크 비용을 절약하고 응답 시간을 줄입니다.
    - 그래픽 렌더링: 그래픽 처리에서는 이미지나 3D 모델의 일부를 캐싱하여 화면 렌더링 속도를 향상시킵니다.

<br/>

### 캐싱 관련 개념들
 - 캐시
    - 캐시는 데이터나 리소스의 사본을 저장하는 임시 저장소입니다. 원본 데이터에 빠르게 접근하고자 할 때 사용됩니다. 캐시는 보통 더 빠른 접근 속도를 제공하기 위해 주로 메모리에 위치합니다.
 - 캐시 적중(Cache Hit)
    - 캐시에 접근해 데이터를 발견함
    - 요청한 데이터가 캐시에 존재하여 빠르게 접근할 수 있는 경우를 말합니다. 데이터를 캐시에서 찾았으므로 원본 데이터에 접근할 필요가 없습니다.
 - 캐시 미스(Cache Miss)
    - 캐시에 접근했으나 데이터를 발견하지 못함
    - 요청한 데이터가 캐시에 없어서 원본 데이터를 가져와야 하는 경우를 말합니다. 캐시 미스가 발생하면 원본 데이터를 캐시에 저장하고 다음에 접근할 때 활용합니다.
 - 캐시 키(Cache Key)
    - 캐시에서 데이터를 식별하기 위해 사용되는 고유한 식별자입니다. 보통 요청에 기반한 정보를 사용하여 생성됩니다. 예를 들어 URL이나 요청 매개변수가 캐시 키가 될 수 있습니다.
 - 캐시 삭제 정책(Eviction Policy)
    - 캐시의 데이터 공간 확보를 위해 저장된 데이터를 삭제
    - 캐시 제거(Cache Eviction): 캐시가 가득 찬 경우 더 이상의 데이터를 저장하기 위해 더 오래된 데이터를 제거하는 과정입니다. 대표적인 방식으로 LRU(Least Recently Used) 등이 있습니다.
    - 캐시 무효화(Cache Invalidation): 원본 데이터가 변경되었거나 만료된 경우, 캐시에서 해당 데이터를 무효화시켜야 합니다. 데이터 일관성을 유지하기 위한 작업입니다.
 - 캐시 전략(Caching Strategy)
    - 환경에 따라 적합한 캐시 운영 방식을 선택할 수 있음(Cache-Aside, Write-Througe 등)
    - 어떤 데이터를 캐시하고 어떤 방식으로 캐시를 관리할지 결정하는 전략입니다. LRU, LFU(Least Frequently Used), TTL(Time To Live) 등의 전략을 사용할 수 있습니다.

<br/>

### 캐시 전략

 - Cache-Aside(Lazy Loading)
    - 데이터 요청이 들어올 때마다 캐시에 해당 데이터가 있는지 확인하고, 캐시에 없는 경우에만 데이터를 가져와서 캐시에 저장하는 전략입니다.
    - 항상 캐시를 먼저 체크하고, 없으면 원본(ex:DB)에서 읽어온 후에 캐시를 저장
    - 장점: 필요한 데이터만 캐시에 저장되고, Cache Miss가 있어도 치명적이지 않음
    - 단점: 최초 접근은 느리고, 업데이트 주기가 일정하지 않기 때문에 캐시가 최신 데이터가 아닐 수 있음
 - Write-Through
    - 데이터가 변경될 때마다 동시에 캐시와 원본 데이터를 갱신하는 방식입니다. 데이터의 일관성을 유지하며, 캐시에 항상 최신 데이터가 유지됩니다.
    - 데이터를 쓸 때 항상 캐시를 업데이트하여 최신 상태를 유지
    - 장점: 캐시가 항상 동기화되어 있어 데이터가 최신이다.
    - 단점: 자주 사용하지 않는 데이터도 캐시되고, 쓰기 지연시간이 증가한다.
 - Write-Back(Write-Behind)
    - 데이터가 변경되면 캐시만 갱신하고, 실제 데이터베이스나 원본에는 나중에 갱신하는 방식입니다. 이는 변경 트래픽의 부하를 줄이고 성능을 향상시킬 수 있습니다.
    - 데이터를 캐시에만 쓰고, 캐시의 데이터를 일정 주기로 DB에 업데이트
    - 장점: 쓰기가 많은 경우 DB 부하를 줄일 수 있음
    - 단점: 캐시가 DB에 쓰기 전에 장애가 생기면 데이터 유실 가능

<br/>

### 캐싱 데이터 제거 방식

 - Expriration: 각 데이터에 TTL(Time-To-Live)을 설정해 시간 기반으로 삭제
 - Eviction Algorithm: 공간을 확보해야 할 경우 어떤 데이터를 삭제할 지 결정하는 방식
    - LRU (Least Recently Used):
        - 가장 오랫동안 사용하지 않은 데이터를 캐시에서 제거하는 전략입니다. 캐시 크기가 제한되어 있을 때 유용하게 사용됩니다. 새 데이터가 캐시로 들어오면 가장 오래된 데이터가 제거됩니다.
        - 가장 오랫동안 사용되지 않은 데이터를 삭제
    - LFU (Least Frequently Used):
        - 가장 적게 사용된 데이터를 캐시에서 제거하는 전략입니다. 빈도가 낮은 데이터는 캐시에서 제거되어 공간이 비어나게 됩니다.
        - 가장 적게 사용된 데이터를 삭제
    - FIFO(First In First Out):
        - 먼저 들어온 데이터를 삭제

<br/>

## `Redis를 사용해 직접 캐싱 만들어보기`

Cache-Aside 전략을 이용하여 요청에 대해 캐시를 먼저 확인하고, 없으면 원천 데이터 조회 후 캐시에 저장하도록 한다.  


 - build.gradle
    - Redis 의존성을 추가한다.
```build.gradle
dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-data-redis'
	implementation 'org.springframework.boot:spring-boot-starter-web'
	..
}
```

 - application.yml
    - Redis 서버에 대한 정보(호스트, 포트)를 설정한다.
    - Spring Cache 저장소를 Redis로 사용하도록 설정한다.
```yml
spring:
  cache:
    type: redis
  redis:
    host: localhost
    port: 6379
```

 - RedisCachingApplication
   - @EnableCaching 어노테이션으로 캐시를 사용하도록 설정한다.
```Java
@EnableCaching
@SpringBootApplication
public class RedisCachingApplication {

	public static void main(String[] args) {
		SpringApplication.run(RedisCachingApplication.class, args);
	}

}
```

 - RedisCacheConfig
   - Spring 캐싱 기능에 대해서 세부사항을 지정하기 위해서 생성한다.
      - 해당 클래스가 없어도 @Cacheable를 이용해서 캐싱이 가능하다. 하지만, 유효시간이나 그런 세부사항을 지정할 수 없다.
   - RedisCacheConfiguration.defaultCacheConfig()
      - 기본 캐시 설정을 가져온다.
      - disableCachingNullValues(): null 값의 캐싱을 비활성화한다.
      - entryTtl(Duration.ofSeconds(10)): 기본 TTL(Time To Live)을 10초로 설정한다. 
      - computePrefixWith(CacheKeyPrefix.simple()): 캐시 키를 생성할 때 사용할 접두사 생성 전략을 설정한다. 여기서는 간단한 문자열로 생성하는 전략을 사용
      - serializeKeysWith(...): 캐시 키를 직렬화하는 방식을 설정한다. 여기서는 캐시 키를 문자열로 직렬화하는 방식을 사용
   - HashMap<String, RedisCacheConfiguration> configMap
      - 특정 캐시에 대한 설정을 저장하는 HashMap으로 "userAgeCache"라는 이름의 캐시에 대한 TTL을 5초로 설정
   - RedisCacheManager.RedisCacheManagerBuilder
      - 빌더 패턴을 이용하여 설정한 값으로 RedisCacheManager를 생성한다.
```Java
@Configuration
public class RedisCacheConfig {
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration configuration = RedisCacheConfiguration.defaultCacheConfig()
                .disableCachingNullValues()
                .entryTtl(Duration.ofSeconds(10))   // 기본 TTL
                .computePrefixWith(CacheKeyPrefix.simple())
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer())
                );

        HashMap<String, RedisCacheConfiguration> configMap = new HashMap<>();
        configMap.put("userAgeCache", RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(5)));  // 특정 캐시에 대한 TTL

        return RedisCacheManager
                .RedisCacheManagerBuilder
                .fromConnectionFactory(connectionFactory)
                .cacheDefaults(configuration)
                .withInitialCacheConfigurations(configMap)
                .build();
    }
}
```

 - ExternalApiService
   - DB에 접근하여 데이터를 조회했다고 가정한다.
   - getUserName(): 유저 이름 반환
   - getUserAge(): 유저 나이 반환
```Java
@Service
public class ExternalApiService {

    public String getUserName(String userId) {
        // 외부 서비스나 DB 호출
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
        }

        System.out.println("Getting user name from other service..");

        if(userId.equals("A")) {
            return "Adam";
        }
        if(userId.equals("B")) {
            return "Bob";
        }

        return "";
    }

    @Cacheable(cacheNames = "userAgeCache", key = "#userId")
    public int getUserAge(String userId) {
        try {
            Thread.sleep(500);
        } catch(InterruptedException e) {
        }

        System.out.println("Getting user age from other service..");

        if(userId.equals("A")) {
            return 28;
        }
        if(userId.equals("B")) {
            return 32;
        }

        return 0;
    }
}
```

 - UserService
   - ExternalApiService의 getUserName()과 getUserAge() 메소드를 호출하여 유저 정보를 가져오고, UserProfile DTO를 만들어 반환한다.
   - userName에 대해서 직접 RedisTemplate를 통해 캐싱하도록 코드를 작성한다.
      - redisTemplate.opsForValue().get("유저 이름 키")가 있으면 캐싱된 값을 반환하고, 없으면 externalApiService.getUserName() 조회
   - userAge는 단순히 externalApiService.getUserAge()로 조회한다.
      - externalApiService.getUserAge()에 @Cacheable(cacheNames = "userAgeCache", key = "#userId")로 캐싱 설정이 되어있다.
```Java
import com.example.RedisCaching.dto.UserProfile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class UserService {

    @Autowired
    private ExternalApiService externalApiService;

    @Autowired
    StringRedisTemplate redisTemplate;

    public UserProfile getUserProfile(String userId) {

        String userName = null;

        ValueOperations<String, String> ops = redisTemplate.opsForValue();
        String cachedName = ops.get("nameKey:" + userId);
        if(cachedName != null) {
            userName = cachedName;
        } else {
            userName = externalApiService.getUserName(userId);
            ops.set("nameKey:" + userId, userName, 5, TimeUnit.SECONDS);
        }

        //String userName = externalApiService.getUserName(userId);
        int userAge = externalApiService.getUserAge(userId);

        return new UserProfile(userName, userAge);
    }
}
```

<br/>

## Spring의 캐싱 기능을 활용해 실제 비즈니스 로직 작성

### Spring의 캐시 추상화

Spring 프레임워크는 캐시 기능을 추상화한 모듈을 제공하여 캐시를 쉽게 사용하고 관리할 수 있도록 도와주는 기능을 제공합니다.  
이를 통해 애플리케이션의 성능을 향상시키고 데이터 접근 속도를 개선할 수 있습니다.  
Spring의 캐시 추상화는 다양한 캐시 제공자와 통합하여 사용할 수 있는 유연한 방식으로 설계되어 있습니다.  

<br>

CacheManager를 통해 일반적인 캐시 인터페이스 구현(다양한 캐시 구현체가 존재)  
이것을 이용해 메소드에 어노테이션을 정의하는 것만으로 캐시를 손 쉽게 적용할 수 있습니다.  

 - @Cacheable, @CachePut, @CacheEvict 어노테이션:
   - @Cacheable: 메소드의 결과를 캐시에 저장하고, 이후 동일한 파라미터로 메소드가 호출될 때 캐시된 값을 반환합니다. (Cache-Aside 패턴 수행)
   - @CachePut: 메소드의 결과를 캐시에 저장하고, 메소드가 호출되어도 캐시를 갱신합니다.
   - @CacheEvict: 캐시에서 데이터를 제거하는 어노테이션입니다.
 - @Caching 어노테이션:
   - @Caching 어노테이션은 여러 개의 캐시 어노테이션을 하나의 메소드에 적용할 때 사용됩니다. 이를 통해 다양한 캐시 동작을 조합할 수 있습니다.
 - CacheManager 인터페이스:
   - CacheManager 인터페이스는 캐시 관리자를 추상화합니다. Spring에서는 다양한 캐시 제공자와 통합하기 위해 이 인터페이스를 구현한 여러 구현체를 제공합니다. 예를 들어, ConcurrentMapCacheManager, EhCacheCacheManager, RedisCacheManager 등이 있습니다.
 - Cache 인터페이스:
   - Cache 인터페이스는 실제 캐시 스토리지와 상호작용할 수 있는 메소드를 정의합니다. Cache 인터페이스의 구현체는 실제로 캐시된 데이터를 저장하고 관리합니다.
 - CacheResolver 인터페이스:
   - CacheResolver 인터페이스는 메소드별로 사용할 캐시를 결정하는 데 사용됩니다. 여러 개의 캐시를 사용할 때 유용합니다.

