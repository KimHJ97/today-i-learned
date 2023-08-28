# 단위 테스트

## 샘플 프로젝트

 - 초간단 카페 키오스크 시스템
    - 요구 사항
        - 주문 목록에 음료 추가/삭제 기능
        - 주문 목록 전체 지우기
        - 주문 목록 총 금액 계산하기
        - 주문 생성하기

## 프로젝트 만들기

 - Spring Initializr
    - 공식 사이트: https://start.spring.io/
```
Name: cafekiosk
Language: Java
Type: Gradle-Groovy
Group: sample
Artifact: cafekiosk
Package name: sample.cafekiosk
Java: 11
Packaing: Jar
Spring Boot: 2.7.15
Dependencies: Lombok, Spring Web, Spring Data JPA, H2 Database
```

<br/>

 - 음료 관련 클래스
    - Beverage 인터페이스
    - Americano, Latte 클래스
```Java
// Beverage
public interface Beverage {
    String getName();
    int getPrice();
}

// Americano
public class Americano implements Beverage {
    @Override
    public String getName() {
        return "아메리카노";
    }
    @Override
    public int getPrice() {
        return 4000;
    }
}

// Latte
public class Latte implements Beverage {
    @Override
    public String getName() {
        return "라떼";
    }
    @Override
    public int getPrice() {
        return 4500;
    }
}
```

 - 주문
    - Order 클래스
```Java
@Getter
@RequiredArgsConstructor
public class Order {

    private final LocalDateTime orderDateTime;
    private final List<Beverage> beverages;
}
```

 - 카페 키오스크
    - CafeKiosk 클래스
```Java
@Getter
public class CafeKiosk {

    private final List<Beverage> beverages = new ArrayList<>();

    public void add(Beverage beverage) {
        beverages.add(beverage);
    }

    public void remove(Beverage beverage) {
        beverages.remove(beverage);
    }

    public void clear() {
        beverages.clear();
    }

    public int calculateTotalPrice() {
        return beverages.stream()
                .mapToInt(beverage -> beverage.getPrice())
                .sum();
    }

    public Order createOrder() {
        return new Order(LocalDateTime.now(), beverages);
    }
}
```

<br/>

## 단위 테스트

단위 테스트(Unit Test)는 소프트웨어 개발에서 가장 작은 단위인 "단위(Unit)"를 개별적으로 테스트하는 접근 방법을 말합니다. 이 단위는 보통 함수, 메서드, 클래스 등의 작은 코드 조각이 될 수 있습니다. 단위 테스트는 소프트웨어의 각 기능이 예상대로 작동하는지를 확인하고 검증하기 위해 사용됩니다.  
 - 작은 코드 단위를 독립적으로 검증하는 테스트 (클래스 or 메서드 단위)
 - 검증 속도가 빠르고 안정적이다.

<br/>

### JUnit 5

JUnit 5는 자바 프로그래밍 언어를 위한 테스팅 프레임워크로서, 단위 테스트를 작성하고 실행하기 위한 도구입니다. JUnit은 Java 언어를 사용하는 개발자들이 소프트웨어의 품질을 향상시키고 결함을 검출하기 위해 널리 사용되는 인기 있는 프레임워크 중 하나입니다.  
 - 단위 테스트를 위한 테스트 프레임워크
 - XUnit - Kent Beck
    - SUnit(Smalltalk), JUnit(Java), NUnit(.NET) 등

<br/>

### AssertJ

AssertJ는 자바 언어를 위한 단언문 라이브러리로서, 테스트 코드 내에서 값의 검증을 더욱 가독성 있고 풍부한 API를 활용하여 수행할 수 있도록 도와주는 도구입니다. AssertJ를 사용하면 JUnit, TestNG 등의 테스팅 프레임워크와 함께 사용하여 단정문(assertions)을 작성하고 검증할 때 더 많은 표현력과 유연성을 얻을 수 있습니다.  
 - 테스트 코드 작성을 원활하게 돕는 테스트 라이브러리
 - 풍부한 API, 메서드 체이닝 지원

### 테스트 코드 작성

 - AmericanoTest
```Java
class AmericanoTest {

    @Test
    void getName() {
        Americano americano = new Americano();

        // JUnit 단언
        assertEquals(americano.getName(), "아메리카노");
        // AssertJ 단언
        assertThat(americano.getName()).isEqualTo("아메리카노");
    }

    @Test
    void getPrice() {
        Americano americano = new Americano();

        assertThat(americano.getPrice()).isEqualTo(4000);
    }
}
```
 - CafeKioskTest
