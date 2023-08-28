# 테스트는 []다.

## 테스트는 문서다.

 - 프로덕션 기능을 설명하는 테스트 코드 문서
 - 다양한 테스트 케이스를 통해 프로덕션 코드를 이해하는 시각과 관점을 보완
 - 어느 한 사람이 과거에 경험했던 고민의 결과물을 팀 차원으로 승격시켜서, 모두의 자산으로 공유할 수 있다.

<br/>

## DisplayName을 섬세하게

테스트의 이름을 영문으로 하면 어떠한 테스트인지 파악하기 어려울 수 있다.  
JUnit 5에서는 @DisplayName 이라는 어노테이션을 통해 테스트의 이름을 지정할 수 있다.  

 - 테스트 메서드명
    - add 테스트
 - DisplayName을 적용
    - 음료 1개 추가 테스트
 - 명사의 나열보다 문장으로
    - ex) A이면 B이다.
    - "~테스트" 지양하기
    - 음료를 1개 추가할 수 있다.
 - 테스트 행위에 대한 결과까지 기술하기
    - 음료를 1개 추가하면 주문 목록에 담긴다.
 - 예시
    - 특정 시간 이전에 주문을 생성하면 실패한다.
    - 영업 시작 시간 이전에는 주문을 생성할 수 없다.
        - 도메인 용어를 사용하여 한층 추상화된 내용 담기
        - 메서드 자체의 관점보다 도메인 정책 관점으로
        - 테스트의 현상을 중점으로 기술하지 말 것

```Java
// Before
@Test
void add() {
    CafeKiosk cafeKiosk = new CafeKiosk();
    cafeKiosk.add(new Americano());

    ..
}

// JUnit 4
@Test
void 음료_1개_추가_테스트() {
    CafeKiosk cafeKiosk = new CafeKiosk();
    cafeKiosk.add(new Americano());

    ..
}

// JUnit 5
@Test
@DisplayName("음료 1개 추가 테스트")
void add() {
    CafeKiosk cafeKiosk = new CafeKiosk();
    cafeKiosk.add(new Americano());

    ..
}
```

<br/>

## BDD 스타일로 작성하기

 - TDD에서 파생된 개발 방법
 - 함수 단위의 테스트에 집중하기보다, 시나리오에 기반한 테스트 케이스 자체에 집중하여 테스트한다.
 - 개발자가 아닌 사람이 봐도 이해할 수 있을 정도의 추상화 수준(레벨)을 권장

<br/>

### Given / When / Then

어떤 환경에서 (Given)  
어떤 행동을 진행했을 때 (When)  
어떤 상태 변화가 일어난다 (Then)  
 - Given: 시나리오 진행에 필요한 모든 준비 과정 (객체, 값, 상태 등)
 - When: 시나리오 행동 진행
 - Then: 시나리오 진행에 대한 결과 명시, 검증
 - DisplayName에 명확하게 작성할 수 있다.

```Java
// CafeKioskTest
@Test
@DisplayName("주문 목록에 담긴 상품들의 총 금액을 계산할 수 있다.")
void calculateTotalPrice() {
    // Given: 테스트에 필요한 객체 세팅 및 상황을 만들어준다.
    CafeKiosk cafeKiosk = new CafeKiosk();
    Americano americano = new Americano();
    Latte latte = new Latte();

    cafeKiosk.add(americano);
    cafeKiosk.add(latte);

    // When: 어떠한 행동을 수행한다.
    int totalPrice = cafeKiosk.calculateTotalPrice();

    // Then: 행동에 대한 결과를 검증한다.
    assertThat(totalPrice).isEqualTo(8500);
}
```

<br/>

## 키워드 정리

 - @DisplayName - 도메인 정책, 용어를 사용한 명확한 문장
 - Given / When / Then - 주어진 환경, 행동, 상태 변화
 - TDD vs BDD
 - JUnit vs Spock
