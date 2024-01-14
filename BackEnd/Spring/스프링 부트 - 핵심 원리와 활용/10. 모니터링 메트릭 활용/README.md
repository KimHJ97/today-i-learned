# 모니터링 메트릭 활용

## 메트릭 등록 - 예제 만들기

CPU 사용량, 메모리 사용량, 톰캣 쓰레드, DB 커넥션 풀과 같이 공통으로 사용되는 기술 메트릭은 이미 등록되어 있다. 이런 이미 등록된 메트릭을 사용해서 대시보드를 구성하고 모니터링만 하면 된다.  

여기서 더 나아가 비즈니스에 특화된 부분을 모니터링 하고 싶으면 직접 등록하고 확인해야 한다.  

 - `예제 메트릭 정보`
    - 주문수, 최소수, 재고 수량 같은 메트릭은 해당 비즈니스에 특화된 부분으로 각 비즈니스마다 구현이 다를 수 있다. 때문에, 비즈니스 메트릭은 직접 등록하고 확인해야 한다.
```
주문수, 취소수
 - 상품을 주문하면 주문수가 증가한다.
 - 상품을 취소해도 주문수는 유지한다. 대신에 취소수를 증가한다.

재고 수량
 - 상품을 주문하면 재고 수량이 감소한다.
 - 상품을 취소하면 재고 수량이 증가한다.
 - 재고 물량이 들어오면 재고 수량이 증가한다.

주문수, 취소수는 계속 증가하므로 카운터를 사용하자.
재고 수량은 증가하거나 감소하므로 게이지를 사용하자.
```

<br/>

 - `OrderService`
    - 주문, 취소, 재고 수량을 확인할 수 있는 주문 서비스 인터페이스이다.
```java
import java.util.concurrent.atomic.AtomicInteger;

public interface OrderService {
    void order();
    void cancel();
    AtomicInteger getStock();
}
```

<br/>

 - `OrderServiceV0`
    - new AtomicInteger(100) 초기값을 100으로 설정해둔다. 재고 수량이 100부터 시작한다고 가정한다. 
```java
@Slf4j
public class OrderServiceV0 implements OrderService {

    private AtomicInteger stock = new AtomicInteger(100);

    @Override
    public void order() {
        log.info("주문");
        stock.decrementAndGet();
    }

    @Override
    public void cancel() {
        log.info("취소");
        stock.incrementAndGet();
    }

    @Override
    public AtomicInteger getStock() {
        return stock;
    }
}
```

<br/>

 - `OrderConfigV0`
```java
@Configuration
public class OrderConfigV0 {

    @Bean
    OrderService orderService() {
        return new OrderServiceV0();
    }
}
```

<br/>

 - `OrderController`
    - 주문, 취소, 재고 수량을 확인하는 컨트롤러이다.
```java
@Slf4j
@RestController
public class OrderController {

    public final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/order")
    public String order() {
        log.info("order");
        orderService.order();
        return "order";
    }

    @GetMapping("/cancel")
    public String cancel() {
        log.info("cancel");
        orderService.cancel();
        return "cancel";
    }

    @GetMapping("/stock")
    public int stock() {
        log.info("stock");
        return orderService.getStock().get();
    }
}
```

<br/>

 - `ActuatorApplication`
    - @Import(OrderConfigV0.class) : OrderServiceV0 를 사용하는 설정이다.
    - @SpringBootApplication(scanBasePackages = "hello.controller") : 컴포넌트 스캔의 대상을 컨트롤러로 제한한다. 그렇지 않으면 이후에 추가할 OrderConfigVX 가 모두 스프링 빈으로 등록되는 문제가 발생한다.
```java
@Import(OrderConfigV0.class)
@SpringBootApplication(scanBasePackages = "hello.controller")
public class ActuatorApplication {
    public static void main(String[] args) {
        SpringApplication.run(ActuatorApplication.class, args);
    }
}
```

