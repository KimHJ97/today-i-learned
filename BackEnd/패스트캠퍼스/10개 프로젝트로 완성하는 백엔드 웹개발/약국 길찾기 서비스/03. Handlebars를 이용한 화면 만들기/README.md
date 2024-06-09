# Hnadlebars를 이용한 화면 만들기

## Handlebasrs 라이브러리 적용

 - `build.gradle`
    - Handlebars 의존성을 추가한다.
```groovy
dependencies {
    // ..

	// handlebars
	implementation 'pl.allegro.tech.boot:handlebars-spring-boot-starter:0.3.4'

}
```
<br/>

### 컨트롤러 작업

 - `FormController`
```java
@Controller
@RequiredArgsConstructor
public class FormController {

    @GetMapping("/")
    public String main() {
        return "main";
    }

}
```


<br/>

### 메인 화면 작업

 - `main.hbs`
    - Bootstrap과 jQuery 스크립트를 로드해준다.
```hbs
<!DOCTYPE HTML>
<html>
<head>
    <meta charset="UTF-8">
    <title>Pharmacy Recommendation System</title>

    <!--부트스트랩 css 추가-->
    <link rel="stylesheet" href="/css/lib/bootstrap.min.css">

    <!--부트스트랩 js, jquery 추가-->
    <script src="/js/lib/jquery.min.js"></script>
    <script src="/js/lib/bootstrap.min.js"></script>
</head>
<body>

<!-- 화면 컨테이너-->
<div>
    <div class="container">
    </div>
</div>

<!-- 스크립트 -->
<script>
</script>

</body>
</html>
```
<br/>

## 우편번호 서비스 적용 (Kakao)

 - 카카오 우편번호 서비스: https://postcode.map.daum.net/guide

 - `main.hbs`
```hbs
<!DOCTYPE HTML>
<html>
<head>
    <meta charset="UTF-8">
    <title>Pharmacy Recommendation System</title>

    <!--부트스트랩 css 추가-->
    <link rel="stylesheet" href="/css/lib/bootstrap.min.css">

    <!--부트스트랩 js, jquery 추가-->
    <script src="/js/lib/jquery.min.js"></script>
    <script src="/js/lib/bootstrap.min.js"></script>
</head>
<body>

<!-- 화면 컨테이너-->
<div>
    <div class="container">
        <div>
            <h2>Pharmacy Recommendation</h2>
        </div>
        <div class="body">
            <form action="/search" method="post">
                <div>
                    <label for="address">주소를 입력하시면 주소 기준으로 가까운 약국의 위치 최대 3곳 추천드립니다.</label>
                    <input type="text" class="form-control" id="address_kakao" name="address"
                           placeholder="주소(지번 또는 도로명)를 입력하세요. ex) 서울특별시 성북구 종암로 10길" readonly>
                </div>
                <div>
                    <button type="submit" class="btn btn-primary" id="btn-save">Search</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- 스크립트 -->
<script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
<script>
    window.onload = function() {
        document.getElementById("address_kakao").addEventListener("click", function(){
            new daum.Postcode({
                oncomplete: function(data) {
                    document.getElementById("address_kakao").value = data.address;
                }
            }).open();
        });
    }
</script>

</body>
</html>
```
<br/>

## 메인화면 & 결과화면 구현

 - `FormController`
    - @ModelAttribute는 기본 생성자가 있으면 Setter가 필요하고, @AllArgsConstructor 생성자만 있으면 Setter가 필요없다.
```java
@Controller
@RequiredArgsConstructor
public class FormController {
    private final PharmacyRecommendationService pharmacyRecommendationService;

    @GetMapping("/")
    public String main() {
        return "main";
    }

    @PostMapping("/search")
    public ModelAndView postDirection(@ModelAttribute InputDto inputDto) {

        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("output");
        modelAndView.addObject("outputFormList",
                pharmacyRecommendationService.recommendPharmacyList(inputDto.getAddress()));

        return modelAndView;
    }
}

// 입력 Dto
@Getter
@AllArgsConstructor
public class InputDto {
    private String address;
}

// 출력 Dto
@Getter
@Builder
public class OutputDto {

    private String pharmacyName;    // 약국 명
    private String pharmacyAddress; // 약국 주소
    private String directionUrl;    // 길안내 url
    private String roadViewUrl;     // 로드뷰 url
    private String distance;        // 고객 주소와 약국 주소의 거리
}
```
<br/>

 - `output.hbs`
    - Handlebars에서 제공하는 each 헬퍼를 이용하여 List를 순회하여 결과를 출력한다.
