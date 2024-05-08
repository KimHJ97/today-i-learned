# 자바 12부터 자바 17까지

 - 자바 11 (2018.09) LTS
 - 자바 12 (2019.03)
 - 자바 13 (2019.09)
 - 자바 14 (2020.03)
 - 자바 15 (2020.09)
 - 자바 16 (2021.03)
 - 자바 17 (2021.09) LTS

<br/>

## preview feature / experimental / incubating

 - __experimental__
    - JVM 레벨의 기능 초기 버전 (ZGC)
    - 실험적이기 떄문에 위험하거나 불완전하다.
    - 호환성도 지켜지기 매우 어렵다. (25% 정도의 완성도)
    - experimental 기능 사용을 원한다면, 전용 플래그 사용
 - __incubating__
    - 모듈 형태로 배포되는 실험용 API
    - 모듈과 패키지 앞에 jdk.incubator가 붙는다.
    - 호환성이 지켜지지 않을 수 있고, 정식 모듈 채택시 jdk.incubator가 사라진다.
    - incubating 기능 사용을 원한다면, JPMS 의존성 설정이 필요하다.
 - __preview feature__
    - 자바 언어 혹은 JVM과 관련된 새로운 기능
    - 완전히 구현되었지만, 피드백을 받기 위한 목적 (95% 완성도)
    - 호환되지 않을 수 있어, 프로덕션 사용은 비권장
    - '--enable-preview' 옵션 적용시 사용 가능
    - preview feature가 정식 기능으로 포함되는 기간은 보통 두 단계 버전이다. (1년)
        - ex) Text Block은 자바 13에서 미리보기 기능으로 출시 후 자바 15 정식 기능

<br/>

## Text Block

