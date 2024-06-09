# 최종 길안내 개발

## Shorten URL 개발

 - `build.gradle`
    - Base62를 사용하기 위한 의존성을 추가한다.
```groovy
dependencies {
    // https://github.com/seruco/base62
	implementation 'io.seruco.encoding:base62:0.1.3'
}

// Usage
// final byte[] = encoded = base62.encode("Hello World".getBytes());
// final byte decoded = base62.decode("73Xp..".getBytes());
```
<br/>

 - `Base62Service`
    - encodeDirectionId(): 문자열을 Base62로 인코딩한 후 반환한다.
    - decodeDirectionId(): Base62 인코딩된 문자열을 디코딩한 후 반환한다.
```java
@Slf4j
@Service
@RequiredArgsConstructor
public class Base62Service {

    private static final Base62 base62Instance = Base62.createInstance();

    public String encodeDirectionId(Long directionId) {
        return new String(base62Instance.encode(String.valueOf(directionId).getBytes()));
    }

    public Long decodeDirectionId(String encodedDirectionId) {
        String resultDirectionId = new String(base62Instance.decode(encodedDirectionId.getBytes()));
        return Long.valueOf(resultDirectionId);
    }
}
```
<br/>

 - `DirectionService`
    - Shorten URL을 인코딩하여 PK 값을 얻어낸 후, PK에 해당하는 위치 정보를 조회한다. 위치 정보를 바탕으로 실제 URL 정보를 만들 수 있다.
```java
@Slf4j
@Service
@RequiredArgsConstructor
public class DirectionService {

    private static final int MAX_SEARCH_COUNT = 3; // 약국 최대 검색 갯수
    private static final double RADIUS_KM = 10.0; // 반경 10 km
    private static final String DIRECTION_BASE_URL = "https://map.kakao.com/link/map/";

    private final PharmacySearchService pharmacySearchService;
    private final DirectionRepository directionRepository;
    private final KakaoCategorySearchService kakaoCategorySearchService;
    private final Base62Service base62Service;

    public String findDirectionUrlById(String encodedId) {
        // Base62 인코딩 문자열 -> 디코딩 -> PK 값으로 변환
        Long decodedId = base62Service.decodeDirectionId(encodedId);
        Direction direction = directionRepository.findById(decodedId).orElse(null);

        String params = String.join(",", direction.getTargetPharmacyName(),
                String.valueOf(direction.getTargetLatitude()), String.valueOf(direction.getTargetLongitude()));

        String result = UriComponentsBuilder.fromHttpUrl(DIRECTION_BASE_URL + params)
                .toUriString();

        return result;
    }

}
```
<br/>

 - `DirectionController`
    - 클라이언트에서 Shorten URL로 요청시 해당 정보로 위치 정보를 조회하고, 실제 URL 정보를 반환한다.
```java
@Controller
@Slf4j
@RequiredArgsConstructor
public class DirectionController {

    private final DirectionService directionService;
    private static final String DIRECTION_BASE_URL = "https://map.kakao.com/link/map/";

    @GetMapping("/dir/{encodedId}")
    public String searchDirection(@PathVariable("encodedId") String encodedId) {
        Direction resultDirection = directionService.findById(encodedId);

        String params = String.join(",", resultDirection.getTargetPharmacyName(),
                String.valueOf(resultDirection.getTargetLatitude()), String.valueOf(resultDirection.getTargetLongitude()));

        String result = UriComponentsBuilder.fromHttpUrl(DIRECTION_BASE_URL + params)
                .toUriString();
        log.info("direction params: {}, url: {}" ,params ,result);

        return "redirect:"+result;
    }
}
```
<br/>

## 테스트 코드

 - `Base62ServiceTest`
```groovy
class Base62ServiceTest extends Specification {

    private Base62Service base62Service

    def setup() {
        base62Service = new Base62Service()
    }

    def "check base62 encoder/decoder"() {
        given:
        long num = 5

        when:
        def encodedId = base62Service.encodeDirectionId(num)

        def decodedId = base62Service.decodeDirectionId(encodedId)

        then:
        num == decodedId
    }
}
```
<br/>

 - `DirectionControllerTest`
```groovy
class DirectionControllerTest extends Specification {

    private MockMvc mockMvc
    private DirectionService directionService = Mock()

    def setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(new DirectionController(directionService))
            .build()
    }

    def "GET /dir/{encodedId}"() {
        given:
        String encodedId = "r"

        String redirectURL = "https://map.kakao.com/link/map/pharmacy,38.11,128.11"

        when:
        directionService.findDirectionUrlById(encodedId) >> redirectURL
        def result = mockMvc.perform(MockMvcRequestBuilders.get("/dir/{encodedId}", encodedId))

        then:
        result.andExpect(status().is3xxRedirection()) // 리다이렉트 발생 확인
            .andExpect(redirectedUrl(redirectURL))    // 리다이렉트 경로 검증
            .andDo(print())
    }

}
```

