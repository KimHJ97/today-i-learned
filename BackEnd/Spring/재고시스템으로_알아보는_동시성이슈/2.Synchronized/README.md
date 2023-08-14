# Synchronized 이용해보기

## 레이스 컨디션
레이스 컨디션(Race Condition)은 동시성 프로그래밍에서 발생하는 현상으로, 둘 이상의 스레드나 프로세스가 공유된 데이터나 리소스에 동시에 접근하려고 할 때 발생하는 문제를 말합니다.  
이 때, 최종 결과가 스레드나 프로세스 간의 실행 순서에 따라 달라질 수 있어 예측 불가능한 결과를 가져올 수 있습니다.  
 - 공유 데이터 접근: 여러 스레드나 프로세스가 같은 메모리 위치나 변수를 동시에 접근하려고 할 때 발생합니다.
 - 동시적인 연산: 여러 스레드나 프로세스가 같은 데이터를 동시에 수정하거나 조작할 때 발생합니다.

<br/>

## Synchronized

Java에서 synchronized는 동기화를 구현하기 위한 키워드입니다.  
동시에 여러 스레드가 공유 자원에 접근할 때 발생할 수 있는 레이스 컨디션과 같은 동시성 이슈를 해결하기 위해 사용됩니다.  
synchronized를 사용하면 한 스레드만이 특정 코드 블록 또는 메서드에 접근하여 실행할 수 있도록 제한할 수 있습니다.
 - synchronized의 사용은 동기화 오버헤드와 블로킹 가능성에 주의해야 합니다. 만약 큰 범위의 동기화가 필요하지 않다면 더 작은 범위로 동기화하는 것이 성능 개선에 도움이 될 수 있습니다.
 - 또한, Java 5부터는 java.util.concurrent 패키지에 있는 동시성 컬렉션과 같은 고급 동기화 메커니즘을 활용하는 것이 권장되는 경우도 있습니다.
 - 메서드 동기화 (Synchronized Method):
    - synchronized를 메서드 선언부에 정의하면, 해당 메서드는 하나의 쓰레드만 접근이 가능하게 된다.
    -  메서드에 synchronized 키워드를 붙이면 해당 메서드는 인스턴스 레벨에서 동기화됩니다. 이 경우, 메서드 내의 코드 블록 전체가 동기화되어 해당 인스턴스에 대해 한 번에 하나의 스레드만이 실행될 수 있습니다.
```Java
public synchronized void synchronizedMethod() {
    // 동기화가 필요한 코드
}
```

 - 블록 동기화 (Synchronized Block):
    - 특정 객체를 락으로 사용하여 블록을 동기화할 수도 있습니다. 이 경우에는 해당 블록 내의 코드만이 동기화되어 스레드 간에 안전하게 실행됩니다.
```Java
public void someMethod() {
    synchronized (lockObject) {
        // 동기화가 필요한 코드
    }
}
```

<br/>

## Synchronized 재고 시스템 적용하기

 - StockService
    - decrease 메서드에 synchronized 키워드 정의
```Java
@Service
public class StockService {

    ..

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public synchronized void decrease(Long id, Long quantity) {
        // Stock 조회
        Stock stock = stockRepository.findById(id).orElseThrow();

        // 재고 감소
        stock.decrease(quantity);

        // 갱신된 값을 저장
        stockRepository.saveAndFlush(stock);
    }
}
```

 - 결과
    - synchronized를 적용하더라도 동시성 이슈를 해결하지 못함
    - Spring @Transactional을 이용하면, 프록시 객체가 생성되어 내부에서 실제 메소드가 동작하게 된다.
    - 즉, 아래와 같이 동작하게 되는데 endTransaction()으로 트랜잭션이 종료되어 DB에 반영되기 전에 다른 쓰레드가 decrease 메소드를 호출하게 되어 동시성 이슈가 발생하게 된다.
    - __@Transactional 어노테이션을 제거하면 정상적으로 해결되긴 한다. 하지만, 분산 환경에서는 해당 키워드로 해결할 수 없다.__
```Java
public void decrease(Long id, Long quantity) {
    startTransaction();

    stockService.decrease(id, quantity);

    endTransaction();
}
```