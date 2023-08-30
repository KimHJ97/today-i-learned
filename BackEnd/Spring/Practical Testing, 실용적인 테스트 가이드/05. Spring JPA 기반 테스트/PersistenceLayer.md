# Persistence Layer 테스트

 - Data Access의 역할
 - 비즈니스 가공 로직이 포함되어서는 안 된다. Data에 대한 CRUD에만 집중한 레이어

<br/>

## 어노테이션

Persistence Layer를 테스트하기 위해서는 @SpringBootTest, @DataJpaTest 어노테이션을 이용할 수 있다.  
 - @SpringBootTest
    - @SpringBootTest 어노테이션은 스프링 부트 애플리케이션의 통합 테스트를 작성할 때 사용됩니다. 이 어노테이션은 테스트 환경을 설정하고, 실제 애플리케이션 컨텍스트를 로드하며, 테스트에서 스프링 빈(Bean)과 컴포넌트들을 사용할 수 있게 해줍니다. @SpringBootTest 어노테이션을 사용하면 전체 애플리케이션의 구성 요소들을 테스트할 수 있습니다.
 - @DataJpaTest
    - @DataJpaTest 어노테이션은 스프링 데이터 JPA와 관련된 테스트를 작성할 때 사용됩니다. 이 어노테이션은 데이터베이스와의 상호작용을 테스트하고 JPA 리포지토리와 연동된 테스트를 수행할 때 유용합니다. @DataJpaTest 어노테이션을 사용하면 실제 데이터베이스 연결을 설정하고, 테스트용 데이터베이스를 사용하여 테스트를 실행합니다.
    - __@DataJpaTest를 사용하면 모든 테스트가 자동으로 롤백이 된다.__
 - 즉, @DataJpaTest는 JPA 관련된 빈들만 주입하여 서버를 띄워 속도가 좀더 빠르다.

<br/>

## 테스트 코드 작성

 - ProductRepositoryTest
    - 테스트하고자하는 Repository를 @Autowired로 의존성 주입받는다. @DataJpaTest 어노테이션을 통해 JPA 관련 빈들이 등록되어 주입이 가능하다.
    - Given: 상품 3개를 저장한다.
    - When: SELLING, HOLD 상태인 상품을 조회했을 때
    - Then: 리스트의 사이즈는 2개여야 하고, 해당 값을 가진 리스트가 포함되어야 한다.
```Java
@ActiveProfiles("test")
@DataJpaTest
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @DisplayName("원하는 판매 상태를 가진 상품들을 조회한다.")
    @Test
    void test() {
        // Given
        Product product1 = Product.builder()
                .productNumber("001")
                .type(HANDMADE)
                .sellingStatus(SELLING)
                .name("아메리카노")
                .price(4000)
                .build();
        Product product2 = Product.builder()
                .productNumber("002")
                .type(HANDMADE)
                .sellingStatus(HOLD)
                .name("카페라떼")
                .price(4500)
                .build();
        Product product3 = Product.builder()
                .productNumber("003")
                .type(HANDMADE)
                .sellingStatus(STOP_SELLING)
                .name("팥빙수")
                .price(7000)
                .build();
        productRepository.saveAll(List.of(product1, product2, product3));

        // When
        List<Product> products = productRepository.findAllBySellingStatusIn(List.of(SELLING, HOLD));

        // Then
        assertThat(products).hasSize(2)
                .extracting("productNumber", "name", "sellingStatus")
                .containsExactlyInAnyOrder(
                        tuple("001", "아메리카노", SELLING),
                        tuple("002", "카페라떼", HOLD)
                );
    }
}
```