```Java
class CafeKioskTest {

    @Test
    void add() {
        CafeKiosk cafeKiosk = new CafeKiosk();
        cafeKiosk.add(new Americano());

        assertThat(cafeKiosk.getBeverages().size()).isEqualTo(1);
        assertThat(cafeKiosk.getBeverages()).hasSize(1);
        assertThat(cafeKiosk.getBeverages().get(0)).isEqualTo("아메리카노");
    }

    @Test
    void remove() {
        CafeKiosk cafeKiosk = new CafeKiosk();
        Americano americano = new Americano();

        cafeKiosk.add(americano);
        assertThat(cafeKiosk.getBeverages()).hasSize(1);

        cafeKiosk.remove(americano);
        assertThat(cafeKiosk.getBeverages()).isEmpty();
    }

    @Test
    void clear() {
        CafeKiosk cafeKiosk = new CafeKiosk();
        Americano americano = new Americano();
        Latte latte = new Latte();

        cafeKiosk.add(americano);
        cafeKiosk.add(latte);
        assertThat(cafeKiosk.getBeverages()).hasSize(2);

        cafeKiosk.clear();
        assertThat(cafeKiosk.getBeverages()).isEmpty();
    }
}
```

<br/>

## 테스트 케이스 세분화하기

 - 요구사항 추가
    - 한 종류의 음료 여러 잔을 한 번에 담는 기능
 - 테스트 세분화하기
    - 해피 케이스: 요구 사항에 맞는 기능만 테스트
    - 예외 케이스: 아메리카노를 0잔으로 입력하면 어떻게 처리할 것인가, 숫자를 -1 음수로 입력하면 어떻게 처리할 것인가
    - 경계값 테스트: 범위(이상, 이하, 초과, 미만), 구간, 날짜 등

<br/>

 - CafeKiosk
```Java
@Getter
public class CafeKiosk {

    private final List<Beverage> beverages = new ArrayList<>();

    public void add(Beverage beverage) {
        beverages.add(beverage);
    }

    public void add(Beverage beverage, int count) {
        if(count <= 0) {
            throw new IllegalArgumentException("음료는 1잔 이상 주문하실 수 있습니다.");
        }

        for (int i = 0; i < count; i++) {
            beverages.add(beverage);
        }
    }

    ..
}
```
 - CafeKioskTest
    - 경계값 테스트를 진행한다. (해피테스트, 예외테스트)
```Java
class CafeKioskTest {
    @Test
    void addSeveralBeverages() {
        CafeKiosk cafeKiosk = new CafeKiosk();
        Americano americano = new Americano();

        cafeKiosk.add(americano, 2);

        assertThat(cafeKiosk.getBeverages().get(0)).isEqualTo(americano);
        assertThat(cafeKiosk.getBeverages().get(1)).isEqualTo(americano);
    }

    @Test
    void addZeroBeverages() {
        CafeKiosk cafeKiosk = new CafeKiosk();
        Americano americano = new Americano();

        cafeKiosk.add(americano, 2);

        assertThatThrownBy(() -> cafeKiosk.add(americano, 0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("음료는 1잔 이상 주문하실 수 있습니다.");
    }

    ..
}
```

<br/>

## 테스트하기 어려운 영역을 분리하기

구현 함수 내부에서 동적인 값을 생성하여 테스트를 수행할 때마다 값이 달라져서 테스트가 성공했다가 실패했다가 하는 경우가 있다.  
테스트하기 어려운 영역을 구분하고 분리하는 능력이 필요하다.  
외부로 분리할수록 테스트 가능한 코드는 많아진다.  
 - 요구사항 추가
    - 가게 운영 시간(10:00 ~ 22:00) 외에는 주문을 생성할 수 없다.

<br/>

 - CafeKiosk
    - 가게 오픈 시간, 가게 마감 시간 상수를 만든다.
    - createOrder() 메서드에서 영업 시간 검증을 진행한다.
```Java
@Getter
public class CafeKiosk {

    public static final LocalTime SHOP_OPEN_TIME = LocalTime.of(10, 0);
    public static final LocalTime SHOP_CLOSE_TIME = LocalTime.of(22, 0);
    ..

    public Order createOrder() {
        LocalDateTime currentDateTime = LocalDateTime.now();
        LocalTime currentTime = currentDateTime.toLocalTime();
        if(currentTime.isBefore(SHOP_OPEN_TIME) || currentTime.isAfter(SHOP_CLOSE_TIME)) {
            throw new IllegalArgumentException("주문 시간이 아닙니다. 관리자에게 문의하세요.");
        }

        return new Order(LocalDateTime.now(), beverages);
    }
}
```

 - CafeKioskTest
    - 해당 테스트는 매번 성공하는가? X
    - 가게 영업 시간 안에 테스트 수행시에만 테스트가 성공하고, 실제 시간이 영업 시간이 아닌 경우 테스트가 실패하게 된다. (깨진 테스트)
