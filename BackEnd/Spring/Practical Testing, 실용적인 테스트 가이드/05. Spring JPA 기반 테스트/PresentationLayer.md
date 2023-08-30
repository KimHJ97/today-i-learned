# Presentation Layer 테스트

 - 외부 세계의 요청을 가장 먼저 받는 계층
 - 파라미터에 대한 최소한의 검증을 수행한다.

<br/>

## 사전 정보

 - MockMvc
    - Mock(가짜) 객체를 사용해 스프링 MVC 동작을 재현할 수 있는 테스트 프레임워크
 - @Transactional
    - readOnly = true : 읽기 전용
        - CRUD 에서 CUD 동작 X / only Read
        - JPA : CUD 스냅샷 저장, 변경 감지 X (성능 향상)
        - CQRS - Command / Read 책임 분리
            - Service를 조회용(Read), 커맨드용(Write)으로 따로 작업할 수 있다.
            - DB에 대한 엔드포인트를 구분할 수 있다. 보통 마스터/슬레이브 DB를 나누어 Read용 DB와 Write용 DB를 나누게 된다. readonly 속성의 값을 보고 DB에 대한 엔드포인트를 분리할 수 있다.
            - 클래스 레벨에 @Transactional(readonly = true)를 정의하고, 메서드 레벨에 필요하면 @Transactional을 정의한다. 더 나아가서는 WriteService(Command)와 ReadService(Query)를 분리할 수 있다.
 - @WebMvcTest
    - @SpringBootTest는 Spring의 모든 빈 컨텍스트를 띄우고 테스트를 실행한다. 때문에, 무겁게 실행이 된다. @WebMvcTest는 웹 계층의 테스트를 위한 것으로, 컨트롤러와 관련된 빈들만 등록한다. 그 외 서비스(Service)나 레포지토리(Repository)와 같은 다른 빈들은 Mock 객체를 대체하여 사용한다.
    - @Controller, @ControllerAdvice, @JsonComponent, @Converter, @Filter, @WebFilter, @Servlet, @WebServlet, WebMvcConfigurer 등이 빈으로 등록된다.
 - 요구사항
    - 관리자 페이지에서 신규 상품을 등록할 수 있다.
    - 상품명, 상품 타입, 판매 상태, 가격 등을 입력받는다.

<br/>

### 소스 코드

 - ProductRepository
    - @Query 어노테이션을 이용하여 직접 쿼리를 정의한다. 제일
```Java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllBySellingStatusIn(List<ProductSellingStatus> sellingStatuses);

    List<Product> findAllByProductNumberIn(List<String> productNumbers);

    @Query(value = "select p.product_number from Product p order by id desc limit 1", nativeQuery = true)
    String findLatestProductNumber();
}
```

 - ProductService
    - 클래스 레벨에 @Transactional(readOnly = true)을 정의한다.
    - Write(Command)용 메서드에 @Transactional을 정의하여, JPA의 1차 캐싱, 더티 체킹, 변경 감지 등이 적용되도록 한다.
```Java
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Service
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request) {
        String nextProductNumber = createNextProductNumber();

        Product product = request.toEntity(nextProductNumber);
        Product savedProduct = productRepository.save(product);

        return ProductResponse.of(savedProduct);
    }

    public List<ProductResponse> getSellingProducts() {
        List<Product> products = productRepository.findAllBySellingStatusIn(ProductSellingStatus.forDisplay());

        return products.stream()
                .map(ProductResponse::of)
                .collect(Collectors.toList());
    }

    private String createNextProductNumber() {
        String latestProductNumber = productRepository.findLatestProductNumber();
        if (latestProductNumber == null) {
            return "001";
        }

        int latestProductNumberInt = Integer.parseInt(latestProductNumber);
        int nextProductNumberInt = latestProductNumberInt + 1;

        return String.format("%03d", nextProductNumberInt);
    }

}
```

 - ProductController
