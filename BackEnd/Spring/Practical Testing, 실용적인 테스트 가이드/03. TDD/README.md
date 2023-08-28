# TDD: Test Driven Development

TDD는 "Test-Driven Development"의 약어로, 소프트웨어 개발 방법론 중 하나입니다. TDD는 개발자들이 코드를 작성하기 전에 테스트를 작성하고 이를 기반으로 코드를 개발하는 접근 방식입니다.  
 - 프로덕션 코드보다 테스트 코드를 먼저 작성하여 테스트가 구현 과정을 주도하도록 하는 방법론
    - RED: 실패하는 테스트 작성
        - 구현부가 없이 테스트를 먼저 작성하기 때문에 실패한다.
    - GREEN: 테스트 통과 최소한의 코딩
        - 빠른 시간 내에 테스트를 통과하도록 구현부를 작성한다.
    - REFACTOR: 구현 코드 개선 테스트 통과 유지
        - 테스트 통과를 유지하면서 구현 코드를 개선한다.

<br/>

## 예제 코드

CafeKiosk 클래스의 calculateTotalPrice()를 TDD로 구현하기  

 - RED: 실패하는 테스트 작성
    - CafeKiosk에 calculateTotalPrice() 메서드가 없으면 컴파일 에러가 발생하기 때문에, 컴파일이 가능하도록 기본 메서드를 생성해준다.
```Java
// CafeKioskTest
@Test
void calculateTotalPrice() {
    CafeKiosk cafeKiosk = new CafeKiosk();
    Americano americano = new Americano();
    Latte latte = new Latte();

    cafeKiosk.add(americano);
    cafeKiosk.add(latte);

    int totalPrice = cafeKiosk.calculateTotalPrice();

    assertThat(totalPrice).isEqualTo(8500);
}

// CafeKiosk
public int calculateTotalPrice() {
    return 0;
}
```

 - GREEN: 빠른 시간 내에 테스트를 통과하도록 구현부를 작성한다.
```Java
// CafeKiosk
public int calculateTotalPrice() {
    return 8500;
}
```

 - REFACTOR: 테스트 통과를 유지하면서 구현 코드를 개선한다.
    - 실제 장바구니에 담긴 상품들에 총합 금액을 계산하도록 한다.
    - 구현부가 변경이 됐지만, 테스트가 여전히 통과하는지 테스트를 실행해주어야 한다.
```Java
public int calculateTotalPrice() {
    return beverages.stream()
            .mapToInt(beverage -> beverage.getPrice())
            .sum();
}
```

<br/>

## TDD 핵심 가치

 - 신뢰성 있는 코드
    - TDD는 테스트를 먼저 작성하고 이를 통과하는 코드를 작성함으로써 개발한 코드의 신뢰성을 높입니다.
    - 각 기능이나 모듈에 대한 테스트가 있기 때문에 코드 변경 시 예상치 못한 버그가 발생할 가능성을 줄여줍니다.
 - 문서화 및 설계 도움
    - TDD를 통해 작성한 테스트 코드는 코드의 사용법 및 기능을 문서화하는 역할을 합니다.
    - 또한 테스트를 작성하는 과정에서 코드의 인터페이스와 동작을 신중하게 고려하게 되므로 코드 설계 단계에서도 도움이 됩니다.
 - 예측 가능한 개발 프로세스
    - TDD는 작은 단위의 테스트와 개발 사이클을 반복하면서 기능을 점진적으로 개발하므로 개발 프로세스가 예측 가능해집니다.
    - 또한 각 기능마다 작은 단위의 개발 사이클을 가지므로 전체 개발 과정을 분해하여 관리하기 쉬워집니다.
 - 자신감 있는 리팩토링
    - TDD는 테스트를 통과하는 한계 내에서 코드를 자주 개선하고 리팩토링할 수 있는 자유를 줍니다.
    - 이로 인해 코드의 구조와 품질을 개선할 수 있고, 리팩토링 과정에서 버그가 발생할 가능성이 줄어듭니다.
 - 빠른 피드백 루프
    - 작은 단위의 테스트와 개발 사이클을 반복하므로 코드 변경에 대한 피드백을 빠르게 얻을 수 있습니다.
    - 이는 버그를 조기에 발견하고 수정할 수 있게 해줍니다.

<br/>

## 기존 구현 비교

 - 선 기능 구현, 후 테스트 작성
    - 테스트 자체의 누락 가능성
    - 특정 테스트 케이스만 검증할 가능성 (해피 케이스)
    - 잘못된 구현을 다소 늦게 발견할 가능성
 - 선 테스트 작성, 후 기능 구현
    - 복잡도가 낮은, 테스트 가능한 코드로 구현할 수 있게 한다. (유연하며 유지보수가 쉬운)
    - 쉽게 발견하기 어려운 엣지(Edge) 케이스를 놓치지 않게 해준다.
    - 구현에 대한 빠른 피드백을 받을 수 있다.
    - 과감한 리팩토링이 가능해진다.
 - TDD: 관점의 변화
    - 테스트는 구현부 검증을 위한 보조 수단
    - 테스트와 상호 작용하며 발전하는 구현부
    - 클라이언트 관점에서의 피드백을 주는 Test Driven

<br/>

## 키워드 정리

 - TDD
 - 레드-그린-리팩토링
 - 애자일(Agile) 방법론 vs 폭포수 방법론
 - 익스트림 프로그래밍(XP, eXtreme Programming)
 - 스크럼(Scrum), 칸반(Kanban)

