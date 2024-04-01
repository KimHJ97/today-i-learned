# 컬렉션 조회 최적화

Order(주문) 기준으로 필드에 컬렉션이 OrderItem과 Item이 존재한다.  

 - `엔티티 정보`
```java
// Order
@Entity
@Table(name = "orders")
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order {

    @Id @GeneratedValue
    @Column(name = "order_id")
    private Long id;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems = new ArrayList<>();

    ..

}

// OrderItem
@Entity
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OrderItem {

    @Id @GeneratedValue
    @Column(name = "order_item_id")
    private Long id;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    @JsonIgnore
    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    ..
}
```
<br/>

## 1. 주문 조회 V1: 엔티티 직접 노출

 - orderItem , item 관계를 직접 초기화하면 Hibernate5Module 설정에 의해 엔티티를 JSON으로 생성한다.
 - 양방향 연관관계면 무한 루프에 걸리지 않게 한곳에 @JsonIgnore 를 추가해야 한다.
 - 엔티티를 직접 노출하므로 좋은 방법은 아니다.
```java
@RestController
@RequiredArgsConstructor
public class OrderApiController {

    private final OrderRepository orderRepository;
    private final OrderQueryRepository orderQueryRepository;

    /**
     * V1. 엔티티 직접 노출
     * - Hibernate5Module 모듈 등록, LAZY=null 처리
     * - 양방향 관계 문제 발생 -> @JsonIgnore
     */
    @GetMapping("/api/v1/orders")
    public List<Order> ordersV1() {
        List<Order> all = orderRepository.findAll();
        for (Order order : all) {
            order.getMember().getName(); //Lazy 강제 초기화
            order.getDelivery().getAddress(); //Lazy 강제 초기환
            List<OrderItem> orderItems = order.getOrderItems();
            orderItems.stream().forEach(o -> o.getItem().getName()); //Lazy 강제 초기화
        }
        return all;
    }

}
```
<br/>

## 2. 주문 조회 V2: 엔티티를 DTO로 변환

```java
@RestController
@RequiredArgsConstructor
public class OrderApiController {

    // ..

    @GetMapping("/api/v2/orders")
    public List<OrderDto> ordersV2() {
        List<Order> orders = orderRepository.findAll();
        List<OrderDto> result = orders.stream()
                .map(o -> new OrderDto(o))
                .collect(toList());

        return result;
    }

    @Data
    static class OrderDto {

        private Long orderId;
        private String name;
        private LocalDateTime orderDate; //주문시간
        private OrderStatus orderStatus;
        private Address address;
        private List<OrderItemDto> orderItems;

        public OrderDto(Order order) {
            orderId = order.getId();
            name = order.getMember().getName();
            orderDate = order.getOrderDate();
            orderStatus = order.getStatus();
            address = order.getDelivery().getAddress();
            orderItems = order.getOrderItems().stream()
                    .map(orderItem -> new OrderItemDto(orderItem))
                    .collect(toList());
        }
    }

    @Data
    static class OrderItemDto {

        private String itemName;//상품 명
        private int orderPrice; //주문 가격
        private int count;      //주문 수량

        public OrderItemDto(OrderItem orderItem) {
            itemName = orderItem.getItem().getName();
            orderPrice = orderItem.getOrderPrice();
            count = orderItem.getCount();
        }
    }

}
```
<br/>

## 3. 주문 조회 V3: 엔티티를 DTO로 변환 - 패치 조인 최적화

 - 패치 조인으로 SQL을 1번만 실행하도록 한다.
 - DB 상 distinct는 행의 모든 컬럼값이 동일할 경우에 중복을 제거해준다. 때문에, 1:N 관계로 N개의 행이 조회될 것이다.
 - JPA의 distinct 키워드가 있는 경우 SQL의 distinct 기능과 조회된 엔티티의 id가 동일한 경우 중복을 제거해준다.
 - 컬렉션 페치 조인을 사용하면 페이징이 불가능하다. 하이버네이트는 경고 로그를 남기면서 모든 데이터를 DB에서 읽어오고, 메모리에서 페이징 해버린다

