# WebMvcTest

@WebMvcTest는 Spring Boot에서 제공하는 테스트 어노테이션 중 하나로, Spring MVC 컨트롤러를 테스트하기 위해 사용됩니다. 이 어노테이션은 주로 컨트롤러 레이어를 단위 테스트(unit test)할 때 사용되며, 웹 애플리케이션의 다른 부분(예: 서비스, 리포지토리, 데이터베이스 등)은 제외하고 오직 컨트롤러만을 테스트할 수 있게 합니다.  

 - 경량화된 컨텍스트 로드: @WebMvcTest는 컨트롤러 관련 빈(beans)만 로드하기 때문에 전체 애플리케이션 컨텍스트를 로드하는 것보다 훨씬 빠르고 가볍습니다.
 - MockMvc 사용: MockMvc 객체를 사용하여 HTTP 요청을 만들고 응답을 검증할 수 있습니다. 이를 통해 실제 HTTP 서버를 시작하지 않고도 웹 레이어를 테스트할 수 있습니다.
 - 자동 설정: Spring Boot가 자동으로 필요한 설정을 해주기 때문에, 별도의 설정 없이도 컨트롤러 테스트를 쉽게 작성할 수 있습니다.
 - 다른 레이어와 격리: 서비스나 리포지토리 빈은 로드되지 않으므로, 테스트는 컨트롤러 레이어에 집중됩니다.

```java
@WebMvcTest(controllers = MyController.class)
public class MyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // 컨트롤러에서 사용하는 서비스 빈을 목(mock)으로 등록합니다.
    @MockBean
    private MyService myService;

    @Test
    public void testMyController() throws Exception {
        // mockMvc를 사용하여 HTTP GET 요청을 보내고 응답을 검증합니다.
        mockMvc.perform(get("/api/hello"))
               .andExpect(status().isOk())
               .andExpect(content().string("Hello, World!"));
    }

}
```
<br/>

## 1. @WebMvcTest에 대하여

@WebMvcTest는 웹 계층과 관련된 빈들만 찾아서 빈으로 등록한다. @Componenet나 @ConfigurationProperties 등을 사용하는 빈들은 스캔되지 않는다.  
 - @SpringBootTest는 Spring의 모든 빈 컨텍스트를 띄우고 테스트를 실행한다. 때문에, 무겁게 실행이 된다. @WebMvcTest는 웹 계층의 테스트를 위한 것으로, 컨트롤러와 관련된 빈들만 등록한다. 그 외 서비스(Service)나 레포지토리(Repository)와 같은 다른 빈들은 Mock 객체를 대체하여 사용한다.
 - @Controller, @RestController, @ControllerAdvice, @JsonComponent, @Converter, @Filter, @WebFilter, @Servlet, @WebServlet, WebMvcConfigurer 등이 빈으로 등록된다.

<br/>

## 2. 테스트 양식

 - `상품 API 테스트`
    - @WebMvcTest는 MockMvc를 자동으로 빈으로 등록해준다.
    - Controller에서 의존하고 있는 객체들은 Mock으로 등록하고, 모의 객체의 행동을 스터빙한다.
    - 특정 API에 대한 여러 케이스가 존재하는 경우 @Nested 안에 성공 케이스, 실패 케이스 여러 개를 정의할 수도 있다.
```java
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.hamcrest.Matchers.equalTo;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// @AutoConfigureMockMvc
@WebMvcTest(controllers = ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    @DisplayName("상품 목록 조회")
    @Test
    void getProducts_success() throws Exception {
        // Given
        List<ProductResponse> result = List.of();
        ProductSearchRequest request = PostSearchRequest().builder()
                    .name("상품 이름")
                    .build();

        when(demoService.getDemoList(any(ProductSearchServiceRequest.class))).thenReturn(result);

        // When, Then
        mockMvc.perform(
                        get("/api/v1/products")
                )
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200"))
                .andExpect(jsonPath("$.status").value("OK"))
                .andExpect(jsonPath("$.message").value("OK"))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Nested
    @DisplayName("상품 등록")
    class ProductCreateTest {
        @Test
        @DisplayName("상품 등록 성공")
        void createProduct_success() throws Exception {
            // Given
            ProductCreateRequest request = DemoCreateRequest.builder()
                    .name("상품 이름")
                    .price(10_000)
                    .build();

            // When, Then
            mockMvc.perform(
                            MockMvcRequestBuilders.post("/api/v1/products")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request))
                    )
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("상품 등록 실패 - 이름 없음")
        void createProduct_fail_no_name() throws Exception {
            // Given
            ProductCreateRequest request = DemoCreateRequest.builder()
                    .price(10_000)
                    .build();

            // When, Then
            mockMvc.perform(
                            MockMvcRequestBuilders.post("/api/v1/products")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request))
                    )
                    .andDo(print())
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("400"))
                    .andExpect(jsonPath("$.status").value("BAD_REQUEST"))
                    .andExpect(jsonPath("$.message").value("상품 이름은 필수입니다."))
                    .andExpect(jsonPath("$.data").isEmpty());
        }
    }
}
```
<br/>

