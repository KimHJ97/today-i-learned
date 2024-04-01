# 지연 로딩과 조회 성능 최적화

## 1. 간단한 주문 조회 V1: 엔티티를 직접 노출

Member와 Order는 서로 양방향 매핑을 하였다.  
즉, Member 안에는 Order가 있고, Order 안에는 Member가 있다.  
이러한 경우 엔티티를 그대로 반환하면 Jackson 라이브러리가 해당 객체를 사용해 JSON을 만들면서 무한 루프가 발생하게 된다.  

 - `OrderSimpleApiController`
    - 양방향 연관 관계인 엔티티를 직접 반환하면 무한 루프가 발생한다.
    - 해당 문제를 해결하기 위해서는 양방향 필드들을 @JsonIgnore로 무시해주어야 한다.
    - LAZY 로딩은 프록시 객체가 들어있다. 엔티티 객체를 반환할 때는 프록시 객체가 JSON으로 변환된다. Hibernate5Module 의존성을 추가하면, 지연로딩의 엔티티 객체에 내용을 추출하여 JSON 형태로 반환해준다.
```java
/**
 *
 * xToOne(ManyToOne, OneToOne) 관계 최적화
 * Order
 * Order -> Member
 * Order -> Delivery
 *
 */
@RestController
@RequiredArgsConstructor
public class OrderSimpleApiController {

    private final OrderRepository orderRepository;
    private final OrderSimpleQueryRepository orderSimpleQueryRepository;

    /**
     * V1. 엔티티 직접 노출
     * - Hibernate5Module 모듈 등록, LAZY=null 처리
     * - 양방향 관계 문제 발생 -> @JsonIgnore
     */
    @GetMapping("/api/v1/simple-orders")
    public List<Order> ordersV1() {
        List<Order> all = orderRepository.findAllByString(new OrderSearch());
        for (Order order : all) {
            order.getMember().getName(); //Lazy 강제 초기화
            order.getDelivery().getAddress(); //Lazy 강제 초기화
        }
        return all;
    }
}

/* JpashopApplication */
// Hibernate5Module을 스프링 빈으로 등록한다.
@SpringBootApplication
public class JpashopApplication {

	public static void main(String[] args) {
		SpringApplication.run(JpashopApplication.class, args);
	}

	@Bean
	Hibernate5Module hibernate5Module() {
		Hibernate5Module hibernate5Module = new Hibernate5Module();
		//강제 지연 로딩 설정
		//hibernate5Module.configure(Hibernate5Module.Feature.FORCE_LAZY_LOADING, true);
		return hibernate5Module;
	}
}
```
<br/>

## 2. 간단한 주문 조회 V2: 엔티티를 DTO로 변환

 - `OrderSimpleApiController`
    - 엔티티를 조회하고, 해당 엔티티를 순회하여 DTO로 변환해서 반환한다.
    - API 스팩에 필요한 필드만을 반환할 수 있다.
    - 하지만, LAZY 로딩으로 처음 조회(1)시와 연관된 행의 수(N) 만큼의 SQL이 수행된다.
```java
@RestController
@RequiredArgsConstructor
public class OrderSimpleApiController {

    ..

    /**
     * V2. 엔티티를 조회해서 DTO로 변환(fetch join 사용X)
     * - 단점: 지연로딩으로 쿼리 N번 호출
     */
    @GetMapping("/api/v2/simple-orders")
    public List<SimpleOrderDto> ordersV2() {
        List<SimpleOrderDto> result = orderRepository.findAll().stream()
                .map(o -> new SimpleOrderDto(o))
                .collect(toList());

        return result;
    }

    @Data
    static class SimpleOrderDto {

        private Long orderId;
        private String name;
        private LocalDateTime orderDate; //주문시간
        private OrderStatus orderStatus;
        private Address address;

        public SimpleOrderDto(Order order) {
            orderId = order.getId();
            name = order.getMember().getName();
            orderDate = order.getOrderDate();
            orderStatus = order.getStatus();
            address = order.getDelivery().getAddress();
        }
    }
}
```
<br/>

## 3. 간단한 주문 조회 V3: 엔티티를 DTO로 변환 - 패치 조인 최적화

 - `OrderSimpleApiController`
    - 패치 조인을 적용한 메서드를 호출한다.
    - OrderRepository: 엔티티를 패치 조인(fetch join)을 사용해서 쿼리 1번에 조회한다.