```Java
@RequiredArgsConstructor
@RestController
public class ProductController {

    private final ProductService productService;

    @PostMapping("/api/v1/products/new")
    private void createProduct(@RequestBody ProductCreateRequest request) {
        productService.createProduct(request);
    }

    @GetMapping("/api/v1/products/selling")
    public List<ProductResponse> getSellingProducts() {
        return productService.getSellingProducts();
    }
}
```

<br/>

#### 테스트 관련

 - ProductRepositoryTest
```Java
@ActiveProfiles("test")
@DataJpaTest
class ProductRepositoryTest {

    ..

    @DisplayName("가장 마지막으로 저장한 상품의 상품번호를 읽어온다.")
    @Test
    void findLatestProductNumber() {
        // given
        String targetProductNumber = "003";

        Product product1 = createProduct("001", HANDMADE, SELLING, "아메리카노", 4000);
        Product product2 = createProduct("002", HANDMADE, HOLD, "카페라떼", 4500);
        Product product3 = createProduct(targetProductNumber, HANDMADE, STOP_SELLING, "팥빙수", 7000);
        productRepository.saveAll(List.of(product1, product2, product3));

        // when
        String latestProductNumber = productRepository.findLatestProductNumber();

        // then
        assertThat(latestProductNumber).isEqualTo(targetProductNumber);
    }

    @DisplayName("가장 마지막으로 저장한 상품의 상품번호를 읽어올 때, 상품이 하나도 없는 경우에는 null을 반환한다.")
    @Test
    void findLatestProductNumberWhenProductIsEmpty() {
        // when
        String latestProductNumber = productRepository.findLatestProductNumber();

        // then
        assertThat(latestProductNumber).isNull();
    }

    private Product createProduct(String productNumber, ProductType type, ProductSellingStatus sellingStatus, String name, int price) {
        return Product.builder()
                .productNumber(productNumber)
                .type(type)
                .sellingStatus(sellingStatus)
                .name(name)
                .price(price)
                .build();
    }
}
```

 - ProductServiceTest
```Java
@ActiveProfiles("test")
@SpringBootTest
class ProductServiceTest {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @AfterEach
    void tearDown() {
        productRepository.deleteAllInBatch();
    }

    ..

    @DisplayName("상품이 하나도 없는 경우 신규 상품을 등록하면 상품번호는 001이다.")
    @Test
    void createProductWhenProductsIsEmpty() {
        // given
        ProductCreateRequest request = ProductCreateRequest.builder()
                .type(HANDMADE)
                .sellingStatus(SELLING)
                .name("카푸치노")
                .price(5000)
                .build();

        // when
        ProductResponse productResponse = productService.createProduct(request);

        // then
        assertThat(productResponse)
                .extracting("productNumber", "type", "sellingStatus", "name", "price")
                .contains("001", HANDMADE, SELLING, "카푸치노", 5000);

        List<Product> products = productRepository.findAll();
        assertThat(products).hasSize(1)
                .extracting("productNumber", "type", "sellingStatus", "name", "price")
                .contains(
                        tuple("001", HANDMADE, SELLING, "카푸치노", 5000)
                );
    }

    private Product createProduct(String productNumber, ProductType type, ProductSellingStatus sellingStatus, String name, int price) {
        return Product.builder()
                .productNumber(productNumber)
                .type(type)
                .sellingStatus(sellingStatus)
                .name(name)
                .price(price)
                .build();
    }
}
```

<br/>

#### 컨트롤러 테스트

컨트롤러를 테스트하기 위해서는 @WebMvcTest 어노테이션을 이용하여 Spring MVC 애플리케이션의 웹 계층을 테스트할 수 있다.  
@WebMvcTest는 컨트롤러 관련 빈들만 등록하여 가벼운 단위 테스트를 진행할 수 있다. 통합 테스트를 진행할 때는 @SpringBootTest와 같은 어노테이션을 이용하여 모든 빈들을 등록하여 테스트를 진행할 수 있다.  
그 외 나머지 서비스(Service)나 레포지토리(Repository)는 모의 객체(Mock)를 이용하여 사용한다.  

 - build.gradle
    - Validation 의존성을 추가한다.