```Java
class CafeKioskTest {

    ..

    @Test
    void createOrder() {
        CafeKiosk cafeKiosk = new CafeKiosk();
        Americano americano = new Americano();

        cafeKiosk.add(americano);

        Order order = cafeKiosk.createOrder();
        assertThat(order.getBeverages()).hasSize(1);
        assertThat(order.getBeverages().get(0).getName()).isEqualTo("아메리카노");
    }
}
```

<br/>

### 문제점

CafeKiosk 클래스에서 createOrder()시 영업 시간에 대한 검증을 진행한다.  
해당 메서드 내부에서 LocalDateTime을 이용하여 현재 시간을 가져온다.  
해당 값을 실행할 때마다 변경되는 값이다.  
즉, 해당 값을 메서드 내부에서 생성하는 것이 아니라, 매개변수로 받는 방식을 이용하면 

 - CafeKiosk
    - createOrder() 안에 현재 시간을 구현할 때 정하는 것이 아니고, 외부에서 받도록 한다.
    - Production(운영) 환경에서는 LocalDateTime.now()로 현재 시간을 넣어주도록 하고, 테스트 환경에서는 LocalDateTime.of()로 특정 시간을 지정하여 테스트를 진행할 수 있다.
```Java
// Before
public Order createOrder() {
    LocalDateTime currentDateTime = LocalDateTime.now();
    LocalTime currentTime = currentDateTime.toLocalTime();
    if(currentTime.isBefore(SHOP_OPEN_TIME) || currentTime.isAfter(SHOP_CLOSE_TIME)) {
        throw new IllegalArgumentException("주문 시간이 아닙니다. 관리자에게 문의하세요.");
    }

    return new Order(LocalDateTime.now(), beverages);
}

// After
public Order createOrder(LocalDateTime currentDateTime) {
    LocalTime currentTime = currentDateTime.toLocalTime();
    if(currentTime.isBefore(SHOP_OPEN_TIME) || currentTime.isAfter(SHOP_CLOSE_TIME)) {
        throw new IllegalArgumentException("주문 시간이 아닙니다. 관리자에게 문의하세요.");
    }

    return new Order(LocalDateTime.now(), beverages);
}
```

 - CafeKioskTest
```Java
// Before
@Test
void createOrder() {
    CafeKiosk cafeKiosk = new CafeKiosk();
    Americano americano = new Americano();

    cafeKiosk.add(americano);

    Order order = cafeKiosk.createOrder();
    assertThat(order.getBeverages()).hasSize(1);
    assertThat(order.getBeverages().get(0).getName()).isEqualTo("아메리카노");
}

// After
@Test
void createOrderWithCurrentTime() {
    CafeKiosk cafeKiosk = new CafeKiosk();
    Americano americano = new Americano();

    cafeKiosk.add(americano);

    Order order = cafeKiosk.createOrder(LocalDateTime.of(2023, 8, 28, 10, 0));
    assertThat(order.getBeverages()).hasSize(1);
    assertThat(order.getBeverages().get(0).getName()).isEqualTo("아메리카노");
}
@Test
void createOrderOutsideOpenTime() {
    CafeKiosk cafeKiosk = new CafeKiosk();
    Americano americano = new Americano();

    cafeKiosk.add(americano);

    assertThatThrownBy(() -> cafeKiosk.createOrder(LocalDateTime.of(2023, 8, 28, 9, 59)))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("주문 시간이 아닙니다. 관리자에게 문의하세요.");
}
```

<br/>

### 테스트하기 어려운 영역

 - 관측할 때마다 다른 값에 의존하는 코드
    - 현재 날짜/시간, 랜덤 값, 전역 변수/함수, 사용자 입력 등
 - 외부 세계에 영향을 주는 코드
    - 표준 출력, 메시지 발송, 데이터베이스에 기록하기 등

<br/>

### 순수 함수(pure functions)

 - 같은 입력에는 항상 같은 결과
 - 외부 세상과 단절된 형태
 - 테스트하기 쉬운 코드

<br/>

## 키워드 정리

 - 단위 테스트
 - 수동 테스트, 자동화 테스트
 - Junit 5, AssertJ
 - 해피 케이스, 예외 케이스
 - 경계값 테스트
 - 테스트하기 쉬운/어려운 영역 (순수함수)
 - Lombok (사용 가이드)
    - @Data, @Setter, @AllArgsConstructor 지양
    - 양방향 연관 관계 시 @ToString 순환 참조 문제

