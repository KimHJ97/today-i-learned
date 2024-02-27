# 검색 API 개발

## 1. 기본 지식

### MyBatis 문법

게시글 검색 API에서 사용하는 쿼리문에 MyBatis에서 '<choose>', '<when>', '<otherwise>' 태그를 사용하여 조건에 따라 다른 SQL 쿼리를 실행할 수 있습니다. 이를 사용하여 동적 SQL을 생성할 수 있습니다.  

```xml
    <select id="selectPosts" resultType="com.fastcampus.boardserver.dto.request.PostSearchRequest">
        SELECT `id`,
        `name`,
        `isAdmin`,
        `contents`,
        `createTime`,
        `views`,
        `categoryId`,
        `userId`,
        `fileId`,
        `updateTime`
        FROM post
        WHERE
        1=1
        <if test="name != null and name != ''">
            AND name LIKE CONCAT(#{name}, '%')
        </if>
        <if test="contents != null and contents != ''">
            AND contents LIKE CONCAT(#{contents}, '%')
        </if>
        <if test="categoryId != 0">
            AND categoryId = #{categoryId}
        </if>
        <if test="sortStatus.toString() == 'NEWEST'">
            ORDER BY createTime DESC
        </if>
        <if test="sortStatus.toString() == 'OLDEST'">
            ORDER BY createTime ASC
        </if>
        <if test="sortStatus.toString() == 'CATEGORIES'">
            ORDER BY categoryId
        </if>

    </select>
```

<br/>

### Redis 연동 및 메타정보 설정

Spring Boot에서 Redis를 사용하기 위한 설정은 RedisConnectionFactory, RedisTemplate 등을 설정하여 구현할 수 있습니다.  

 - `RedisConfig`
```java
@Configuration
public class RedisConfig {
    @Value("${spring.data.redis.host}")
    private String redisHost;

    @Value("${spring.data.redis.port}")
    private int redisPort;

    @Value("${spring.data.redis.password}")
    private String redisPwd;

    @Value("${expire.defaultTime}")
    private long defaultExpireSecond;

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.registerModules(new JavaTimeModule(), new Jdk8Module());
        return mapper;
    }

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration();
        redisStandaloneConfiguration.setPort(redisPort);
        redisStandaloneConfiguration.setHostName(redisHost);
        redisStandaloneConfiguration.setPassword(redisPwd);
        LettuceConnectionFactory lettuceConnectionFactory = new LettuceConnectionFactory(redisStandaloneConfiguration);
        return lettuceConnectionFactory;
    }

    @Bean
    public RedisCacheManager redisCacheManager(RedisConnectionFactory redisConnectionFactory,
                                               ObjectMapper objectMapper) {
        RedisCacheConfiguration configuration = RedisCacheConfiguration.defaultCacheConfig()
                .disableCachingNullValues()
                .entryTtl(Duration.ofSeconds(defaultExpireSecond))
                .serializeKeysWith(RedisSerializationContext
                        .SerializationPair
                        .fromSerializer(new StringRedisSerializer())).serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer(objectMapper)));

        return RedisCacheManager.RedisCacheManagerBuilder.fromConnectionFactory(redisConnectionFactory)
                .cacheDefaults(configuration).build();
    }
}
```

 - `application.properties`
```properties
# mysql
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.jdbc-url=jdbc:mysql://localhost:3306/board
spring.datasource.username=root
spring.datasource.password=1234
mybatis.mapper-locations=classpath:com.fastcampus.boardserver.mapper/*.xml

# redis
spring.cache.type=redis
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.password=
spring.data.redis.repositories.enabled=false
expire.defaultTime=36288000
```

 - `PostSearchServiceImpl`
```java
@Service
@Log4j2
public class PostSearchServiceImpl implements PostSearchService {

    @Autowired
    private PostSearchMapper productSearchMapper;

    @Async
    @Cacheable(value = "getProducts", key = "'getProducts' + #postSearchRequest.getName() + #postSearchRequest.getCategoryId()")
    @Override
    public List<PostDTO> getProducts(PostSearchRequest postSearchRequest) {
        List<PostDTO> postDTOList = null;
        try {
            postDTOList = productSearchMapper.selectPosts(postSearchRequest);
        } catch (RuntimeException e) {
            log.error("selectPosts 실패");
        }
        return postDTOList;
    }
}
```