```java
/* OrderRepository */
@Repository
public class OrderRepository {

    // ..

    public List<Order> findAllWithItem() {
        return em.createQuery(
                "select distinct o from Order o" +
                        " join fetch o.member m" +
                        " join fetch o.delivery d" +
                        " join fetch o.orderItems oi" +
                        " join fetch oi.item i", Order.class)
                .getResultList();
    }
}

/* OrderApiController */
@RestController
@RequiredArgsConstructor
public class OrderApiController {

    // ..

    @GetMapping("/api/v3/orders")
    public List<OrderDto> ordersV3() {
        List<Order> orders = orderRepository.findAllWithItem();
        List<OrderDto> result = orders.stream()
                .map(o -> new OrderDto(o))
                .collect(toList());

        return result;
    }

}
```
<br/>

## 4. 주문 조회 V3.1: 엔티티를 DTO로 변환 - 페이징과 한계 돌파

컬렉션을 패치 조인하면 페이징이 불가능하다.  
컬렉션을 패치 조인하면 일대다 조인이 발생하므로 데이터가 예측할 수 없이 증가한다. 일대다에서 일(1)을 기준으로 페이징 하는 것이 목적이지만, 다(N)를 기준으로 행이 생성된다.  

<br/>

먼저, XxxToOne(OneToOne, ManyToOne) 관계를 모두 패치조인한다. XxxToOne 관계는 행 수를 증가시키지 않는다.  
이후, 컬렉션은 지연 로딩으로 조회한다. 이때, 지연 로딩 성능 최적화를 위해 hibernate.default_batch_fetch_size, @BatchSize를 적용한다.  
 - hibernate.default_batch_fetch_size: 글로벌 설정
 - @BatchSize: 개별 최적화
    - 쿼리 호출 수가 1+N에서 1+1로 최적화된다.
    - 조인보다 DB 데이터 전송량이 최적화 된다.
    - 패치 조인 방식과 비교해서 쿼리 호출 수가 약간 증가하지만, DB 데이터 전송량이 감소한다.
    - 컬렉션 패치 조인은 페이징이 불가능하지만 이 방법은 페이징이 가능하다.
```java
/* OrderRepository */
@Repository
public class OrderRepository {

    // ..

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

/* OrderApiController */
@RestController
@RequiredArgsConstructor
public class OrderApiController {

    // ..

    /**
     * V3.1 엔티티를 조회해서 DTO로 변환 페이징 고려
     * - ToOne 관계만 우선 모두 페치 조인으로 최적화
     * - 컬렉션 관계는 hibernate.default_batch_fetch_size, @BatchSize로 최적화
     */
    @GetMapping("/api/v3.1/orders")
    public List<OrderDto> ordersV3_page(@RequestParam(value = "offset", defaultValue = "0") int offset,
                                        @RequestParam(value = "limit", defaultValue = "100") int limit) {

        List<Order> orders = orderRepository.findAllWithMemberDelivery(offset, limit);
        List<OrderDto> result = orders.stream()
                .map(o -> new OrderDto(o))
                .collect(toList());

        return result;
    }
}
```
<br/>

 - `application.yml`
```yml
spring:
  jpa:
    properties:
      hibernate:
        default_batch_fetch_size: 1000
```
<br/>

### 결론

ToOne 관계는 페치 조인해도 페이징에 영향을 주지 않는다. 따라서 ToOne 관계는 페치조인으로 쿼리 수를 줄이고 해결하고, 나머지는 hibernate.default_batch_fetch_size 로 최적화 한다.  

 - batch_size만큼 in 절을 호출하게 된다.

<br/>

### 스프링 부트 3.1(Hibernate 6.2+)

스프링 부트 3.1부터는 Hibernate 6.2+ 버전을 사용한다.  
Hibernate 6.2부터는 WHERE 절에 in 대신에 array_contains를 사용한다.  

```sql
-- in
WHERE item.item_id in (?, ?, ?)

-- array_contains
WHERE array_contains(?, item.item_id)
```
<br/>

