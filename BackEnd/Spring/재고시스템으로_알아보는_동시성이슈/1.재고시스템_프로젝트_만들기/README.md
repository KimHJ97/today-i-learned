# 재고시스템 프로젝트 만들기

## Spring Boot 프로젝트 만들기

 - https://start.spring.io/
```
Project
 - Gradle Project

Spring Boot
 - 2.7.0

Project Metadata
 - Group: com.example
 - Artifact: stock
 - Name: stock
 - Description: Demo project for Spring Boot
 - Package name: com.example.stock
 - Packaging: Jar
 - Java: 11

Dependencies
 - Spring Web
 - MySQL Driver
 - Spring Data JPA
```

## 재고 시스템 코드 만들기

 - Stock 엔티티 클래스
```Java
@Entity
public class Stock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productId;

    private Long quantity;

    public Stock() {
    }

    public void decrease(Long quantity) {
        if (this.quantity - quantity < 0) {
            throw new RuntimeException("재고는 0개 미만이 될 수 없습니다.");
        }

        this.quantity -= quantity;
    }

    public Stock(Long productId, Long quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    public Long getQuantity() {
        return quantity;
    }
}
```

 - StockRepository
```Java
public interface StockRepository extends JpaRepository<Stock, Long> {
}
```

 - StockService
```Java
@Service
public class StockService {

    private final StockRepository stockRepository;

    public StockService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void decrease(Long id, Long quantity) {
        // Stock 조회
        Stock stock = stockRepository.findById(id).orElseThrow();

        // 재고 감소
        stock.decrease(quantity);

        // 갱신된 값을 저장
        stockRepository.saveAndFlush(stock);
    }
}
```

 - StockServiceTest
    - ExecutorService: 자바에서 비동기로 실행하는 작업을 단순화하여 사용할 수 있도록 도와주는 클래스
    - CountDownLatch: 다른 쓰레드에서 수행중인 작업이 완료될 때까지 대기할 수 있도록 도와주는 클래스
```Java
@SpringBootTest
class StockServiceTest {

    @Autowired
    private StockService stockService;

    @Autowired
    private StockRepository stockRepository;

    @BeforeEach
    public void insert() {
        Stock stock = new Stock(1L, 100L);

        stockRepository.saveAndFlush(stock);
    }

    @AfterEach
    public void delete() {
        stockRepository.deleteAll();
    }

    @Test
    public void decrease_test() {
        stockService.decrease(1L, 1L);

        Stock stock = stockRepository.findById(1L).orElseThrow();
        // 100 - 1 = 99

        assertEquals(99, stock.getQuantity());
    }

    @Test
    public void 동시에_100명이_주문() throws InterruptedException {
        int threadCount = 100;
        ExecutorService executorService = Executors.newFixedThreadPool(32);
        CountDownLatch latch = new CountDownLatch(threadCount);

        for (int i = 0; i < threadCount; i++) {
            executorService.submit(() -> {
                try {
                    stockService.decrease(1L, 1L);
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();

        Stock stock = stockRepository.findById(1L).orElseThrow();

        // 100 - (100 * 1) = 0
        assertEquals(0, stock.getQuantity());
    }
}
```