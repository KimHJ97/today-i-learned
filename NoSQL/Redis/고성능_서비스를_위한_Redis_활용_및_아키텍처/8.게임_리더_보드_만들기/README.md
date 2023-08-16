# 게임 리더 보드 만들기

## 리더보드(Leaderboard)

 - 게임이나 경쟁에서 상위 참가자의 랭킹과 점수를 보여주는 기능  
 - 순위로 나타낼 수 있는 다양한 대상에 응용(최다 구매 상품, 리뷰 순위 등)

<br/>

### 리더보드의 동작 (API 관점)
 - 점수 생성/업데이트: SetScore(userId, score)
 - 상위 랭크 조회(밤위 기반 조회): getRange(1 ~ 10)
 - 특정 대상 순위 조회(값 기반 조회): getRank(userId)

<br/>

### 데이터 구조와 성능 문제

 - 업데이트
    - 한 행에만 접근하므로 비교적 빠름
    - ex) UPDATE ranking SET score = 1550 WHERE userId = A
 - 랭킹 범위나 특정 대상의 순위 조회
    - 데이터를 정렬하거나 COUNT() 등의 집계 연산을 수행해야 하므로 데이터가 많아질수록 속도가 느려짐
    - ex) SELECT userId FROM ranking ORDER BY score DESC LIMIT 0, 5;

<br/>

### Redis를 사용했을 때의 장점

 - 순위 데이터에 적합한 Sorted-Set의 자료구조를 사용하면 score를 통해 자동으러 정렬됨
 - 용도에 특화된 오퍼레이션(Set 삽입/업데이트, 조회)이 존재하므로 사용이 간단함
 - 자료 구조의 특성으로 데이터 조회가 빠름(범위 검색, 특정 값의 순위 검색)
 - 빈번한 액세스에 유리한 In-Memory DB의 속도


<br/>

## 리더보드 프로젝트 만들기

 - build.gradle
```
dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-data-redis'
	implementation 'org.springframework.boot:spring-boot-starter-web'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

 - application.yml
```yml
spring:
  redis:
    host: localhost
    port: 6379
```

 - RankingService
    - setUserScore(String userId, int score)
        - 특정 유저의 점수를 저장한다.
        - Sorted-Set 자료구조에 "leaderBoard"를 키로 userId를 저장한다.
    - getUserRanking(String userId)
        - 특정 유저의 랭킹을 조회
        - Sorted-Set 자료구조에 "leaderBoard"가 키일 때 score를 오름차순으로 순위를 조회한다.
    - getTopRank(int limit)
        - 상위 랭킹을 조회
        - Sorted-Set 자료구조에 0번부터 (limit - 1)번까지의 userId를 조회한다.
```Java
@Service
public class RankingService {

    private static final String LEADERBOARD_KEY = "leaderBoard";
    @Autowired
    StringRedisTemplate redisTemplate;

    public boolean setUserScore(String userId, int score) {
        ZSetOperations zSetOps = redisTemplate.opsForZSet();
        zSetOps.add(LEADERBOARD_KEY, userId, score);

        return true;
    }

    public Long getUserRanking(String userId) {
        ZSetOperations zSetOps = redisTemplate.opsForZSet();
        Long rank = zSetOps.reverseRank(LEADERBOARD_KEY, userId);

        return rank;
    }

    public List<String> getTopRank(int limit) {
        ZSetOperations zSetOps = redisTemplate.opsForZSet();
        Set<String> rangeSet = zSetOps.reverseRange(LEADERBOARD_KEY, 0, limit - 1);

        return new ArrayList<>(rangeSet);
    }
}
```

 - ApiController
    - setScore(String userId, int score)
    - getUserRank(String userId)
    - getTopRanks()
```Java
@RestController
public class ApiController {

    @Autowired
    private RankingService rankingService;

    @GetMapping("/setScore")
    public Boolean setScore(
        @RequestParam String userId,
        @RequestParam int score
    ){
        return rankingService.setUserScore(userId, score);
    }

    @GetMapping("/getRank")
    public Long getUserRank(
            @RequestParam String userId
    ) {
        return rankingService.getUserRanking(userId);
    }

    @GetMapping("/getTopRanks")
    public List<String> getTopRanks() {
        return rankingService.getTopRank(3);
    }
}
```

 - SimpleTest
```Java
@SpringBootTest
public class SimpleTest {

    @Autowired
    private RankingService rankingService;

    @Test
    void getRanks() {
        rankingService.getTopRank(1);

        // 1) Get user_100's rank
        Instant before = Instant.now();
        Long userRank = rankingService.getUserRanking("user_100");
        Duration elapsed = Duration.between(before, Instant.now());

        System.out.println(String.format("Rank(%d) - Took %d ms", userRank, elapsed.getNano() / 1000000));

        // 2) Get top 10 user list
        before = Instant.now();
        List<String> topRankers = rankingService.getTopRank(10);
        elapsed = Duration.between(before, Instant.now());

        System.out.println(String.format("Range - Took %d ms", elapsed.getNano() / 1000000));
    }

    @Test
    void insertScore() {
        for(int i=0; i<1000000; i++) {
            int score = (int)(Math.random() * 1000000); // 0 ~ 999999
            String userId = "user_" + i;

            rankingService.setUserScore(userId, score);
        }
    }

    @Test
    void inMemorySortPerformance() {
        ArrayList<Integer> list = new ArrayList<>();
        for(int i=0; i<1000000; i++) {
            int score = (int)(Math.random() * 1000000); // 0 ~ 999999
            list.add(score);
        }

        Instant before = Instant.now();
        Collections.sort(list); // nlogn
        Duration elapsed = Duration.between(before, Instant.now());
        System.out.println((elapsed.getNano() / 1000000) + " ms");
    }
}
```
