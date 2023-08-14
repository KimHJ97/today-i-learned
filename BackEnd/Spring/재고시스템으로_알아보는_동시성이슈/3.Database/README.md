# Database 이용해보기

Database의 Lock을 이용하여 동시성 이슈를 해결할 수 있다.  

 - __Pessimistic Lock (비관적 락)__
    - 실제로 데이터에 Lock을 걸어서 정합성을 맞추는 방법
    - exclusive lock을 걸게 되면 다른 트랜잭션에서는 lock이 해제되기전에 데이터를 가져갈 수 없게 된다.
    - __데드락이 걸릴 수 있기 때문에 주의하여 사용해야 한다.__
 - __Optimistic Lock (낙관적 락)__
    - 실제로 Lock을 이용하지 않고 버전을 이용함으로써 정합성을 맞추는 방법
    - 먼저 데이터를 읽은 후에 update를 수행할 때 현재 내가 읽은 버전이 맞는지 확인하며 업데이트한다. 내가 읽은 버전에서 수정사항이 생겼을 경우 애플리케이션에서 다시 읽은 후에 작업을 수행해야 한다.
 - __Named Lock__
    - 이름을 가진 Metadata Locking
    - 이름을 가진 Lock을 획득한 후 해제할 때까지 다른 세션은 이 Lock을 획득할 수 없도록 한다.
    - 주의할점으로는 Transaction이 종료될 때 Lock이 자동으로 해제되지 않는다. 별도의 명령어로 해제를 수행해주거나 선점 시간이 끝나야 한다.

<br/>

## __Pessimistic Lock (비관적 락) 활용

 - StockRepository
    - Spring Data JPA에서는 @Lock 어노테이션을 통해 손 쉽게 비관적 락을 구현할 수 있다.
```Java
public interface StockRepository extends JpaRepository<Stock, Long> {

    @Lock(value = LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Stock s where s.id=:id")
    Stock findByIdWithPessimisticLock(Long id);
}
```

 - PessimisticLockStockService
```Java
@Service
public class PessimisticLockStockService {

    private StockRepository stockRepository;

    public PessimisticLockStockService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    @Transactional
    public Long decrease(Long id, Long quantity) {
        Stock stock = stockRepository.findByIdWithPessimisticLock(id);
        stock.decrease(quantity);
        stockRepository.saveAndFlush(stock);

        return stock.getQuantity();
    }
}
```

<br/>

## Optimistic Lock (낙관적 락) 활용

 - Stock 엔티티 클래스
    - @Version 필드를 만든다.
```Java
@Entity
public class Stock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productId;

    private Long quantity;

    @Version
    private Long version;

    ..
```

 - StockRepository
    - Spring Data JPA에서는 @Lock 어노테이션을 통해 손 쉽게 낙관적 락을 구현할 수 있다.
```Java
public interface StockRepository extends JpaRepository<Stock, Long> {

    ..

    @Lock(value = LockModeType.OPTIMISTIC)
    @Query("select s from Stock s where s.id = :id")
    Stock findByIdWithOptimisticLock(Long id);
}
```

 - OptimisticLockStockService
```Java
@Service
public class OptimisticLockStockService {

    private StockRepository stockRepository;

    public OptimisticLockStockService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    @Transactional
    public void decrease(Long id, Long quantity) {
        Stock stock = stockRepository.findByIdWithOptimisticLock(id);
        stock.decrease(quantity);

        stockRepository.saveAndFlush(stock);
    }
}
```

 - OptimisticLockStockFacade
    - 실패했을 때 재시도 하기 위한 파사드 클래스 생성
```Java
@Service
public class OptimisticLockStockFacade {

    private OptimisticLockStockService optimisticLockStockService;

    public OptimisticLockStockFacade(OptimisticLockStockService optimisticLockStockService) {
        this.optimisticLockStockService = optimisticLockStockService;
    }

    public void decrease(Long id, Long quantity) throws InterruptedException {
        while (true) {
            try {
                optimisticLockStockService.decrease(id, quantity);

                break;
            } catch (Exception e) {
                Thread.sleep(50);
            }
        }
    }
}
```

<br/>

## Named Lock 활용

 - LockRepository
```Java
public interface LockRepository extends JpaRepository<Stock, Long> {
    @Query(value = "select get_lock(:key, 3000)", nativeQuery = true)
    void getLock(String key);

    @Query(value = "select release_lock(:key)", nativeQuery = true)
    void releaseLock(String key);
}
```

 - NamedLockStockFacade
    - 실제 로직 전 후로 Lock 획득과 해제를 해주어야 한다.
```Java
@Component
public class NamedLockStockFacade {

    private LockRepository lockRepository;

    private StockService stockService;

    public NamedLockStockFacade(LockRepository lockRepository, StockService stockService) {
        this.lockRepository = lockRepository;
        this.stockService = stockService;
    }

    @Transactional
    public void decrease(Long id, Long quantity) {
        try {
            lockRepository.getLock(id.toString());
            stockService.decrease(id, quantity);
        } finally {
            lockRepository.releaseLock(id.toString());
        }
    }
}
```

 - StockService
    - 부모의 트랜잭션과 별도로 실행되어야 하기 때문에 Propagation 변경
```Java
@Service
public class StockService {

    ..

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void decrease(Long id, Long quantity) {
        Stock stock = stockRepository.findById(id).orElseThrow();

        stock.decrease(quantity);

        stockRepository.saveAndFlush(stock);
    }
}
```