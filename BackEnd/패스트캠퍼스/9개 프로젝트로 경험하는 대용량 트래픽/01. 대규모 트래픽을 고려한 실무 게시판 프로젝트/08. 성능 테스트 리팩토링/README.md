# 성능 테스트 리팩토링

## 1. 이론

### 성능 테스트 리팩토링 - 아키텍처

아키텍처 평가: 현재 아키텍처를 검토하고 문제점을 식별합니다. 확장성, 보안, 성능 및 기타 요구 사항을 고려합니다.  
아키텍처 변경: 필요한 경우 아키텍처를 변경하고 모놀리식 애플리케이션을 마이크로서비스 아키텍처로 분해하거나, 모듈화하거나, 서버리스 아키텍처로 이전할 수 있습니다.  

 - __스케일 아웃(Scale Out)__
    - AWS 로드 밸런서를 이용하여 애플리케이션을 여러 서버로 분산합니다. 이것은 트래픽을 균형있게 분배하고 고가용성을 제공하는 데 도움이 됩니다.
 - __분산 시스템 아키텍처__
    - 마이크로서비스 아키텍처를 고려하여 각 부분을 독립적으로 스케일 아웃하고, 확장성을 제공합니다.
 - __서버 리소스 최적화__
    - 서버 리소스(CPU, 메모리, 디스크)를 최적화하고 운영체제 및 웹 서버 설정을 튜닝합니다.

<br/>

### 성능 테스트 리팩토링 - 어플리케이션

코드베이스 분석: 기존 코드베이스를 분석하여 중복 코드, 복잡성, 오류 등을 식별합니다.  
모듈화 및 구조 개선: 코드를 모듈화하고, SOLID 원칙을 준수하며, 더 나은 구조로 리팩토링합니다.  
성능 최적화: 성능 병목 현상을 식별하고 해결하며, 데이터베이스 쿼리, 캐싱, 인덱싱 등을 최적화합니다.  

 - __캐싱 활용__
    - 게시물 목록, 사용자 프로필, 이미지 등 자주 접근하는 데이터를 캐시합니다.
    - EHCache, Redis 또는 기타 캐싱 솔루션을 사용하여 성능을 향상시킬 수 있습니다.
 - __비동기 프로그래밍__
    - Spring의 비동기 서비스 및 메시징을 활용하여 요청과 응답을 병렬로 처리하고 병목 현상을 줄입니다.
 - __알고리즘 및 비즈니스 로직 최적화__
    - 비즈니스 로직에서 성능에 영향을 미치는 부분을 개선하고, 불필요한 반복 작업을 최소화합니다.

<br/>

### 성능 테스트 리팩토링 - 데이터베이스

쿼리 최적화: 데이터베이스 쿼리를 검토하고 최적화하여 성능을 향상시킵니다.  
정규화 및 역정규화: 데이터베이스 스키마를 정규화하거나 역정규화하여 데이터 일관성과 성능을 조절합니다.  
인덱싱: 필요한 인덱스를 추가하거나 수정하여 데이터 검색을 빠르게 합니다.  

 - __실행 계획을 통한 쿼리 최적화__
    - 데이터베이스 쿼리를 검토하고 복잡한 쿼리를 최적화합니다.
    - 인덱스, 조인, 서브쿼리 등을 개선하여 데이터베이스 성능을 향상시킵니다.
    - 데이터베이스 실행 계획을 확인하고 병목 현상을 식별하여 인덱스 또는 조인을 추가하거나 변경합니다.
 - __인덱스 최적화__
    - 자주 검색되는 열에 적절한 인덱스를 생성합니다.
    - 복합 인덱스를 고려하여 검색 속도를 높입니다.
 - __데이터베이스 분리__
    - 데이터베이스를 읽기 전용과 쓰기 전용으로 분리하여 읽기 작업에 대한 부하를 줄입니다.
 - __데이터 정규화 및 역정규화__
    - 데이터베이스 정규화를 통해 데이터 중복을 최소화하고 역정규화를 통해 읽기 성능을 향상시킵니다.

<br/>

## 2. 성능 테스트 리팩토링

 - `DB`
    - 게시글 제목에 인덱스 추가
```sql
ALTER TABLE board.post ADD INDEX 인덱스명 (name ASC)
```

 - `어플리케이션`
    - 레디스 expire.defaultTime 변경: 60초 -> 600초
    - 검색 API 서비스단 로직 비동기 처리 방식 수정
    - 레디스 검색 Key 세분화
```java
@Service
@Log4j2
public class PostSearchServiceImpl implements PostSearchService {

    @Autowired
    private PostSearchMapper productSearchMapper;

    @Autowired
    private SlackService slackService;

    @Async // 비동기 처리
    @Cacheable(value = "getProducts", key = "'getProducts' + #postSearchRequest.getName() + #postSearchRequest.getCategoryId()")
    @Override
    public List<PostDTO> getProducts(PostSearchRequest postSearchRequest) {
        List<PostDTO> postDTOList = null;
        try {
            postDTOList = productSearchMapper.selectPosts(postSearchRequest);
        } catch (RuntimeException e) {
            slackService.sendSlackMessage("selectPosts 실패 " +e.getMessage(),"error");
            log.error("selectPosts 실패");
            throw new BoardServerException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
        return postDTOList;
    }
}
```
