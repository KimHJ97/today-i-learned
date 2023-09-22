# REST API 관리

## 테스트

소프트웨어 개발에서 "테스트"는 소프트웨어의 품질을 평가하고 검증하기 위해 사용되는 활동을 의미합니다.  
 - 의도한 대로 기능이 동작하는지 검사하거나 시험하는 것
 - 잠재적인 문제를 발견하고, 발생한 이슈의 재발 방지를 하는 것
```
단위 테스트(Unit Testing): 개별 코드 단위(함수, 메서드)를 테스트하여 코드의 기능과 로직이 정확한지 확인합니다.

통합 테스트(Integration Testing): 다른 컴포넌트나 모듈 간의 상호 작용을 검증하며, 서로 다른 컴포넌트가 함께 동작하는지 확인합니다.

시스템 테스트(System Testing): 전체 소프트웨어 시스템을 테스트하며, 시스템의 기능과 요구 사항을 검증합니다.

인수 테스트(Acceptance Testing): 최종 사용자가 소프트웨어를 테스트하여 요구 사항을 충족시키는지 확인하며, 사용자의 요구 사항을 검증합니다.

성능 테스트(Performance Testing): 소프트웨어의 성능, 안정성 및 확장성을 테스트하며, 부하 테스트, 성능 테스트, 스트레스 테스트 등이 포함됩니다.

보안 테스트(Security Testing): 소프트웨어의 보안을 평가하고 취약점을 식별하며, 보안 테스트 및 취약점 분석이 수행됩니다.
```

<br/>

### Test 패턴

 - AAA
    - Arrange: 준비 과정
    - Act: 실행
    - Assert: 검증
```Java
@Test
void plus() {
    // Arrange
    int x = 10;
    int y = 20;

    // Act
    int result = calculator.plus(x, y);

    // Assert
    assertEquals(30, result);
}
```

 - BDD
    - 단위 테스트보다는 시나리오와 행위 기반의 테스트
    - Given: 준비 과정
    - When: 실행
    - Then: 검증
```Java
@Test
void plus() {
    // Given
    int x = 10;
    int y = 20;

    // When
    int result = calculator.plus(x, y);

    // Then
    assertEquals(30, result);
}
```
 - SpringBootTest + TestRestTemplate 예시
```Java
// HttpRequestTest
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.net.URI;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class HttpRequestTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    public void helloWorldMessageTest() {
        // given
        URI testUrl = URI.create("http://localhost:" + port + "/hello");

        // when
        String response = this.restTemplate.getForObject(testUrl, String.class);

        // then
        assertThat(response).contains("Hello World");
    }
}

// ProductControllerIntegrationTest
import com.fastcampus.helloapitest.domain.ProductDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.net.URI;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
class ProductControllerIntegrationTest {
    @Autowired
    private TestRestTemplate restTemplate;
    private String host = "http://localhost";
    @LocalServerPort
    private int port;

    @Test
    void findProductTest() {
        // given
        Long testProductId = 1_000L;
        URI testUrl = URI.create(host + ":" + port + "/products/" + testProductId);

        // when
        ResponseEntity<ProductDTO> response = restTemplate.getForEntity(testUrl, ProductDTO.class);

        // then
        ProductDTO productDTO = response.getBody();
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(productDTO);
        assertEquals("멋진 상품", productDTO.getName());
        assertEquals(BigDecimal.valueOf(15_000), productDTO.getPrice());
    }
}
```

<br/>

### API 테스트 항목

 - 기능 테스트: API가 의도한 대로 동작하는지 확인
 - 회기 테스트: API의 기존 기능이 동작하는지 확인
 - 호환성 테스트: API가 하위 호환성을 지원하는지 확인
 - 성능 테스트: API 속도는 적정한지 확인

<br/>

### API 테스트 방법

 - 수동
    - API 호출과 응답 관련 테스트 코드를 직접 작성
    - 테스트 프레임워크 활용(JUnit, Pytest)
    - Postman, Selenium
 - 자동
    - 테스트 프레임워크 활용(JUnit, Pytest)
    - CI, 젠킨스를 활용한 테스트 자동화

<br/>

## API 문서화

API 문서화(API documentation)는 소프트웨어 개발자나 사용자가 어떻게 특정 API(애플리케이션 프로그래밍 인터페이스)를 사용해야 하는지 이해하고 활용할 수 있도록 정보를 제공하는 과정 및 결과물을 의미합니다.  
API 문서는 해당 API의 기능, 사용법, 매개변수, 응답 형식, 오류 코드 등과 관련된 정보를 포함하며, 이를 통해 개발자들이 해당 API를 효과적으로 활용할 수 있도록 도와줍니다.  
 - API 문서화 솔루션: Swagger, Restdocs

<br/>

### Swagger