```gradle
dependencies {
    ..
    implementation 'org.springframework.boot:spring-boot-starter-validation'
}
```

 - ProductCreateRequest
    - 값에 대한 검증이 필요한 부분에 어노테이션을 추가한다.
        - @NotNull: Null이 아니여야 한다. 빈문자열("")과 공백(" ") 등은 통과된다.
        - @NotEmpty: 공백(" ")은 통과한다. 빈문자열("")은 불가능
        - @NotBlank: 공백과 빈문자열 모두 불가능
```Java
@Getter
@NoArgsConstructor
public class ProductCreateRequest {

    @NotNull(message = "상품 타입은 필수입니다.")
    private ProductType type;

    @NotNull(message = "상품 판매상태는 필수입니다.")
    private ProductSellingStatus sellingStatus;

    @NotBlank(message = "상품 이름은 필수입니다.")
    private String name;

    @Positive(message = "상품 가격은 양수여야 합니다.")
    private int price;

    ..
}
```

 - ApiResponse
    - 공통적으로 사용할 수 있는 응답 포맷 클래스
```Java
@Getter
public class ApiResponse<T> {

    private int code;
    private HttpStatus status;
    private String message;
    private T data;

    public ApiResponse(HttpStatus status, String message, T data) {
        this.code = status.value();
        this.status = status;
        this.message = message;
        this.data = data;
    }

    public static <T> ApiResponse<T> of(HttpStatus httpStatus, String message, T data) {
        return new ApiResponse<>(httpStatus, message, data);
    }

    public static <T> ApiResponse<T> of(HttpStatus httpStatus, T data) {
        return of(httpStatus, httpStatus.name(), data);
    }

    public static <T> ApiResponse<T> ok(T data) {
        return of(HttpStatus.OK, data);
    }
}
```

 - ApiControllerAdvice
    - Controller 단에서 에러 발생시 공통 처리된 응답 값으로 응답하도록 처리한다.
```Java
@RestControllerAdvice
public class ApiControllerAdvice {

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(BindException.class)
    public ApiResponse<Object> bindException(BindException e) {
        return ApiResponse.of(
            HttpStatus.BAD_REQUEST,
            e.getBindingResult().getAllErrors().get(0).getDefaultMessage(),
            null
        );
    }
}
```

 - ProductController
    - 파라미터에 @Valid 어노테이션을 정의하여 ProductCreateRequest 클래스 안에 정의된 검증을 적용한다.
```Java
@RequiredArgsConstructor
@RestController
public class ProductController {

    private final ProductService productService;

    @PostMapping("/api/v1/products/new")
    private void createProduct(@Valid @RequestBody ProductCreateRequest request) {
        productService.createProduct(request);
    }

    @GetMapping("/api/v1/products/selling")
    public ApiResponse<List<ProductResponse>> getSellingProducts() {
        return ApiResponse.ok(productService.getSellingProducts());
    }
}
```

<br/>

#### 컨트롤러 테스트 코드

 - JpaAuditingConfig
    - @WebMvcTest 어노테이션은 컨트롤러 관련 빈들만 등록이 된다. 때문에, JPA 관련 빈들이 만들어지지 않아 해당 설정을 분리해준다.
```Java
@EnableJpaAuditing
@Configuration
public class JpaAuditingConfig {
}
```

 - ProductControllerTest
    - @WebMvcTest 어노테이션을 통해 컨트롤러 관련 빈들만 등록한다.
    - 그 외 서비스(Service)나 레포지토리(Repository) 관련 빈들은 모의 객체(Mock)로 대체한다. (@MockBean)
    - MockMvc 클래스를 통해 HTTP 요청 및 응답을 시뮬레이션한다.
        - perform(): 컨트롤러 엔드포인트 호출 (HTTP 요청 시뮬레이션)
        - queryParam(), param(), content(), contentType(): 요청 파라미터나 요청 바디를 설정한다.
        - header(), cookie(): 헤더나 쿠키를 설정한다.
        - andExpect(): 응답 상태 코드, 응답 바디의 내용, 뷰 이름 등을 검증한다.