<br/>

### RedisTemplate 설정

@Autowired 어노테이션을 사용해서 Spring Boot 서비스에서 RedisTemplate을 주입하여 Redis를 사용할 수 있습니다.  

```java
@Service
public class RedisService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public void setValue(String key, Object value) {
        redisTemplate.opsForValue().set(key, value);
    }

    public Object getValue(String key) {
        return redisTemplate.opsForValue().get(key);
    }
}
```

<br/>

### @Cacheable, @CacheEvict 어노테이션 적용

@Cacheable 및 @CacheEvict는 Spring Boot에서 캐싱을 지원하는 어노테이션입니다.  
@Cacheable은 메서드의 결과를 캐시에 저장하고, @CacheEvict는 캐시에서 데이터를 제거합니다.  

```java
@Service
public class UserService {

    @Cacheable(value = "userCache", key = "#id")
    public User getUserById(Long id) {
        // TODO: 실제 DB에서 데이터를 조회하는 로직
    }

    @CacheEvict(value = "userCache", key = "#id")
    public void evictUserCache(Long id) {
        // 
    }
}
```

<br/>

## 2. Redis 사용 예시

 - `build.gradle`
    - Redis 관련 의존 라이브러리 추가
```gradle
dependencies {
    // ..
	implementation group: 'org.springframework.boot', name: 'spring-boot-starter-data-redis', version: '3.1.0'
}
```

<br/>

 - `application.properties`
    - Redis 관련 외부 설정 값 추가
```properties
# redis
spring.cache.type=redis
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.password=
spring.data.redis.repositories.enabled=false
expire.defaultTime=36288000
```

<br/>

 - `메인 클래스`
```java
@SpringBootApplication
@EnableCaching // 캐싱 활성화
public class BoardServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(BoardServerApplication.class, args);
	}

}
```

<br/>

 - `RedisConfig`
    - Reids 관련 설정
    - RedisConnectionFactory로 Redis 연결 정보를 설정한다. 구현체로는 LettuceConnectionFactory를 사용한다.
    - RedisCacheManager로 직렬화 규약을 정의해준다.
```java
@Configuration
public class RedisConfig {
    @Value("${spring.data.redis.host}")
    private String redisHost;

    @Value("${spring.data.redis.port}")
    private int redisPort;

    @Value("${spring.data.redis.password}")
    private String redisPwd;

    @Value("${expire.defaultTime}")
    private long defaultExpireSecond;

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.registerModules(new JavaTimeModule(), new Jdk8Module());
        return mapper;
    }

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration();
        redisStandaloneConfiguration.setPort(redisPort);
        redisStandaloneConfiguration.setHostName(redisHost);
        redisStandaloneConfiguration.setPassword(redisPwd);
        LettuceConnectionFactory lettuceConnectionFactory = new LettuceConnectionFactory(redisStandaloneConfiguration);
        return lettuceConnectionFactory;
    }

    @Bean
    public RedisCacheManager redisCacheManager(RedisConnectionFactory redisConnectionFactory,
                                               ObjectMapper objectMapper) {
        RedisCacheConfiguration configuration = RedisCacheConfiguration.defaultCacheConfig()
                .disableCachingNullValues() // Null 허용 X
                .entryTtl(Duration.ofSeconds(defaultExpireSecond)) // 만료 시간 설정
                .serializeKeysWith(
                    RedisSerializationContext
                        .SerializationPair
                        .fromSerializer(new StringRedisSerializer())
                )
                .serializeValuesWith(
                    RedisSerializationContext
                        .SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer(objectMapper))
                );

        return RedisCacheManager.RedisCacheManagerBuilder.fromConnectionFactory(redisConnectionFactory)
                .cacheDefaults(configuration).build();
    }
}
```