```java
@RestController
@RequiredArgsConstructor
public class OrderSimpleApiController {

    ..

    /**
     * V3. 엔티티를 조회해서 DTO로 변환(fetch join 사용O)
     * - fetch join으로 쿼리 1번 호출
     * 참고: fetch join에 대한 자세한 내용은 JPA 기본편 참고(정말 중요함)
     */
    @GetMapping("/api/v3/simple-orders")
    public List<SimpleOrderDto> ordersV3() {
        List<Order> orders = orderRepository.findAllWithMemberDelivery();
        List<SimpleOrderDto> result = orders.stream()
                .map(o -> new SimpleOrderDto(o))
                .collect(toList());
        return result;
    }

}

/* OrderRepository */
@Repository
public class OrderRepository {

    ..

    public List<Order> findAllWithMemberDelivery(int offset, int limit) {
        return em.createQuery(
                "select o from Order o" +
                        " join fetch o.member m" +
                        " join fetch o.delivery d", Order.class)
                .setFirstResult(offset)
                .setMaxResults(limit)
                .getResultList();
    }
}
```
<br/>

## 4. 간단하 주문 조회: JPA에서 DTO로 바로 조회

SELECT 절에서 원하는 필드만을 직접 선택하여 애플리케이션 네트워크 용량을 최적화한다. (생각보다 미비하다.)  
해당 메서드의 재사용성은 떨어진다. API 스팩에 맞춘 코드가 레포지토리에 들어간다는 단점이 있다.  

 - `OrderSimpleApiController`
    - 기존에는 모든 필드를 가진 엔티티를 조회하고, 엔티티를 순회하며 DTO로 변환해주는 과정을 거친다. JPA에서 DTO를 바로 조회할 수 있다.
    - OrderSimpleQueryRepository: JPQL 수행시 조회할 컬럼을 정의하여 해당 필드만을 가진 DTO로 변환하여 반환한다.
```java
@RestController
@RequiredArgsConstructor
public class OrderSimpleApiController {

    ..

    @GetMapping("/api/v4/simple-orders")
    public List<OrderSimpleQueryDto> ordersV4() {
        return orderSimpleQueryRepository.findOrderDtos();
    }

}

/* OrderSimpleQueryRepository */
@Repository
@RequiredArgsConstructor
public class OrderSimpleQueryRepository {

    private final EntityManager em;

    public List<OrderSimpleQueryDto> findOrderDtos() {
        return em.createQuery(
                "select new jpabook.jpashop.repository.order.simplequery.OrderSimpleQueryDto(o.id, m.name, o.orderDate, o.status, d.address)" +
                        " from Order o" +
                        " join o.member m" +
                        " join o.delivery d", OrderSimpleQueryDto.class)
                .getResultList();
    }
}

/* jpabook.jpashop.repository.order.simplequery.OrderSimpleQueryDto */
@Data
public class OrderSimpleQueryDto {

    private Long orderId;
    private String name;
    private LocalDateTime orderDate; //주문시간
    private OrderStatus orderStatus;
    private Address address;

    public OrderSimpleQueryDto(Long orderId, String name, LocalDateTime orderDate, OrderStatus orderStatus, Address address) {
        this.orderId = orderId;
        this.name = name;
        this.orderDate = orderDate;
        this.orderStatus = orderStatus;
        this.address = address;
    }
}
```
<br/>

## 정리

엔티티를 DTO로 변환하거나, DTO로 바로 조회하는 두가지 방법은 각각 장단점이 있다. 둘중 상황에 따라서 더 나은 방법을 선택하면 된다. 엔티티로 조회하면 리포지토리 재사용성도 좋고, 개발도 단순해진다.  

 - 쿼리 방식 선택 권장 순서
    - 1. 우선 엔티티를 DTO로 변환하는 방법을 선택한다.
    - 2. 필요하면 페치 조인으로 성능을 최적화 한다. 대부분의 성능 이슈가 해결된다.
    - 3. 그래도 안되면 DTO로 직접 조회하는 방법을 사용한다.
    - 4. 최후의 방법은 JPA가 제공하는 네이티브 SQL이나 스프링 JDBC Template을 사용해서 SQL을 직접 사용한다.