자바 15에서 정식으로 등장한 기능으로 여러 줄에 걸친 문자열을 만들기 위한 새로운 자바 문법이다.  

 - 시작하는 """ 다음에는 문자가 들어올 수 없다.
 - 문자열 끝에 공백을 만들면 사라진다.
    - 만약, 공백을 만들고 싶다면 replace를 이용할 수 있다.
    - 그 외에도 octal escape sequence와 새로운 이스케이프 문자를 사용할 수 있다.
 - 한 줄로된 긴 문자열을 TextBlock으로 사용하고 싶은 경우 새로운 이스케이프 문자를 사용하면 개행 문자가 사라진다.
```java
// JDK 15 이전
String str1 = "A\nBC\nDEF";
String str2 = "A\n" +
            "BC\n" +
            "DEF";

// JDK 15
String str3 = """
            A
            BC
            DEF
            """;

// 문자열 끝에 공백 만들기
String str4 = """
A$$
BC$
DEF
""".replace('$', ' ');

String str5 = """
A\040\040\040
BC\040\040
DEF
""";

// \s 자체가 하나의 공백이다.
String str6 = """
A  \s
BC \s
DEF
""";

// 한 줄로된 긴 문자열 TextBlock
// \ 를 사용하면 개행 문자가 없는 것으로 간주된다.
String str7 = """
A  \
BC \
DEF
""";
```
<br/>

## switch expression

switch expression은 기존에 statement 였던 switch 문을 expression으로 사용할 수 있게 강화된 기능이다.  
 - if/else는 statement라서 하나의 값으로 표현하려 하면 에러가 발생한다.
 - expression은 어떠한 결과값이 정해지는 문장이다. 3항 연산자는 expression 으로 결과적으로 하나의 결과값이 나와 대입이 가능하다.
 - 자바 12에서 preview feature로 출시되었고, 자바 14에서 정식 기능으로 출시되었다.

<br/>

 - __기존의 switch statement__
    - statement로 값을 반환할 수 없다.
    - 'case 값:' 형식을 사용한다. 이를 colon case label이라 부른다.
    - 한 분기가 끝나면 beak;를 반드시 사용해야 한다.
```java
// 조건에 따라 grade에 값을 할당하고 그 결과를 switch 밖에서 반환한다.
private String calculateTestGrade(int score) {
    String grade = "";

    switch (score) {
        case 5:
            grade = "A";
            break;
        case 4:
        case 3:
            grade = "B";
            break;
        case 2:
        case 1:
            grade = "C";
            break;
        default:
            grade = "F";
    }

    return grade;
}
```
<br/>

 - __개선된 switch expression__
    - expression으로 개선되었기 때문에 switch 문 자체를 반환할 수 있다.
    - switch 자체가 expression으로 끝에 세미콜론(;)을 붙여준다.
    - 반환하고 싶은 값을 변수에 할당하고, yield를 통해 반환할 값을 지정한다.
    - 여러 라벨을 한 번에 처리하기 위해 ','를 사용할 수 있다.
```java
private String calculateTestGrade(int score) {
    return switch (score) {
        case 5:
            yield "A";
        case 4, 3:
            yield "B";
        case 2, 1:
            yield "C";
        default:
            yield "F";
    };
}
```
<br/>

 - __switch expression 에서만 쓸 수 있는 새로운 라벨__
    - arrow case label을 사용하면 yield를 생략할 수 있다.
```java
private String calculateTestGrade(int score) {
    return switch (score) {
        case 5 -> "A";
        case 4, 3 -> "B";
        case 2, 1 -> "C";
        default -> "F";
    };
}

// arrow case label에 중괄호를 사용할 수 있다.
// 이때는 yield를 정의해주어야 한다.
private String calculateTestGrade(int score) {
    return switch (score) {
        case 5 -> {
            // 추가 로직
            System.out.println("A!!");
            yield "A";
        }
        case 4, 3 -> {
            yield "B";
        }
        case 2, 1 -> "C";
        default -> "F";
    };
}

// 예외를 던지는 것은 가능하다.
private String calculateTestGrade(int score) {
    return switch (score) {
        case 5 -> "A";
        case 4, 3 -> throw new IllegalArgumentException();
        case 2, 1 -> "C";
        default -> "F";
    };
}
```
<br/>

 - __ENUM과 함께 사용__
    - ENUM은 컴파일 시점에 어떤 타입이 정의되어 있는지 정해진다.
    - ENUM 사용시 default를 사용하지 않아도 된다. 컴파일 시점에 정해지기 때문이다.
    - 다만, 매개변수에 NULL이 들어오면 NULL Point Exception이 발생할 수 있다.
```java
enum Color {RED, YELLOW, GREEN}

public String getSignal(Color color) {
    return switch(color) {
        case RED -> "멈추세요.";
        case YELLOW -> "곧 빨간색으로 바뀝니다.";
        case GREEN -> "지나가세요.";
    }
}
```

### switch expression 정리

colon case label과 yield를 함께 사용하거나, arrow case label로 yield를 생략하여 사용할 수 있다.  
단, arrow case label에서 중괄호를 사용시에는 yield를 필수로 정의해주어야 한다.  
 - expression 이기 때문에 반드시 최종 결과가 하나의 값으로 만들어져야 한다.
    - 이떄, 예외를 던지는 것은 가능하다.
 - ENUM과 함께 사용하면, 시너지 효과를 받을 수 있다.
    - ENUM 사용시 컴파일 시점에 타입이 정해진다. 때문에 default를 생략할 수 있다.

<br/>

## instanceof pattern matching

 - instanceof는 어떤 변수가 특정 타입의 인스턴스인지 확인하는 기능이다.
 - 자바 14 미리보기 출시 후 자바 16 정식 기능

<br/>

 - __instanceof__
    - instanceof 연산자를 활용해 타입을 확인한다.
    - 형 변환을 사용해 하위 타읍으로 바꾸어 값을 할당한다.
    - 이후 하위 타입이 갖고 있는 멤버에 접근한다.
```java
public String sound(Animal animal) {
    if (animal instanceof Dog) {
        Dog dog = (Dog) animal;
        return dog.bark();
    } else if (animal instanceof Cat) {
        Cat cat = (Cat) animal;
        return cat.purr();
    }

    throw new IllegalArgumentException("다른 경우의 수는 존재하지 않습니다.");
}
```
<br/>

 - __instanceof pattern matching__
    - instanceof가 단순히 true/false만 반환하지 않고, true인 경우 형 변환된 값을 할당해준다.
    - 특정 지점에 도착했을 때
```java
public abstract class Animal {
    public String sound(Animal animal) {
        if (animal instanceof Dog dog) {
            return dog.bark();
        } else if (animal instanceof Cat cat) {
            return cat.purr();
        }

    throw new IllegalArgumentException("다른 경우의 수는 존재하지 않습니다.");
    }
}

// 특정 지점 도착시 타입이 확실한 경우 if문 밖에서도 컴파일이 가능하다.
public String soundIfDog(Animal animal) {
    if (!(animal instanceof Dog dog)) {
        return "강아지가 아닙니다.";
    }

    return dog.bark();
}
```
<br/>

## Record class

 - 데이터 전달을 위해 등장
 - 자바 14 미리보기 출시 자바 16 정식 기능
 - __Record 특징__
    - 다른 클래스가 record class를 상속받을 수 없다.
    - 컴포넌트에 대한 private final 필드가 자동 생성된다.
    - 컴포넌트에 대한 값을 할당하는 생성자가 자동 생성된다.
    - 필드에 접근할 수 있는 필드명과 동일한 접근자가 자동 생성된다.
    - equals(), hashCode(), toString()이 자동생성된다.

<br/>

 - __데이터 전달을 위한 클래스__
    - class에 final이 선언되어 있어 상속받지 못한다.
    - private final 필드만 선언되어 있다.
    - 모든 private final 필드에 대해 생성자가 존재한다.
    - 클래스가 갖고 있는 모든 필드에 접근할 수 있는 메서드가 있고, 메서드의 이름은 필드의 이름과 동일하다.
    - equals(), hashCode(), toString()이 존재한다.
```java
@AllArgsConstructor
public final class FruitDto {
    private final String name;
    private final int price;
    private final LocalDate date;

    public String name() {
        return name;
    }
    public int price() {
        return price;
    }
    public LocalDate date() {
        return date;
    }

    @Override
    public boolean equals(Object o) {
        // ..
    }

    @Override
    public boolean hashCode() {
        // ..
    }

    @Override
    public String toString() {
        // ..
    }
}

// Record
public record FruitDtoV2(
    String name,
    int price,
    LocalDate date
) {

}

// Record 사용 예시
public class Main {
    public static void main(String[] args) {
        FruitDtoV2 dto = new FruitDtoV2("사과", 1000, LocalDate.of(2024, 1, 1));
        System.out.println(dto.price());
        System.out.println(dto);
    }
}
```
<br/>

 - __Record Class의 특징__
    - Record Class는 다른 클래스를 상속 받을 수 없다.
    - 인터페이스는 구현 가능하다.
    - static 필드, 함수, 인스턴스 함수 등을 만들 수 있다.
    - 인스턴스 필드는 만들 수 없다. 필드는 무조건 컴포넌트 구역에만 넣을 수 있다.
    - 자동 생성되는 메서드들을 직접 재정의할 수 있다.
    - 값을 검증하려면 일반적인 생성자 대신 Compact Constructor를 사용할 수 있다.
        - Compact Constructor에 값을 넣어줄 수는 없다.
        - 매개변수를 전혀 받지 않아 문법적으로 간결하다. 하지만, 필드에 값을 할당할 수는 없다.
```java
public record FruitDto(
    String name,
    int price,
    LocalDate date
) {

    // private String variable; ❌ 인스턴스 필드 불가

    private static final double DISCOUNT_RATE = 0.3;

    public int getDiscountPrice() {
        return (int) (price * (1.0 - DISCOUNT_RATE));
    }

    // 생성자 재정의
    /*
    public Fruit(String name, int price, LocalDate date) {
        System.out.println("생성자 호출");
        this.name = name;
        this.price = price;
        this.date = date;
    }
    */

    // Compact Constuctor
    public Fruit {
        System.out.println("생성자 호출");

        if (price < 0) {
            // this.price = 0; ❌ 컴파일 에러
            throw new IllegalArgumentException("과일의 가격은 양수입니다!");
        }
    }

    // 접근자 재정의
    public Stirng name() {
        return this.name;
    }
}
```
<br/>

 - __Record Class와 어노테이션__
    - 컴포넌트는 클래스 안의 필드, 생성자의 매개변수, 필드에 접근하는 메서드의 역할을 한다.
    - 떄문에, 어노테이션을 정의하면 3가지 모두에 적용한 것과 같다.
        - 어노테이션에 @Target을 정의함으로써 특정 요소에만 적용할 수도 있다.
```java
public record Fruit(
    String name,

    @MyAnnotation
    int price,
    LocalDate date
) {

}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
@interface MyAnnotation {

}
```
<br/>

 - __Record Class와 스프링 부트__
    - Jackson 2.12.0 이상부터 Record 클래스를 사용할 수 있다.
    - Jackson 2.12.0은 Spring Boot 2.5.x 이상이다.
    - HTTP 쿼리 파라미터와 Body 모두 잘 적용된다.

<br/>

## Sealed Class

 - 하위 클래스를 지정된 클래스로만 제한할 수 있다.
 - 자바 15 미리보기, 자바 17 정식 기능

```java
// 부모 클래스를 sealed로 만들고, permits로 하위 호환되는 클래스를 지정한다.
public sealed abstract class Animal permits Dog, Cat {

}

// sealed 클래스에 자식은 final, sealed, non-sealed 클래스여야 한다.
// final: 재상속 불가능
// sealed: 한 번더 sealed class로 동작
// non-sealed: 상속 가능하지만, 하위 타입 추적 불가능
public final class Dog extends Animal {
    public String bark() {
        return "멍멍";
    }
}

public final Cat extends Animal {
    public String purr() {
        return "야옹";
    }
}
```
<br/>

### Sealed Class 특징

 - Sealed Class 자식 클래스의 위치 제한
    - named module인 경우, 부모와 같은 모듈에 있어야 한다.
    - unnamed module인 경우, 부모와 같은 패키지에 있어야 한다.
    - 한 파일에 부모와 자식 모두 있다면, permits을 생략할 수 있다.
 - Sealed Class 장점
    - 상위 클래스를 설계할 때 호환성 걱정을 덜 수 있다.
    - ENUM Class 처럼 Sealed Class를 사용할 수 있다.
 - Sealed Interface
    - Sealed Class와 동일한 인터페이스
 - Sealed는 언제 사용해야 하는가?
    - 추상 클래스나 인터페이스를 만들 떄, 하위 클래스 경우의 수를 제한하고 싶을 때 사용한다.

<br/>

## 자바 12부터 자바 17까지의 주요 업데이트

 - __String 클래스 API__
    - indent(): 문자열의 각 줄마다 공백 문자를 들여쓰기 해주는 기능, 음수를 넣으면, 문자열 왼쪽에 공백을 제거해준다.
    - stripIndent(): Text Block의 로직인 "왼쪽으로 붙여쓰기"를 실행해준다.
    - formatted(): String.format()과 동일하다.
```java
// indent(): 공백 문자 추가 및 제거
String str = """
    A
    BC
    DEF
    """.indent(3);

// stripIndent(): A, B, C 앞의 공백이 한 칸씩 제거
String str = "A\n  B\n C";

// formatted(): 인스턴스 메서드로 String.format()과 동일
String str = """
    제 이름은 %s 이고,
    나이는 %s 입니다.
    """.formatted("홍길동", 40);
```
<br/>

 - __Files 클래스 API__
    - mismatch(): 파일의 내용물이 같은지 비교, 내용이 다르면 처음으로 다른 부분의 index를 반환하고, 내용이 같으면 -1을 반환한다.
    - writeString(): 파일에 문자열을 쓴다.
```java
// mismatch()
Path filePath1 = Path.of("C:\\Users\\..\\test.txt");
Path filePath2 = Path.of("C:\\Users\\..\\test2.txt");

long mismatch = Files.mismatch(filePath1, filePath2);

if (mismatch == -1) {
    System.out.println("동일함");
} else {
    System.out.println("동일하지 않음");
}

// writeString
Path tempPath = Files.createTempFile("fileName", ".txt"); // 임시 파일 생성
tempPath.toFile().deleteOnExit(); // 임시 파일 삭제: JVM이 종료될 떄 삭제된다.
Files.writeString(tempPath, "문자열 입력"); // 임시 파일에 문자열 쓰기
```
<br/>

 - __Collectors 클래스__
    - Collector는 Stream 연산 결과를 모으는 클래스이다.
    - teeing(): 2 개의 Collector를 합쳐서 결과를 처리한다.
        - Stream을 한 번만 돌면서 두 가지 작업을 동시에 하고 싶을 때 사용할 수 있다.
```java
// 가격이 제일 비싼 과일과 가격이 제일 싼 과일을 동시에 찾는 경우
public class Main {
    public static void main(String[] args) {
        List<FruitDto> fruits = List.of(
            new FruitDto("사과", 100),
            new FruitDto("바나나", 200),
            new FruitDto("사과", 300),
            new FruitDto("수박", 500),
        );

        int result = fruits.stream()
            .collect(Collectors.teeing(
                Collectors.minBy(Comparator.comparingInt(FruitDto::price)),
                Collectors.maxBy(Comparator.comparingInt(FruitDto::price)),
                (f1, f2) -> {
                    f1.ifPresent(f -> System.out.printf("가장 싼 과일은 %s입니다.\n", f.name()));
                    f2.ifPresent(f -> System.out.printf("가장 비싼 과일은 %s입니다.\n", f.name()));
                    return 0;
                }
            ));
    }
}
```
<br/>

 - __Stream 클래스__
    - mapMulti(): flatMap()을 조금 더 효율적으로 사용하면서 동시에 filter, map 연산도 할 수 있다.
        - 선언형 스타일이 명령형 스타일로 변경된다.
    - toList(): Stream을 불변 리스트로 변환해준다.
```java
// List<List<Number>>에서 Double을 찾아 List<Double>로 만들기
List<List<Number>> nums = List.of(List.of(1.0, 2.0), List.of(3, 4, 5));
List<Double> r2 = nums.stream()
        .flatMap(Collection::stream)
        .filter(n -> n instanceof Double)
        .map(n -> (double) n)
        .toList();

List<Double> r1 = nums.stream()
        .<Double>mapMulti((numberList, consumer) -> {
            for (Number num : numberList) {
                if (num instanceof Double) {
                    consumer.accept((double) num);
                }
            }
        })
        .toList();

// List 변환
List<Integer> r1 = nums.stream()
        .filter(num -> num % 2 == 0)
        .collect(Collectors.toUnmodifiableList());

List<Integer> r2 = nums.stream()
        .filter(num -> num % 2 == 0)
        .toList();
```
<br/>

 - __새로운 랜덤 API__
    - 자바 17 이전의 Randome 클래스
        - Random: 일반적인 경우에 사용
        - ThreadLocalRandom: 멀티 쓰레드 환경에서 사용
        - SecureRandom: 더 암호학적인 난수가 필요할 때 사용
        - ThreadLocalRandom과 SecureRandom 모두 Random을 상속받는다. Random이 인터페이스가 아닌 클래스로 종속적인 관계였다.
    - 자바 17에서는 Random의 상위로 RandomGenerator 인터페이스 생겨났고, RandomGenerator를 구현한 StreamableGenerator가 생겨났다.
        - 새로 생긴 구현체들은 thread-safe 하지 않지만, 기존의 Random 클래스보다 더 좋은 성능을 보인다.
        - 구현체가 많아지다보니 RandomGeneratorFactory도 생겨났다.
```java
// 기존 코드
Random random = new Random();
random.nextInt(10); // 0 ~ 9 사이의 정수 생성

// RandomGenerator 구현체 출력
RandomGeneratorFactory.all()
        .forEach(f -> System.out.println(f.name()));

// 기본 구현체 얻기
RandomGeneratorFactory.getDefault(); // 기본 구현체는 L32X64MixRandom 이다. 
```
<br/>

 - __추가적으로 알아두면 좋은 변화들__
    - Helpful NullPointerException
        - 자바 14에서 등장, 자바 15에서 default로 적용
        - NPE 디버깅 과정이 더 보기 좋아졌다.
    - 변경된 LTS 주기
        - 2021년 9월 자바 17 (LTS)
        - 2023년 9월 자바 21 (LTS)
    - 새로운 패키징 툴
        - 자바 16에서 jpackage 툴이 등장했다.
        - Mac OS의 .dmg 파일, Windows의 .exe 파일처럼 jar 파일을 특정 컴퓨터에서 설치할 수 있도록 한다. Java를 설치하지 않아도 설치가 가능해졌다.
    - 정식 기능이 된 ZGC
        - 기본 GC는 G1GC이다.
        - ZGC를 사용하고 싶다면, -XX:+UseZGC 옵션이 필요하다.
```java
// Helpful NullPointerException
// User가 NULL이여서 name() 호출시 에러가 났는지,
// name() 반환값이 NULL이여서 isBlank() 호출시 에러가 났는지 알 수 있다.
User user = new User(null);
boolean isBlank = user.name().isBlank();
```

