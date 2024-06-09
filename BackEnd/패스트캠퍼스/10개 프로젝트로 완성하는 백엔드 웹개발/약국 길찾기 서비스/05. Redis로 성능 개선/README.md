# Redis로 성능 개선

## Redis 소개

Redis는 인메모리 데이터베이스 오픈 소스로 다양한 자료구조를 제공한다.  
 - 공식 사이트: https://redis.io/
 - 메모리 접근이 디스크 접근보다 빠르기 때문에, 데이터베이스보다 속도가 빠르다.
 - Redis 캐싱을 이용하여 성능을 개선하고자 할때, 캐싱 데이터는 UPDATE가 자주 일어나지 않는 데이터가 효과적이다.
    - 너무 많은 UPDATE가 일어나는 데이터일 경우, DB와 Sync 비용이 발생한다.
    - Redis 사용시 반드시 Failover에 대한 고려를 해야한다.
        - 레디스 장애시 데이터베이스에서 조회
        - 레디스 이중화 및 백업

<br/>

### Redis CLI

```bash
$ docker-compose -f docker-compose-local.yml up
$ docker exec -it {Container id} redis-cli --raw

# String 자료 구조
$ set id 10 # key(id) 의 value를 10으로 저장  
$ get id    # key 조회 
$ del id    # key 삭제 
$ scan 0    # key 들을 일정 단위 개수 만큼씩 조회

# Hash 자료 구조
$ hgetall USER              # Key(USER)의 매핑되는 모든 필드과 값들을 조회 
$ hset USER subkey value    # Key(USER)의 subKey 의 값을 지정 
$ hget USER subkey          # Key(USER)의 subKey 의 값을 조회

# Geospatial 자료 구조
# geopoints1 라는 자료구조에 pharmacy1, 2 각각 경도, 위도를 추가
$ geoadd geopoints1 127.0817 37.5505 pharmacy1  
$ geoadd geopoints1 127.0766 37.541 pharmacy2

# 두 지역의 거리를 리턴한다. 단위는 km
$ geodist geopoints1 pharmacy1 pharmacy2 km

# geopoints2 라는 자료구조에 pharmacy1, 2, 3 각각 경도, 위도를 추가
$ geoadd geopoints2 127.0569046 37.61040424 pharmacy1  
$ geoadd geopoints2 127.029052 37.60894036 pharmacy2  
$ geoadd geopoints2 127.236707811313 37.3825107393401 pharmacy3

# geopoints2 이름의 자료구조에서 주어진 위도, 경도 기준으로 반경 10km 이내에 가까운 약국 찾기
$ georadius geopoints2 127.037033003036 37.596065045809 10 km withdist withcoord asc count 3 
```
<br/>

## Redis 자료 구조를 이용하여 구현

 - `build.gradle`
    - Redis 의존 라이브러리 추가
```groovy
dependencies {
	// redis
	implementation 'org.springframework.boot:spring-boot-starter-data-redis'
}
```
<br/>

 - `RedisConfig`
    - Redis를 사용하기 위한 클라이언트 설정
```java
@Configuration
public class RedisConfig {

    @Value("${spring.redis.host}")
    private String redisHost;

    @Value("${spring.redis.port}")
    private int redisPort;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(redisHost, redisPort);
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(redisConnectionFactory());
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setHashKeySerializer(new StringRedisSerializer());
        redisTemplate.setHashValueSerializer(new StringRedisSerializer());
        return redisTemplate;
    }
}
```

 - `RedisTemplateTest`
    - Redis 클라이언트 테스트
```groovy
import com.example.project.AbstractIntegrationContainerBaseTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.redis.core.HashOperations
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.data.redis.core.SetOperations
import org.springframework.data.redis.core.ValueOperations

class RedisTemplateTest extends AbstractIntegrationContainerBaseTest {

    @Autowired
    private RedisTemplate redisTemplate

    // String 자료 구조 테스트
    def "RedisTemplate String operations"() {
        given:
        def valueOperations = redisTemplate.opsForValue()
        def key = "stringKey"
        def value = "hello"

        when:
        valueOperations.set(key, value)

        then:
        def result = valueOperations.get(key)
        result == value
    }

    // Set 자료 구조 테스트
    def "RedisTemplate set operations"() {
        given:
        def setOperations = redisTemplate.opsForSet()
        def key = "setKey"

        when:
        setOperations.add(key, "h", "e", "l", "l", "o")

        then:
        def size = setOperations.size(key)
        size == 4
    }

    // Hash 자료 구조 테스트
    def "RedisTemplate hash operations"() {
        given:
        def hashOperations = redisTemplate.opsForHash()
        def key = "hashKey"

        when:
        hashOperations.put(key, "subKey", "value" )

        then:
        def result = hashOperations.get(key, "subKey")
        result == "value"

        def entries = hashOperations.entries(key)
        entries.keySet().contains("subKey")
        entries.values().contains("value")

        def size = hashOperations.size(key)
        size == entries.size()
    }
}
```
<br/>