SQL을 실행할 떄 데이터베이스는 SQL 구문을 이해하기 위해 SQL을 파싱하고 분석하는 등 여러가지 복잡한 일을 처리한다. 그래서, 성능을 최적화하기 위해 이미 실행된 SQL 구문은 파싱된 결과를 내부에 캐싱하고 있다.  
여기서 말하는 캐싱은 SQL 구문을 캐싱하는 것으로 SQL의 실행 결과 자체를 캐싱하는 것은 아니다. 즉, SQL 구문에 바인딩 되는 '?' 데이터가 변경되어도 캐싱된 SQL 결과를 그대로 사용할 수 있다.  

하지만, WHERE 절에 in을 사용하면 SQL 구문 자체가 변경되어 캐싱을 사용할 수 없다.  

```sql
WHERE item.item_id IN(?)
WHERE item.item_id IN(?, ?)
WHERE item.item_id IN(?, ?, ?)
```
<br/>

array_contains를 사용하면 이러한 문제를 해결할 수 있다.  
array_contains 문법은 WHERE IN 을 사용했을 떄와 결과적으로 동일하다.  
array_contains는 왼쪽에 배열을 넣는데, 배열에 들어있는 숫자가 오른쪽에 있다면 참이 된다.  

```sql
SELECT col1, col2, ..
FROM table_name
WHERE array_contains([1, 2, 3], item.item_id)

SELECT col1, col2, ..
FROM table_name
WHERE array_contains(?, item.item_id)
```
<br/>

## 5. 주문 조회 V4: JPA에서 DTO 직접 조회

 - `OrderQueryRepository`
    - findOrders(): Order와 XxxToOne 관계의 테이블 정보를 조회한다.
    - findOrderItems(): Order와 XxxToMany 관계의 테이블 정보를 조회한다. Order를 조회하고, 순회하면서 해당 정보를 조회한다.
    - 1 + N 번의 쿼리가 발생한다.
```java
@Repository
@RequiredArgsConstructor
public class OrderQueryRepository {

    private final EntityManager em;

    /**
     * 컬렉션은 별도로 조회
     * Query: 루트 1번, 컬렉션 N 번
     * 단건 조회에서 많이 사용하는 방식
     */
    public List<OrderQueryDto> findOrderQueryDtos() {
        //루트 조회(toOne 코드를 모두 한번에 조회)
        List<OrderQueryDto> result = findOrders();

        //루프를 돌면서 컬렉션 추가(추가 쿼리 실행)
        result.forEach(o -> {
            List<OrderItemQueryDto> orderItems = findOrderItems(o.getOrderId());
            o.setOrderItems(orderItems);
        });
        return result;
    }

    /**
     * 1:N 관계(컬렉션)를 제외한 나머지를 한번에 조회
     */
    private List<OrderQueryDto> findOrders() {
        return em.createQuery(
                "select new jpabook.jpashop.repository.order.query.OrderQueryDto(o.id, m.name, o.orderDate, o.status, d.address)" +
                        " from Order o" +
                        " join o.member m" +
                        " join o.delivery d", OrderQueryDto.class)
                .getResultList();
    }

    /**
     * 1:N 관계인 orderItems 조회
     */
    private List<OrderItemQueryDto> findOrderItems(Long orderId) {
        return em.createQuery(
                "select new jpabook.jpashop.repository.order.query.OrderItemQueryDto(oi.order.id, i.name, oi.orderPrice, oi.count)" +
                        " from OrderItem oi" +
                        " join oi.item i" +
                        " where oi.order.id = : orderId", OrderItemQueryDto.class)
                .setParameter("orderId", orderId)
                .getResultList();
    }

}
```
<br/>

 - `OrderApiController`
```java
@RestController
@RequiredArgsConstructor
public class OrderApiController {

    // ..

    @GetMapping("/api/v4/orders")
    public List<OrderQueryDto> ordersV4() {
        return orderQueryRepository.findOrderQueryDtos();
    }

}
```
<br/>

## 6. 주문 조회 V5: JPA에서 DTO 직접 조회 - 컬렉션 조회 최적화

 - `OrderQueryRepository`
    - findOrders(): Order와 XxxToOne 관계의 테이블 정보를 조회한다.
    - toOrderIds(): 조회된 Order 정보를 순회하여 Order의 id를 가진 List를 만든다.
    - findOrderItemMap(): OrderItem을 WHERE IN 절을 이용하여 Order id에 해당하는 OrderItem 정보를 1번의 쿼리로 조회한다.
    - XxxToOne 관계들을 먼저 조회하고, 여기서 얻은 식별자 orderId로 XxxToMany 관계인 OrderItem을 한 꺼번에 조회한다.
