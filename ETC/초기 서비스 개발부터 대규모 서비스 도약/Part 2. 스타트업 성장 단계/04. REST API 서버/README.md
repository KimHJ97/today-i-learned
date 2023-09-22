# REST API 서버

## API

API는 "Application Programming Interface"의 약자로, 소프트웨어 컴포넌트나 서비스가 다른 프로그램과 상호 작용하기 위해 정의된 규칙과 프로토콜의 집합을 나타냅니다. API는 애플리케이션 간에 데이터를 교환하고 서비스를 요청하고 응답하는 방법을 제공하며, 다양한 소프트웨어 요소 사이의 통합을 가능하게 합니다.  

 - Application Programming API
    - Application: 고유한 기능을 가진 소프트웨어
    - Interface: 인터페이스는 두 애플리케이션 간의 서비스 계약
 - 애플리케이션이 통신할 수 있는 대화 방법

<br/>

### REST

REST는 "Representational State Transfer"의 약자로, 웹 서비스의 아키텍처 스타일 중 하나입니다. REST는 웹 기반 애플리케이션에서 리소스를 관리하고 상호 작용하기 위한 일련의 설계 원칙과 규칙을 제시합니다. 웹 API의 구조와 통신 방식을 정의하기 위한 간결하고 확장 가능한 방법을 제공합니다.  
 - 리소스 (Resources): 모든 것은 리소스로 표현됩니다. 리소스는 웹 API에서 관리하려는 개념적인 엔터티를 나타냅니다. 예를 들어, 사용자, 제품, 주문 등은 리소스가 될 수 있습니다.
 - URI (Uniform Resource Identifier): 각 리소스는 고유한 식별자인 URI를 가집니다. URI는 리소스를 참조하고 식별하는 데 사용됩니다.
 - 표현 (Representation): 리소스는 다양한 표현을 가질 수 있으며, 주로 JSON 또는 XML 형식의 데이터로 표현됩니다. 클라이언트와 서버 간에 데이터 교환에 사용됩니다.
 - 상태 없음 (Statelessness): REST 서버는 각 요청을 독립적으로 처리하며, 이전 요청의 상태를 고려하지 않습니다. 클라이언트가 요청에 필요한 모든 정보를 포함해야 합니다.
 - HTTP 메서드 (HTTP Methods): HTTP 프로토콜의 메서드(GET, POST, PUT, DELETE 등)를 사용하여 리소스와 상호 작용합니다. 예를 들어, GET은 리소스를 검색하고, POST는 리소스를 생성하고, PUT은 리소스를 업데이트하며, DELETE는 리소스를 삭제합니다.
 - 계층 구조 (Layered System): 클라이언트와 서버 사이에 중간 계층을 둘 수 있으며, 이를 통해 확장성과 보안을 개선할 수 있습니다.

<br/>

### REST API

REST API(Representational State Transfer API)는 REST 아키텍처 스타일을 따르는 웹 API의 한 형태입니다. REST API는 웹 서비스 간에 데이터를 교환하고 상호 작용하기 위한 인터페이스를 제공합니다. RESTful API는 HTTP(일반적으로)를 통해 클라이언트와 서버 간에 통신하며, 리소스를 나타내고, URI를 사용하여 리소스를 식별하고, HTTP 메서드를 사용하여 리소스와 상호 작용합니다.  
 - REST 아키텍처 스타일을 따르는 API
 - 클라이언트와 서버가 HTTP를 사용하여 데이터를 통신

<br/>

### REST API 장점

REST API(Representational State Transfer API)는 다양한 이점과 장점을 제공합니다.  
 - 간결하고 직관적인 디자인: REST API는 간단하고 직관적인 디자인 원칙을 따르므로 개발자가 이해하고 사용하기 쉽습니다. 리소스 중심적인 접근 방식과 HTTP 메서드를 사용하여 리소스와 상호 작용하기 때문에 API 디자인이 직관적입니다.
 - 유연성: REST API는 다양한 데이터 형식(주로 JSON 또는 XML)을 지원하므로 다양한 클라이언트와 통신할 수 있습니다. 또한 다양한 프로그래밍 언어와 플랫폼에서 사용할 수 있습니다.
 - 확장성: RESTful 아키텍처는 필요한 경우 시스템을 확장하기 용이하도록 설계되었습니다. 새로운 리소스 유형을 추가하거나 기존 리소스를 확장하면서도 기존 클라이언트에 영향을 미치지 않습니다.
 - 무상태성 (Statelessness): REST API는 상태를 유지하지 않으므로 각 요청은 독립적으로 처리됩니다. 이는 서버 측에서 확장성을 제공하고, 클라이언트 측에서도 서버와의 상호 작용을 단순화합니다.
 - 캐싱 가능: HTTP의 캐싱 메커니즘을 활용하여 데이터를 캐시하고 중복 요청을 최소화할 수 있습니다. 이로 인해 성능이 향상되고 네트워크 대역폭이 절약됩니다.
 - 네트워크 효율성: REST API는 HTTP 프로토콜을 기반으로 하며, 이는 대부분의 네트워크 환경에서 사용 가능한 표준 프로토콜입니다. 따라서 REST API를 통한 통신은 네트워크 효율성을 높입니다.
 - 자체 설명 (Self-Descriptive): REST API는 메시지 자체에 정보를 제공하여 메시지를 해석하고 처리할 수 있는 데 필요한 모든 정보를 포함해야 합니다. 이로써 API 메시지가 자체 설명적이며, 클라이언트가 API를 더 쉽게 이해하고 활용할 수 있습니다.
 - 스케일링: RESTful 서비스는 필요에 따라 수평 확장을 지원하므로 더 많은 트래픽을 처리하기 위해 서버를 확장할 수 있습니다.
 - 네트워크 중립성: REST API는 HTTP를 기반으로 하며, 네트워크 중립적인 디자인을 채택합니다. 따라서 다양한 네트워크 환경에서 작동합니다.