```Java
@WebMvcTest(controllers = ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    @DisplayName("신규 상품을 등록한다.")
    @Test
    void createProduct() throws Exception {
        // Given
        ProductCreateRequest request = ProductCreateRequest.builder()
                .type(HANDMADE)
                .sellingStatus(SELLING)
                .name("아메리카노")
                .price(4000)
                .build();

        // When // Then
        mockMvc.perform(
                    post("/api/v1/products/new")
                        .content(objectMapper.writeValueAsString(request))
                        .contentType(MediaType.APPLICATION_JSON)
                )
                .andDo(print())
                .andExpect(status().isOk());
    }

    @DisplayName("신규 상품을 등록할 때 상품 타입은 필수값이다.")
    @Test
    void createProductWithoutType() throws Exception {
        // given
        ProductCreateRequest request = ProductCreateRequest.builder()
                .sellingStatus(ProductSellingStatus.SELLING)
                .name("아메리카노")
                .price(4000)
                .build();

        // when // then
        mockMvc.perform(
                        post("/api/v1/products/new")
                                .content(objectMapper.writeValueAsString(request))
                                .contentType(MediaType.APPLICATION_JSON)
                )
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("400"))
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.message").value("상품 타입은 필수입니다."))
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @DisplayName("신규 상품을 등록할 때 상품 판매상태는 필수값이다.")
    @Test
    void createProductWithoutSellingStatus() throws Exception {
        // given
        ProductCreateRequest request = ProductCreateRequest.builder()
                .type(ProductType.HANDMADE)
                .name("아메리카노")
                .price(4000)
                .build();

        // when // then
        mockMvc.perform(
                        post("/api/v1/products/new")
                                .content(objectMapper.writeValueAsString(request))
                                .contentType(MediaType.APPLICATION_JSON)
                )
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("400"))
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.message").value("상품 판매상태는 필수입니다."))
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @DisplayName("신규 상품을 등록할 때 상품 이름은 필수값이다.")
    @Test
    void createProductWithoutName() throws Exception {
        // given
        ProductCreateRequest request = ProductCreateRequest.builder()
                .type(ProductType.HANDMADE)
                .sellingStatus(ProductSellingStatus.SELLING)
                .price(4000)
                .build();

        // when // then
        mockMvc.perform(
                        post("/api/v1/products/new")
                                .content(objectMapper.writeValueAsString(request))
                                .contentType(MediaType.APPLICATION_JSON)
                )
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("400"))
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.message").value("상품 이름은 필수입니다."))
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @DisplayName("신규 상품을 등록할 때 상품 가격은 양수이다.")
    @Test
    void createProductWithZeroPrice() throws Exception {
        // given
        ProductCreateRequest request = ProductCreateRequest.builder()
                .type(ProductType.HANDMADE)
                .sellingStatus(ProductSellingStatus.SELLING)
                .name("아메리카노")
                .price(0)
                .build();

        // when // then
        mockMvc.perform(
                        post("/api/v1/products/new")
                                .content(objectMapper.writeValueAsString(request))
                                .contentType(MediaType.APPLICATION_JSON)
                )
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("400"))
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.message").value("상품 가격은 양수여야 합니다."))
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @DisplayName("판매 상품을 조회한다.")
    @Test
    void getSellingProducts() throws Exception {
        // given
        List<ProductResponse> result = List.of();

        when(productService.getSellingProducts()).thenReturn(result);

        // when // then
        mockMvc.perform(
                        get("/api/v1/products/selling")
                )
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200"))
                .andExpect(jsonPath("$.status").value("OK"))
                .andExpect(jsonPath("$.message").value("OK"))
                .andExpect(jsonPath("$.data").isArray());
    }
}
```