```hbs
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Pharmacy Recommendation System</title>
    <!--부트스트랩 css 추가-->
    <link rel="stylesheet" href="/css/lib/bootstrap.min.css">

    <script src="/js/lib/jquery.min.js"></script>
    <script src="/js/lib/bootstrap.min.js"></script>
</head>
<body>
<div>
    <h2 class="h2-title">Pharmacy Recommendation Results</h2>
</div>

<table class="table table-hover">
    <tr>
        <th>약국명</th>
        <th>약국 주소</th>
        <th>거리</th>
        <th>길안내 링크</th>
        <th>로드뷰 링크</th>
    </tr>
    {{#each outputFormList}}
        <tr>
            <td>{{pharmacyName}}</td>
            <td>{{pharmacyAddress}}</td>
            <td>{{distance}}</td>
            <td><a href="{{directionUrl}}">{{directionUrl}}</a></td>
            <td><a href="{{roadViewUrl}}">{{roadViewUrl}}</a></td>
        </tr>
    {{/each}}
</table>

</body>
</html>
```
<br/>

## MockMVC를 이용한 테스트 케이스 작성

 - 스프링 MVC를 모킹하여 웹 어플리케이션을 테스트 할 수 있는 도구
 - 컨트롤러 레이어를 테스트 하기 위해 사용

```groovy
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.*; 

class FormControllerTest extends Specification {

    private MockMvc mockMvc
    private PharmacyRecommendationService pharmacyRecommendationService = Mock()

    def setup() {
        // FormController를 MockMvc 객체로 만든다.
        mockMvc = MockMvcBuilders.standaloneSetup(new FormController(pharmacyRecommendationService)).build();
    }

    def "GET /"() {

        expect:
        // FormController 의 "/" URI를 get방식으로 호출
        mockMvc.perform(get("/"))
                .andExpect(handler().handlerType(FormController.class))
                .andExpect(handler().methodName("main"))
                .andExpect(status().isOk()) // 예상 값을 검증한다.
                .andExpect(view().name("main")) // 호출한 view의 이름이 main인지 검증(확장자는 생략)   
                .andDo(log())
    }
}
```

 - `POST FORM 요청 테스트`
```groovy
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.*

class FormControllerTest extends Specification {

    private MockMvc mockMvc
    private PharmacyRecommendationService pharmacyRecommendationService = Mock()
    private List<OutputDto> outputDtoList

    def setup() {
        // FormController를 MockMvc 객체로 만든다.
        mockMvc = MockMvcBuilders.standaloneSetup(new FormController(pharmacyRecommendationService))
                .build()

        outputDtoList = Lists.newArrayList(
                OutputDto.builder()
                        .pharmacyName("pharmacy1")
                        .build(),
                OutputDto.builder()
                        .pharmacyName("pharmacy2")
                        .build()
        )
    }
    def "POST /search"() {
        given:
        String address = "서울 성북구 종암동"

        when:
        ResultActions result = mockMvc.perform(post("/search")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED) // @ModelAttribute 매핑 검증을 위한 content type 지정
                        .content("address="+address))   // ex) "address=서울 성북구&name=은혜약국" 형태의 쿼리 스트링    

        then:
        1 * pharmacyRecommendationService.recommendPharmacyList(argument -> {
            assert argument == address // mock 객체의 argument 검증    
        }) >> outputDtoList

        def result = resultActions
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.view().name("output"))
                .andExpect(MockMvcResultMatchers.model().attributeExists("outputFormList")) // model에 outputFormList라는 key가 존재하는지 확인
                .andExpect(MockMvcResultMatchers.model().attribute("outputFormList", outputDtoList))
                .andDo(MockMvcResultHandlers.print())
                .andReturn()

        def outputFormList = (List<OutputDto>) result.getModelAndView().getModel().get("outputFormList") // model 값을 직접 검증   
        outputFormList.size() == 2 
    }
}
```
<br/>

 - `리다이렉트 테스트`
```java
// 컨트롤러 코드
@GetMapping("/dir/{encodedId}")
public String searchDirection(@PathVariable("encodedId") String encodedId) {

    Direction resultDirection = directionService.findById(encodedId);

    String result = buildRedirectUrl(resultDirection);

    return "redirect:"+result;
}

// 테스트 코드
mockMvc.perform(get("/dir/{encodedId}", "r"))
        .andExpect(redirectedUrl("https://map.kakao.com/link/map/address,38.11,128.11"));
        .andExpect(status().is3xxRedirection());
```

