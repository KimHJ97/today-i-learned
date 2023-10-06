# GraphQL 적용하기

## 기존 상품 정보 조회 방식

클라이언트 > 어드민 서버 > DB 조회

 - JPA + Database
```Java
@GetMapping(value = {"/products", "/products/"})
public String list(@PageableDefault Pageable pageable, Model model) {
    List<ProductDTO> productDTOS = productService.findAll(pageable);
    model.addAttribute("products", productDTOS);
    return "/products/products";
}
```

<br/>

## GraphQL 적용

클라이언트 > 어드민 서버 > GraphQL > DB 조회

 - build.gradle
```gradle
dependencies {
    implementation 'com.netflix.graphql.dgs:graphql-dgs-spring-boot-starter:5.5.1'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    runtimeOnly 'com.mysql:mysql-connector-j'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

 - src/main/resources/schema/*.graphqls
    - GraphQL 스키마 생성
```
type Query {
    products(page: Int, size: Int): [Product]
}

type Product {
    productId: ID
    name: String
    price: BigDecimal
    vendorId: Int
    status: ProductStatus
    imageUrl: String
    imageDetailUrl: String
    productDesc: String
    isExposed: Boolean
    isDeleted: Boolean
    createdAt: DateTime
    createdBy: String
    updatedAt: DateTime
    updatedBy: String
}

enum ProductStatus {
    READY_TO_SELL
}

scalar BigDecimal
scalar DateTime
```

 - Custom 타입 만들기
    - GraphQL에서 제공하는 타입이 없는 경우
```Java
// 만드는 방법
@DgsScalar(name = "타입이름")
public class LongScalar implements Coercing<타입, String> {
    @Override
    public String serialize(@NotNull Object dataFetcherResult) throws CoercingSerializeException {
    return null;
    }

    @Override
    public @NotNull Long parseValue(@NotNull Object input) throws CoercingParseValueException {
        return null;
    }

    @Override
    public @NotNull Long parseLiteral(@NotNull Object input) throws CoercingParseLiteralException {
        return null;
    }
}

// BigDecimal Scalar
@DgsScalar(name="BigDecimal")
public class BigDecimalScalar implements Coercing<BigDecimal, String> {
    @Override
    public String serialize(@NotNull Object dataFetcherResult) throws CoercingSerializeException {
        if (dataFetcherResult instanceof BigDecimal) {
            return ((BigDecimal) dataFetcherResult).toPlainString();
        } else {
            throw new CoercingSerializeException("Not a valid DateTime");
        }
    }

    // 들어온 값을 BigDecimal로 변환
    @Override
    public @NotNull BigDecimal parseValue(@NotNull Object input) throws CoercingParseValueException {
        return new BigDecimal(input.toString());
    }

    @Override
    public @NotNull BigDecimal parseLiteral(@NotNull Object input) throws CoercingParseLiteralException {
        if (input instanceof StringValue) {
            return new BigDecimal(input.toString());
        }
        throw new CoercingParseLiteralException("Value is not a valid ISO date time");
    }
}
```

 - 데이터 조회 GraphQL
```Java
@DgsComponent
@RequiredArgsConstructor
public class ProductDataFetcher {

    private final ProductQueryService productQueryService;

    @DgsQuery
    public List<ProductDTO> products(@InputArgument Integer page, @InputArgument Integer size) {
        List<Product> products = productQueryService.findAll(PageRequest.of(page, size));
        return products.stream()
                .map(p -> ProductDTO.of(p))
                .collect(Collectors.toList());
    }
}
```

 - GraphQL 테스트
```graphql
query {
    products(page: 0, size:20) {
        productId
        price
        createdAt
    }
}
```

<br/>

### 기존 서비스에 GraphQL 적용

기존 어드민 서비스에서 직접 DB 조회를 RestTemplate 라이브러리를 이용하여 GraphQL 서버로 요청하여 데이터를 조회하도록 한다.

 - ProductAdapter
    - GraphQL 연동 Adapter를 만든다.
```Java
@Component
@RequiredArgsConstructor
public class ProductAdapter {

    private final RestTemplate restTemplate;

    @Value("${apis.product-graphql-api.url}")
    private String productGraphqlApiUrl;

    // GraphQL 쿼리 문자열
    private String query = "query {\n" +
            " products(page: 0, size:20) {\n" +
            "   productId\n" +
            "   price\n" +
            "   createdAt\n" +
            " }\n" +
            "}";

    public List<ProductDTO> findAll(Pageable pageable) {
        // 1. GraphQLClient.createCustom 생성
        // 2. GraphQLResponse graphQLResponse = GraphQLClient.createCustom 실행
        CustomGraphQLClient client = GraphQLClient.createCustom(productGraphqlApiUrl, (url, headers, body) -> {
            HttpHeaders httpHeaders = new HttpHeaders();
            headers.forEach(httpHeaders::addAll);
            ResponseEntity<String> exchange = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(body, httpHeaders), String.class);
            return new HttpResponse(exchange.getStatusCodeValue(), exchange.getBody
            ());
        });

        // 3. GraphQLResponse를 응답 객체로 변환
        GraphQLResponse graphQLResponse = client.executeQuery(query, emptyMap(), "");

        // 4. List<ProductDTO> 형태로 응답에서 값 추출 및 변환
        ProductGraphqlConnection productGraphqlConnection = graphQLResponse.dataAsObject(ProductGraphqlConnection.class);
        List<ProductDTO> products = productGraphqlConnection.productGraphqlDTOS.stream()
                .map(p -> {
                    return ProductDTO.builder()
                            .productId(p.getProductId())
                            .price(p.getPrice())
                            .createdAt(p.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
```

 - Controller
```Java
// Before: DB 호출
@GetMapping(value = {"/products", "/products/"})
public String list(@PageableDefault Pageable pageable, Model model) {
    List<ProductDTO> productDTOS = productService.findAll(pageable);
    model.addAttribute("products", productDTOS);
    return "/products/products";
}

// After: GraphQL 서버 호출
@GetMapping(value = {"/products", "/products/"})
public String list(@PageableDefault Pageable pageable, Model model) {
    List<ProductDTO> productDTOS = productAdapter.findAll(pageable);
    model.addAttribute("products", productDTOS);
    return "/products/products";
}
```