<br/>

#### OrderController 테스트 

 - OrderController
    - 응답 타입을 ApiResponse<T>로 변경한다.
```Java
@RequiredArgsConstructor
@RestController
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/api/v1/orders/new")
    public ApiResponse<OrderResponse> createOrder(@Valid @RequestBody OrderCreateRequest request) {
        LocalDateTime registeredDateTime = LocalDateTime.now();
        return ApiResponse.ok(orderService.createOrder(request, registeredDateTime));
    }
}
```

 - OrderCreateRequest
```Java
@Getter
@NoArgsConstructor
public class OrderCreateRequest {

    @NotEmpty(message = "상품 번호 리스트는 필수입니다.")
    private List<String> productNumbers;

    @Builder
    private OrderCreateRequest(List<String> productNumbers) {
        this.productNumbers = productNumbers;
    }
}

```

 - OrderControllerTest
```Java
@WebMvcTest(controllers = OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderService orderService;

    @DisplayName("신규 주문을 등록한다.")
    @Test
    void createOrder() throws Exception {
        // Given
        OrderCreateRequest request = OrderCreateRequest.builder()
                .productNumbers(List.of("001"))
                .build();

        // When // Then
        mockMvc.perform(
                post("/api/v1/orders/new")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
             )
            .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200"))
                .andExpect(jsonPath("$.status").value("OK"))
                .andExpect(jsonPath("$.message").value("OK"));
    }

    @DisplayName("신규 주문을 등록할 때 상품번호는 1개 이상이어야 한다.")
    @Test
    void createOrderWithEmptyProductNumbers() throws Exception {
        // Given
        OrderCreateRequest request = OrderCreateRequest.builder()
                .productNumbers(List.of())
                .build();

        // When // Then
        mockMvc.perform(
                        post("/api/v1/orders/new")
                                .content(objectMapper.writeValueAsString(request))
                                .contentType(MediaType.APPLICATION_JSON)
                )
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("400"))
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.message").value("상품 번호 리스트는 필수입니다."))
                .andExpect(jsonPath("$.data").isEmpty());
    }
}
```

<br/>

#### 리팩토링

현재 코드에서는 Controller에 전달받은 Dto를 Service 레이어에 그대로 전달하여 사용하고 있다.  
만약, 애플리케이션이 엄청나게 커졌을 경우 컨트롤러와 서비스에 대해 모듈로 분리하고 싶은 경우가 발생할 수 있다.  
이러한 경우 Controller로 전달받은 Dto를 그대로 사용하는 Service는 결론적으로 둘간에 의존 관계가 발생하게 된다.  
상위 레이어는 하위 레이어을 호출하기 때문에 알고 있는 것이 당연하지만, 반대로 하위 레이어가 상위 레이어를 알고 의존하는 것은 좋지 않다.  
즉, Controller에서 전달받는 Dto를 만들고, Service 레이어를 호출할 때 Service Dto로 변환해서 주는 것이 더 좋을 수 있다.
 - Service 레이어 전용 DTO에서는 Validation 의존성이 필요없다.
 - 또한, Controller 레이어 전용 DTO에서도 toEntity() 같은 메서드가 필요없을 수 있다. 대신에 Service 레이어 DTO로 변환해주는 toServiceRequest() 같은 메서드가 필요하다.

<br/>

 - OrderCreateServiceRequest
    - Service 레이어에 사용되는 요청 DTO
```Java
@Getter
@NoArgsConstructor
public class OrderCreateServiceRequest {

    private List<String> productNumbers;

    @Builder
    private OrderCreateServiceRequest(List<String> productNumbers) {
        this.productNumbers = productNumbers;
    }

}
```

 - OrderCreateRequest
    - Controller 레이어에서 사용되는 요청 DTO
