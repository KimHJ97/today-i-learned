# 초간단 ABTest 도입하기

## ABTest

AB 테스트(AB Test)는 웹 개발, 마케팅, 제품 개선 등에서 사용되는 실험적인 방법으로, 두 개 이상의 변형(Version A와 Version B)을 비교하여 어떤 변형이 더 효과적인지를 결정하는 데 사용됩니다. AB 테스트는 데이터 기반 의사 결정을 하기 위한 중요한 도구 중 하나이며, 사용자 경험을 개선하고 비즈니스 성과를 향상시키는 데 도움을 줍니다.  
 - 기존 버전(A안)과 신규 버전(B안)을 만들어 고객에게 일정 비율로 노출하고 어느 쪽이 더 좋은지 확인

#### `ABTest 관련 용어`

 - 가설: 고객에게 제공하려는 것에 대한 예측
 - 실험: 가설을 증명하기 위해 실행하는 것
 - 대조군: 기존에 제공하는 것
 - 실험군: 새롭게 제공하려는 것
 - p-value: 유의성 검증 방식 (실험이 우연인지 아닌지 판별)

#### `ABTest 실험 사례`

 - 고객에게 노출되는 UI 또는 UX에 대한 변경
 - 광고나 마케팅에 들어가는 메시지, 문구 또는 배너
 - 알고리즘의 변경 (추천 알고리즘, 랭킹 알고리즘)
 - 서비스 로직의 변경

#### `ABTest 실험 목적 사례`

 - 증가(+): 무엇인가를 늘리려는 목적의 실험
    - 구매 컨버전 증가
    - 판매 등록 컨버전 증가
    - 회원 가입 증가
    - 클릭 횟수 증가
    - 노출 빈도수 증가
 - 감소(-): 무엇인가를 감소시키려는 목적의 실험
    - 회원 탈퇴 감소
    - 비용의 감소
    - 리드 타임의 감소
    - 고객 불만의 감소
 - 같음(=): 이상 또는 변화가 없음을 확인하는 목적의 실험
    - 특정 UI 또는 UX 제거
    - 배너의 제거
    - 문구의 제거
    - 특정 브라우저 지원 중단

#### `ABTest 기간`

 - 가설의 종류
    - 목표한 지표, 가드레인 지표 등을 고려
 - 트래픽
    - 트래픽이 많으면 실험 결과가 빠르게 나올 수 있다.
 - 비용
    - ABTest 공짜가 아니다.
 - 권장 최소 기간
    - 일주일 이상(주중, 주말을 포함하여 실험)

#### `ABTest 유의 사항`

 - 언제든지 중단할 수 있어야 한다.
    - 기존 버전으로 100% 전환 가능해야 한다.
 - 너무 오래 실험을 유지하지 않도록 한다.
    - ABTest는 공짜가 아니다.
 - 실험 성공 지표는 단수해야 한다.
 - 가드 레일 지표가 있어야 한다.
    - 실험으로 다른 지표가 악화되는 것을 방지
 - A안과 B안의 트래픽은 점차 늘리는 방식을 사용한다.
    - 10% / 90% -> 50% / 50%

#### `ABTest의 추가 이점`

 - ABTest의 기본 기능은 트래픽의 비율 분산
 - 트래픽 비율을 점진적으로 증가, 감소 가능
 - 기존 시스템과 신규 시스템 전환에 사용 가능

#### `ABTest 도구`

 - 구글 애널리틱스: bit.ly/3Epluj6
 - 핵클: https://hackle.io/ko
 - 옵티마이즐리: https://www.optimizely.com/

<br/>

## ABTest 구현 도구(Hackle)

 - `핵클(Hackle)이란?`
    - ABTest를 쉽고 빠르게 적용 가능
    - 발생한 이벤트 데이터 분석을 제공
    - 다양한 가설과 실험을 손 쉽게 진행 가능
    - 사용자의 행동을 분석
 - `핵클의 기능`
    - 핵심 기능
        - ABTest
        - 기능 플래그
        - 데이터 분석(리텐션, 퍼널)
        - 데이터 인사이트
        - 이상 징후 모니터링
    - 보조 기능
        - 이벤트 관리
        - 사용자 그룹 관리
 - `핵클에서 제공되는 SDK`
    - 핵클에서는 제공되는 다양한 긴으을 손 쉽게 사용
    - 다양한 플랫폼용 SDK를 제공한다.
    - 클라이언트와 서버 모두 ABTest를 진행
        - 클라이언트 SDK: 안드로이드, iOS, 자바스클비트, 리액트, 리액트 네이티브, 유니티 등
        - 서버측 SDK: 자바, 코틀린, 파이썬, 노드, PHP, Proxy, Ruby 등
 - `핵클 SDK로 할 수 있는 것`
    - 테스트 그룹을 분배
        - 가설을 실헐 하려면 여러 버전이 필요하다. 고객의 트래픽 분배 가능
    - 기능 플래그
        - 특정 기능을 개발 및 배포한 뒤에 출시를 별도로 설정만으로 처리 가능
    - 사용자 이벤트 전송
        - 고객의 행동을 이벤트로 핵클로 전송하고 이를 계산과 퍼널 분석에 사용
    - 타게팅
        - 실험에 참여시킬 고객을 특정(타게팅)하고 ABTest에 참여 또는 기능만 노출 가능
    - 데이터 세부 분석
        - 특정 분석을 위해 고객의 속성, 정보를 별도로 정의하고 이를 분석
 - `핵클 SDK 적용 방법: JAVA`
    - 핵클 가입
    - 핵클에서 ABTest 또는 기능 플래그 생성
    - SDK 적용: https://docs-kr.hackle.io/docs/java-sdk-init
    - 의존성 추가
    - ABTest 코드 추가
    - 개발 클라이언트 또ㅓ는 서버 배포
    - 핵클에서 ABTest 시작