<br/>

### REST API 설계 방식

 - HTTP 메소드
    - GET 요청: 조회
    - POST 요청: 등록
    - PUT 요청: 수정
    - DELETE 요청: 삭제
 - 응답 방식
    - XML, JSON
 - URI 설계
    - URI 끝에 슬래시("/")를 붙이지 않는다.
    - URI 중간에 슬래시("/")로 계층을 표현한다.
    - URI의 각 단어나 구분에 갇고성을 위해 대시("-")를 사용할 수 있다.
    - URI의 각 단어나 구분에 언더바("_")를 사용하지 않는다.
    - URI는 소문자만으로 구성한다.
    - URI 끝에는 파일 확장자를 붙이지 않는다.
    - URI의 각 단어는 복수형을 권장

<br/>

## API 서버 구현

 - 의존성
    - H2 Database
    - Spring Data JPA
    - Spring Web
    - Lombok
    - SPring Boot DevTools
    - Spring Configuration Processor
```gradle
dependencies {
    // Spring Data JPA
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'

    // Spring Web
	implementation 'org.springframework.boot:spring-boot-starter-web'

    // Lombok
	compileOnly 'org.projectlombok:lombok'
	annotationProcessor 'org.projectlombok:lombok'

    // Spring Boot DevTools
    developmentOnly 'org.springframework.boot:spring-boot-devtools'

    // Spring Configuration Processor
    annotationProcessor 'org.springframework.boot:spring-boot-configuration-processor'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

 - 상품 엔티티 만들기
```Java
@Getter
@NoArgsConstructor
@Entity
@Table(name = "products")
public class Product {

    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "price")
    private BigDecimal price;
}
```

 - Repository 만들기
```Java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long>{
}
```

 - Service 만들기
```Java
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {
    private final ProductRepository productRepository;

    public Product save(Product product) {
        return productRepository.save(product);
    }

    public Product replaceEmployee(Product newEmployee, Long productId) {
        return productRepository.findById(productId)
                .map(product -> {
                    product.setName(newEmployee.getName());
                    product.setPrice(newEmployee.getPrice());
                    .return productRepository.save(product);
                })
                .orElseThrow(() -> new ProductNotFoundException(productId));
        
        /*
        return productRepository.findById(id)
                .map(employee -> {
                    // 조회된 상품
                    newProduct.setName(newProduct.getName());
                    newProduct.setPrice(newProduct.getPrice());
                    return productRepository.save(employee);
                })
                .orElseGet(() -> {
                    // 새상품
                    newProduct.setId(id);
                    return productRepository.save(newProduct);
                });
        */
    }

    public void deleteById(Long productId) {
        productRepository.deleteById(productId);
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Product findById(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));
    }
}
```

 - Controller 만들기
```Java
@RestController
@RequiredArgsConstructor
public class ProductController {

    private final ProductServce productService;

    @GetMapping("/products")
    public List<Product> all() {
        return productService.findAll();
    }

    @PostMapping("/products")
    public Product newProduct(@RequestBody Product newProduct) {
        return productService.save(newProduct);
    }

    @GetMapping("/products/{id}")
    public Product one(@PathVariable Long id) {
        return productService.findById(id);
    }

    @PutMapping("/products/{id}")
    public Product replaceProduct(@RequestBody Product newProduct, @PathVariable Long id) {
        return productService.replaceEmployee(newProduct, id);
    }

    @DeleteMapping("/products/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteById(id);
    }
}
```

 - 상품을 못 찾는 경우 에러 처리
    - 직접 RuntimeException을 상속받아 만든다. 
```Java
public class ProductNotFoundException extends RuntimeException {
    public ProductNotFoundException(Long id) {
        super("해당 상품을 찾을 수 없습니다. = " + id);
    }
}
```

 - Exception 공통 처리(Advice 만들기)
    - @ControllerAdvice
    - @ResponseBody
    - @RestControllerAdvice
    - @ExceptionHAndler
    - @ResponseStatus
```Java
@RestControllerAdvice
public class ProductNotFoundAdvice {

    @ExceptionHandler(ProductNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String productNotFoundHandler(ProductNotFoundException ex) {
        return ex.getMessage();
    }
}
```

 - REST API 테스트
    - 크롬 플러그인 이용시: Talend API
    - IntelliJ IDE 이용시: HTTP Client 작성
```
### 상품 목록 조회
GET http://localhost:8080/products

### 상품 등록
POST http://localhost:8080/products
Content-Type: application/json

{
    "id": 3,
    "name": "신규 상품",
    "price": 50000
}

### 상품 삭제
DELETE http://localhost:8080/products/{{productId}}

### 특정 상품 조회
GET http://localhost:8080/products/{{productId}}
```