```Java
@Getter
@NoArgsConstructor
public class OrderCreateRequest {

    @NotEmpty(message = "상품 번호 리스트는 필수입니다.")
    private List<String> productNumbers;

    @Builder
    private OrderCreateRequest(List<String> productNumbers) {
        this.productNumbers = productNumbers;
    }

    public OrderCreateServiceRequest toServiceRequest() {
        return OrderCreateServiceRequest.builder()
            .productNumbers(productNumbers)
            .build();
    }

}
```

 - OrderController
```Java
// Before
@PostMapping("/api/v1/orders/new")
public ApiResponse<OrderResponse> createOrder(@Valid @RequestBody OrderCreateRequest request) {
    LocalDateTime registeredDateTime = LocalDateTime.now();
    return ApiResponse.ok(orderService.createOrder(request, registeredDateTime));
}

// After
@PostMapping("/api/v1/orders/new")
public ApiResponse<OrderResponse> createOrder(@Valid @RequestBody OrderCreateRequest request) {
    LocalDateTime registeredDateTime = LocalDateTime.now();
    return ApiResponse.ok(orderService.createOrder(request.toServiceRequest(), registeredDateTime));
}
```

<br/>

 - ProductCreateServiceRequest
    - Service 레이어에서 사용되는 요청 DTO
```Java
@Getter
@NoArgsConstructor
public class ProductCreateServiceRequest {

    private ProductType type;
    private ProductSellingStatus sellingStatus;
    private String name;
    private int price;

    @Builder
    private ProductCreateServiceRequest(ProductType type, ProductSellingStatus sellingStatus, String name, int price) {
        this.type = type;
        this.sellingStatus = sellingStatus;
        this.name = name;
        this.price = price;
    }

    public Product toEntity(String nextProductNumber) {
        return Product.builder()
            .productNumber(nextProductNumber)
            .type(type)
            .sellingStatus(sellingStatus)
            .name(name)
            .price(price)
            .build();
    }

}
```
 - ProductCreateRequest
    - Controller 레이어에서 사용되는 요청 DTO
```Java
@Getter
@NoArgsConstructor
public class ProductCreateRequest {

    @NotNull(message = "상품 타입은 필수입니다.")
    private ProductType type;

    @NotNull(message = "상품 판매상태는 필수입니다.")
    private ProductSellingStatus sellingStatus;

    @NotBlank(message = "상품 이름은 필수입니다.")
    private String name;

    @Positive(message = "상품 가격은 양수여야 합니다.")
    private int price;

    @Builder
    private ProductCreateRequest(ProductType type, ProductSellingStatus sellingStatus, String name, int price) {
        this.type = type;
        this.sellingStatus = sellingStatus;
        this.name = name;
        this.price = price;
    }

    public ProductCreateServiceRequest toServiceRequest() {
        return ProductCreateServiceRequest.builder()
                .type(type)
                .sellingStatus(sellingStatus)
                .name(name)
                .price(price)
                .build();
    }

}
```

 - ProductService
    - createProduct() 메서드에 파라미터를 Service 요청 DTO로 변경한다.
```Java
@RequiredArgsConstructor
@Service
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional
    public ProductResponse createProduct(ProductCreateServiceRequest request) {
        String nextProductNumber = createNextProductNumber();

        Product product = request.toEntity(nextProductNumber);
        Product savedProduct = productRepository.save(product);

        return ProductResponse.of(savedProduct);
    }

    ..

}
```

 - ProductController
    - Service 레이어 호출시 DTO를 변환해서 넘겨준다.
```Java
@RequiredArgsConstructor
@RestController
public class ProductController {

    private final ProductService productService;

    @PostMapping("/api/v1/products/new")
    public ApiResponse<ProductResponse> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        return ApiResponse.ok(productService.createProduct(request.toServiceRequest()));
    }

    ..

}
```