```java
@Repository
@RequiredArgsConstructor
public class OrderQueryRepository {

    /**
     * 최적화
     * Query: 루트 1번, 컬렉션 1번
     * 데이터를 한꺼번에 처리할 때 많이 사용하는 방식
     *
     */
    public List<OrderQueryDto> findAllByDto_optimization() {

        //루트 조회(toOne 코드를 모두 한번에 조회)
        List<OrderQueryDto> result = findOrders();

        //orderItem 컬렉션을 MAP 한방에 조회
        Map<Long, List<OrderItemQueryDto>> orderItemMap = findOrderItemMap(toOrderIds(result));

        //루프를 돌면서 컬렉션 추가(추가 쿼리 실행X)
        result.forEach(o -> o.setOrderItems(orderItemMap.get(o.getOrderId())));

        return result;
    }

    private List<Long> toOrderIds(List<OrderQueryDto> result) {
        return result.stream()
                .map(o -> o.getOrderId())
                .collect(Collectors.toList());
    }

    private Map<Long, List<OrderItemQueryDto>> findOrderItemMap(List<Long> orderIds) {
        List<OrderItemQueryDto> orderItems = em.createQuery(
                "select new jpabook.jpashop.repository.order.query.OrderItemQueryDto(oi.order.id, i.name, oi.orderPrice, oi.count)" +
                        " from OrderItem oi" +
                        " join oi.item i" +
                        " where oi.order.id in :orderIds", OrderItemQueryDto.class)
                .setParameter("orderIds", orderIds)
                .getResultList();

        return orderItems.stream()
                .collect(Collectors.groupingBy(OrderItemQueryDto::getOrderId));
    }

}
```
<br/>

 - `OrderApiController`
```java
@RestController
@RequiredArgsConstructor
public class OrderApiController {

    // ..

    @GetMapping("/api/v5/orders")
    public List<OrderQueryDto> ordersV5() {
        return orderQueryRepository.findAllByDto_optimization();
    }

}
```
<br/>

## 7. 주문 조회 V6: JPA에서 DTO로 직접 조회 - 플랫 데이터 최적화

 - `OrderQueryRepository`
    - findAllByDto_flat(): Order와 OrderItem을 조인해서 조회한다. 1:N 관계로 N개의 행이 조회될 것이다.
```java
@Repository
@RequiredArgsConstructor
public class OrderQueryRepository {

    // ..

    public List<OrderFlatDto> findAllByDto_flat() {
        return em.createQuery(
                "select new jpabook.jpashop.repository.order.query.OrderFlatDto(o.id, m.name, o.orderDate, o.status, d.address, i.name, oi.orderPrice, oi.count)" +
                        " from Order o" +
                        " join o.member m" +
                        " join o.delivery d" +
                        " join o.orderItems oi" +
                        " join oi.item i", OrderFlatDto.class)
                .getResultList();
    }
}
```
<br/>

 - `OrderApiController`
    - 중복 데이터를 가진 List를 stream으로 순회하여 중복을 제거한 List를 만든다.
```java
@RestController
@RequiredArgsConstructor
public class OrderApiController {

    // ..

    @GetMapping("/api/v6/orders")
    public List<OrderQueryDto> ordersV6() {
        List<OrderFlatDto> flats = orderQueryRepository.findAllByDto_flat();

        return flats.stream()
                .collect(groupingBy(o -> new OrderQueryDto(o.getOrderId(), o.getName(), o.getOrderDate(), o.getOrderStatus(), o.getAddress()),
                        mapping(o -> new OrderItemQueryDto(o.getOrderId(), o.getItemName(), o.getOrderPrice(), o.getCount()), toList())
                )).entrySet().stream()
                .map(e -> new OrderQueryDto(e.getKey().getOrderId(), e.getKey().getName(), e.getKey().getOrderDate(), e.getKey().getOrderStatus(), e.getKey().getAddress(), e.getValue()))
                .collect(toList());
    }

}
```