## 3. 테스트 주의사항

### JPA Auditing 사용시 주의사항

JPA Auditing 기능을 사용하는 프로젝트에서 테스트 코드를 실행할 때 발생할 수 있다.  
WebMvcTest 같은 슬라이스 테스트를 수행하는 경우 별도로 import를 하지 않는 이상 JPA와 연관된 빈들을 로드하지 않는다. 때문에, @EnableJpaAuditing에서 요구하는 JPA 관련 빈을 등록할 수 없는 현상이 발생한다.  
```
Caused by: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'jpaAuditingHandler': Cannot resolve reference to bean 'jpaMappingContext' while setting constructor argument; nested exception is org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'jpaMappingContext': Invocation of init method failed; nested exception is java.lang.IllegalArgumentException: JPA metamodel must not be empty!
```

 - `문제 사항`
    - 모든 테스트는 애플리케이션 클래스가 항상 로드되면서 실행된다. @EnableJpaAuditing 어노테이션이 정의되어 있으면 모든 테스트가 항상 JPA 관련된 빈을 필요로 하게 된다. @WebMvcTest 어노테이션은 JPA 관련 빈들은 로드하지 않기 떄문에 문제가 발생한다.
```java
@EnableJpaAuditing
@SpringBootApplication
public class Appplication {
    ..
}
```
<br/>

 - `방안 1. JpaMetamodelMappingContext을 모의 객체 빈으로 등록하기`
    - 모든 테스트에 해당 어노테이션을 정의해주어야 한다.
```java
@MockBean(JpaMetamodelMappingContext.class)
@WebMvcTest(controllers = MyController.class)
public class MyControllerTest {
    ..
}
```
<br/>

 - `방안 2. Configuration 분리하기`
    - ※ 설정으로 Auditing 파일을 분리한 경우 @DataJpaTest 테스트 시에 @Import(JpaAuditingConfiguration.class) 를 정의해주어야 한다. 테스트 시에 createdAt, updatedAt이 NULL 값이 들어갈 수 있다.
```java
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfiguration {  
}
```
<br/>

### 컨텍스트 로드 - 환경 통합하기

애플리케이션 컨텍스트가 갖는 빈이 달라지는 경우 새로운 컨텍스트가 계속해서 생성된다. 즉, 컨트롤러마다 각각의 @WebMvcTest 구현과 다른 빈들이 필요한 경우 N개의 컨텍스트가 로드된다.  

 - `사용자 인터페이스 계층을 위한 통합 환경 클래스`
    - Controller에서 필요한 모의 객체들을 통합 환경 클래스에 정의한다.
```java
@WebMvcTest(controllers = {
        OrderController.class,
        ProductController.class
})
public abstract class ControllerTestSupport {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @MockBean
    protected OrderService orderService;

    @MockBean
    protected ProductService productService;
}
```
<br/>

 - `통합 환경 클래스를 사용한 테스트 코드`
    - 필요한 의존 객체들은 통합 환경 클래스에서 제공된다.
    - 모의 객체는 통합 환경 클래스를 상속받아서 사용하고, 모의 객체의 행동은 각각 테스트안에서 스터빙을 정의한다.
```java
// 주문 API 테스트
class OrderControllerTest extends ControllerTestSupport {
    ..
}

// 상품 API 테스트
class ProductControllerTest extends ControllerTestSupport {
    ..
}
```