### Redis를 이용한 성능 개선

 - `PharmacyRedisTemplateService`
    - 저장: "PHARMACY" 라는 Hash 자료 구조에 PK 값을 키로, JSON 형태의 문자열을 값으로 가진 데이터를 저장한다.
    - 조회: "PHARMACY" 라는 Hash 자료 구조에 모든 값을 조회하고, JSON 문자열 값을 Object로 변환한다.
```java
@Slf4j
@Service
@RequiredArgsConstructor
public class PharmacyRedisTemplateService {

    private static final String CACHE_KEY = "PHARMACY";

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private HashOperations<String, String, String> hashOperations;

    @PostConstruct
    public void init() {
        this.hashOperations = redisTemplate.opsForHash();
    }

    // Hash 데이터 저장
    public void save(PharmacyDto pharmacyDto) {
        if(Objects.isNull(pharmacyDto) || Objects.isNull(pharmacyDto.getId())) {
            log.error("Required Values must not be null");
            return;
        }

        try {
            // "PHARMACY" 라는 Hash 자료 구조에 PK 값을 키로, JSON 형태의 문자열을 값으로 가진 데이터를 저장한다.
            hashOperations.put(CACHE_KEY,
                    pharmacyDto.getId().toString(),
                    serializePharmacyDto(pharmacyDto));
            log.info("[PharmacyRedisTemplateService save success] id: {}", pharmacyDto.getId());
        } catch (Exception e) {
            log.error("[PharmacyRedisTemplateService save error] {}", e.getMessage());
        }
    }

    // Hash 데이터의 값들을 조회
    public List<PharmacyDto> findAll() {

        try {
            List<PharmacyDto> list = new ArrayList<>();
            for (String value : hashOperations.entries(CACHE_KEY).values()) {
                PharmacyDto pharmacyDto = deserializePharmacyDto(value);
                list.add(pharmacyDto);
            }
            return list;

        } catch (Exception e) {
            log.error("[PharmacyRedisTemplateService findAll error]: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    // Hash 데이터 삭제
    public void delete(Long id) {
        hashOperations.delete(CACHE_KEY, String.valueOf(id));
        log.info("[PharmacyRedisTemplateService delete]: {} ", id);
    }

    private String serializePharmacyDto(PharmacyDto pharmacyDto) throws JsonProcessingException {
        return objectMapper.writeValueAsString(pharmacyDto);
    }

    private PharmacyDto deserializePharmacyDto(String value) throws JsonProcessingException {
        return objectMapper.readValue(value, PharmacyDto.class);
    }
}
```
<br/>

 - `PharmacySearchService`
    - searchPharmacyDtoList()
        - Redis로 약국 데이터를 조회하고 값이 없으면, DB에서 약국 데이터를 조회한다.
```java
@Slf4j
@Service
@RequiredArgsConstructor
public class PharmacySearchService {

    private final PharmacyRepositoryService pharmacyRepositoryService;
    private final PharmacyRedisTemplateService pharmacyRedisTemplateService;

    public List<PharmacyDto> searchPharmacyDtoList() {

        // redis
        List<PharmacyDto> pharmacyDtoList = pharmacyRedisTemplateService.findAll();
        if(!pharmacyDtoList.isEmpty()) {
            log.info("redis findAll success!");
            return pharmacyDtoList;
        }

        // db
        return pharmacyRepositoryService.findAll()
                .stream()
                .map(this::convertToPharmacyDto)
                .collect(Collectors.toList());
    }
}
```
<br/>

 - `PharmacyController`
    - DB에 있는 모든 데이터를 Redis에 동기화해준다.