Swagger는 API 문서화와 개발을 위한 오픈 소스 프레임워크로, RESTful API를 설계, 빌드, 문서화, 및 테스트하는 데 사용됩니다.  
Swagger는 강력한 도구 및 라이브러리 집합으로 구성되어 개발자와 API 사용자에게 API에 대한 이해와 상호 작용을 용이하게 만듭니다.  
 - API 문서화 도구
 - API 테스트를 위한 UI 제공
 - 대화형 API 문서
 - 적용이 쉬움

<br/>

### Swagger 설정하기

Swagger를 적용하기 위해서는 의존성 추가, 자바 설정, Controller에 Swagger 어노테이션을 통해 API 명세 정의를 하면 된다.  
Swagger의 접속하기 위해서는 "http://localhost:8080/swagger-ui/index.html" URL로 접속할 수 있다.  

 - build.gradle
    - Swagger 의존성을 추가한다.
```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'

    // 스웨거 의존성 추가
    implementation 'org.springdoc:springdoc-openapi-ui:1.6.14'

    compileOnly 'org.projectlombok:lombok'
    developmentOnly 'org.springframework.boot:spring-boot-devtools'
    annotationProcessor 'org.springframework.boot:spring-boot-configuration-processor'
    annotationProcessor 'org.projectlombok:lombok'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

 - SwaggerConfig
```Java
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springdoc.core.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    public static final String API_TITLE = "Hello Swagger API";
    public static final String API_DESCRIPTION = "샘플 프로젝트 API 명세서입니다.";
    public static final String API_VERSION = "v0.1";
    public static final String API_GROUP_NAME = "hello-swagger-public";

    @Bean
    public GroupedOpenApi groupedOpenApi() {
        String[] paths = {"/**"};
        return GroupedOpenApi.builder()
                .group(API_GROUP_NAME)
                .pathsToMatch(paths)
                .build();
    }

    @Bean
    public OpenAPI openApi() {
        return new OpenAPI()
                .info(new Info().title(API_TITLE)
                        .description(API_DESCRIPTION)
                        .version(API_VERSION)
                );
    }
}
```

 - ProductController
    - OpenAPI
        - @OpenAPIDefinition: 오픈 API 정의를 위한 일반 메타 데이터
        - @Info: 오픈 API 정의를 위한 정보 메타 데이터
        - @Contact: 오픈 API 정의를 위한 연락처 정보
        - @License: 오픈 API 정의를 위한 라이센스를 설정하는 정보
    - Operations
        - @Operation: 특정한 경로 동작 또는 HTTP 메서드에 대한 설명
        - @Parameter: 오픈 API 동작의 단일 파라미터
        - @RequestBody: 오픈 API 동작의 요청 본문
        - @ApiResponse: 동작에 대한 응답
        - @Tag: 오픈 API 동작 또는 정의에 태그 표현
        - @Server: 오픈 API 동작 또는 정의에 서버
    - Media
        - @Schema: 입력, 출력 데이터 정의 허용
        - @ArraySchema: 배열 타입의 입력, 출력 데이터 정의 허용
        - @Contnet: 특정 미디어 타입에 대한 스키마와 예제 제공
```Java
import com.fastcampus.helloswagger.domain.Product;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@RestController
public class ProductController {

    @GetMapping(value = "/products")
    @Operation(summary = "상품 목록 요청", description = "상품 전체 목록을 조회합니다.", tags = { "Product Controller" })
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "OK",
                    content = @Content(
                            schema = @Schema(
                                    implementation = Product.class
                            )
                    )
            ),
            @ApiResponse(responseCode = "400", description = "BAD REQUEST"),
            @ApiResponse(responseCode = "404", description = "NOT FOUND"),
            @ApiResponse(responseCode = "500", description = "INTERNAL SERVER ERROR")
    })
    public ResponseEntity<List<Product>> list() {
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping(value = "/product")
    @Operation(summary = "상품 정보 요청", description = "단일 상품을 조회합니다.", tags = { "Product Controller" })
    public ResponseEntity<Product> get(
            @Parameter(name = "productId", description = "조회할 상품 아이디", required = true) @RequestParam(value = "productId") Long productId) {
        Product product = Product.of(1000L, "테스트 상품", BigDecimal.valueOf(2000));
        return ResponseEntity.ok(product);
    }

    @PostMapping(value = "/products")
    @Operation(summary = "상품 생성 요청", description = "상품을 생성합니다.", tags = { "Product Controller" })
    public ResponseEntity<Product> create(@RequestBody Product product) {
        return ResponseEntity.ok(product);
    }

    @PutMapping(value = "/products")
    @Operation(summary = "상품 수정 요청", description = "상품 정보를 수정합니다.", tags = { "Product Controller" })
    public ResponseEntity<Product> update(@RequestBody Product product) {
        return ResponseEntity.ok(product);
    }

    @DeleteMapping(value = "/products/{productId}")
    @Operation(
            summary = "상품 삭제 요청",
            description = "선택한 상품을 삭제합니다.",
            tags = { "Product Controller" }
    )
    public ResponseEntity<Long> delete(@PathVariable("productId") Long productId) {
        return ResponseEntity.ok(productId);
    }
}
```