<br/>

### 핵클 SDK 만들기

 - 핵클 홈페이지: https://hackle.io
    - ABTest 생성
    - 기능 플래그 생성
        - 트래픽 설정, 파라미터 설정 등을 설정 가능
        - 실시간 노출 현황 확인 가능
    - SDK 연동 정보 확인
        - SDK 키 확인
        - 언어: Java/Kotlin
        - 환경 선택: 개발 환경

<br/> 

### Spring 핵클 적용

 - build.gradle
    - Hackle 의존성 추가
```
dependencies {
    ..

	// Hackle SDK 의존성 추가
	implementation 'io.hackle:hackle-server-sdk:2.9.0'
}
```

 - application.yml
    - Hackle SDK 키 값 등록
```YML
# abtest.hackle.sdk.server.key
abtest:
  hackle:
    sdk:
      server:
        key: [Put the Hackle SDK Token for dev]
```

 - ABTestConfig
    - HackleClient를 빈으로 등록한다. (스프링 컨테이너에서 싱글톤으로 관리)
```Java
@Configuration
public class ABTestConfig {
    @Value("${abtest.hackle.sdk.server.key}") String abtestSDKKey;

    @Bean
    public HackleClient hackleClient() {
        return HackleClients.create(abtestSDKKey);
    }
}
```

 - ABTestController
    - abtest 메서드
        - Hackle에 ABTest 식별자와 애플리케이션의 사용자 식별 값을 보내면, ABTest에 설정된 값 중에 하나를 응답해준다.
```Java
@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping(value = "/abtest")
public class ABTestController {
    public static final String ORDER_EVENT_NAME = "hello-click";
    private final HackleClient hackleClient;
    private final int EXPERIMENT_KEY = 5;

    @GetMapping(value = {"/hello", ""})
    public String abtest(@RequestParam Long userId, Model model) {

        Variation variation = hackleClient.variation(EXPERIMENT_KEY, userId.toString());
        log.info("ABTest group = {}, userId = {}", variation, userId);

        // 할당받은 그룹에 대한 로직
        if (variation == Variation.A) {
            // 그룹 A 로직
            model.addAttribute("data", "[A안] Hi Hackle ABTest");
        } else if (variation == Variation.B) {
            // 그룹 B 로직
            model.addAttribute("data", "[B안] Hello Hackle ABTest");
        }
        model.addAttribute("userId", userId);
        return "hello-abtest";
    }

    @PostMapping("/hello")
    public String clickEvent(OrderEvent orderEvent, RedirectAttributes attributes) {
        /* 예시 1: 이벤트 키만 전송 */
        hackleClient.track(ORDER_EVENT_NAME, orderEvent.getOrderId().toString());

        /* 예시 2: 이벤트 키와 숫자 값을 함께 전송 */
        Event event = Event.builder(ORDER_EVENT_NAME)
                .value(orderEvent.getAmount().doubleValue()) // 이벤트 키와 함께 수집할 숫자 값을 value에 넣는다
                .build();

        hackleClient.track(event.toString(), orderEvent.getUserId().toString());
        log.info("Sent abtest event = {}", orderEvent);

        return "redirect:/abtest/hello-click-result";
    }

    @GetMapping(value = "hello-click-result")
    public String helloClickResult() {
        return "hello-click-result";
    }
}
```

 - FunctionFlagController
    - functionFlag 메서드
        - isFeatureOn() 메서드를 통해 Hackle에 기능 플래그에 대한 키와 애플리케이션의 사용자 식별 값을 보내면, 해당 사용자 식별 값에 대한 기능을 열지 말지에 대한 플래그를 응답해준다.
```Java
@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping(value = "/function-flag")
public class FunctionFlagController {
    private final HackleClient hackleClient;
    private final int functionFlagKey = 4;

    @GetMapping(value = "/hello")
    public String functionFlag(@RequestParam Long userId, Model model) {

        boolean featureOn = hackleClient.isFeatureOn(functionFlagKey, userId.toString());
        model.addAttribute("featureOn", featureOn);

        return "hello-function-flag";
    }

}
```