```java
@Slf4j
@RestController
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyRepositoryService pharmacyRepositoryService;
    private final PharmacyRedisTemplateService pharmacyRedisTemplateService;

    // 데이터 초기 셋팅을 위한 임시 메서드
    @GetMapping("/redis/save")
    public String save() {

        List<PharmacyDto> pharmacyDtoList = pharmacyRepositoryService.findAll()
                .stream().map(pharmacy -> PharmacyDto.builder()
                        .id(pharmacy.getId())
                        .pharmacyName(pharmacy.getPharmacyName())
                        .pharmacyAddress(pharmacy.getPharmacyAddress())
                        .latitude(pharmacy.getLatitude())
                        .longitude(pharmacy.getLongitude())
                        .build())
                .collect(Collectors.toList());

        pharmacyDtoList.forEach(pharmacyRedisTemplateService::save);

        return "success";
    }
}
```
<br/>

### Redis 테스트 코드

 - `PharmacySearchServiceTest`
    - 약국 데이터 조회 기능을 테스트한다.
```groovy
class PharmacySearchServiceTest extends Specification {

    private PharmacySearchService pharmacySearchService

    private PharmacyRepositoryService pharmacyRepositoryService = Mock()
    private PharmacyRedisTemplateService pharmacyRedisTemplateService = Mock()

    private List<Pharmacy> pharmacyList

    def setup() {
        pharmacySearchService = new PharmacySearchService(pharmacyRepositoryService, pharmacyRedisTemplateService)

        pharmacyList = Lists.newArrayList(
                Pharmacy.builder()
                        .id(1L)
                        .pharmacyName("호수온누리약국")
                        .latitude(37.60894036)
                        .longitude(127.029052)
                        .build(),
                Pharmacy.builder()
                        .id(2L)
                        .pharmacyName("돌곶이온누리약국")
                        .latitude(37.61040424)
                        .longitude(127.0569046)
                        .build())
    }

    def "레디스 장애시 DB를 이용하여 약국 데이터 조회"() {
        when:
        // 모의 객체의 행동을 정의해준다. (스터빙)
        pharmacyRedisTemplateService.findAll() >> []
        pharmacyRepositoryService.findAll() >> pharmacyList

        // 실제 메서드를 호출한다.
        def result = pharmacySearchService.searchPharmacyDtoList()

        then:
        result.size() == 2
    }
}
```
<br/>

 - `PharmacyRedisTemplateServiceTest`
    - 실제 Redis를 띄우고 통합 테스트를 진행한다.
```groovy
class PharmacyRedisTemplateServiceTest extends AbstractIntegrationContainerBaseTest {

    @Autowired
    private PharmacyRedisTemplateService pharmacyRedisTemplateService

    def setup() {
        // 각각 테스트마다 고유한 환경을 만들기 위해 Redis를 초기화해준다.
        pharmacyRedisTemplateService.findAll()
            .forEach(dto -> {
                pharmacyRedisTemplateService.delete(dto.getId())
            })
    }

    def "save success"() {
        given:
        String pharmacyName = "name"
        String pharmacyAddress = "address"
        PharmacyDto dto =
                PharmacyDto.builder()
                        .id(1L)
                        .pharmacyName(pharmacyName)
                        .pharmacyAddress(pharmacyAddress)
                        .build()

        when:
        pharmacyRedisTemplateService.save(dto)
        List<PharmacyDto> result = pharmacyRedisTemplateService.findAll()

        then:
        result.size() == 1
        result.get(0).id == 1L
        result.get(0).pharmacyName == pharmacyName
        result.get(0).pharmacyAddress == pharmacyAddress
    }

    def "success fail"() {
        given:
        PharmacyDto dto =
                PharmacyDto.builder()
                        .build()

        when:
        pharmacyRedisTemplateService.save(dto)
        List<PharmacyDto> result = pharmacyRedisTemplateService.findAll()

        then:
        result.size() == 0
    }

    def "delete"() {
        given:
        String pharmacyName = "name"
        String pharmacyAddress = "address"
        PharmacyDto dto =
                PharmacyDto.builder()
                        .id(1L)
                        .pharmacyName(pharmacyName)
                        .pharmacyAddress(pharmacyAddress)
                        .build()

        when:
        pharmacyRedisTemplateService.save(dto)
        pharmacyRedisTemplateService.delete(dto.getId())
        def result = pharmacyRedisTemplateService.findAll()

        then:
        result.size() == 0
    }

}
```
