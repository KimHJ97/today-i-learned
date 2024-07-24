# 코틀린 문법 학습

 - Temurin Open JDK: https://adoptium.net/temurin/releases/
 - JetBrains ToolBox: https://www.jetbrains.com/toolbox-app/
 - 코틀린 플레이 그라운드: https://play.kotlinlang.org

<br/>

## 코틀린 기초 문법

### 변수

- 타입을 생략하는 경우 코틀린 컴파일시 자동으로 추론해준다.
- 지연 할당시에는 타입을 필수적으로 명시해주어야 한다.
- val(value): 값을 한 번 초기화하면 재할당이 불가능하다.
- var(variable): 가변 변수로 초기화 후에도 재할당이 가능하다.
```kotlin
fun main() {
    // 변수 생성
    val a: Int = 1

    // 타입 추론
    val b = 1

    // 지연 할당
    val c: Int
    c= 3

    // ❌ 지연 할당시 타입 미정의시 컴파일 에러
    val d: Int
    d = 123

    // ❌ val는 재할당이 불가능하다.
    val e: String = "Hello"
    e = "World";

    // ✔ var는 재할당이 가능하다.
    var f = "Hello"
    f = "World"
}
```
<br/>

### 함수

- 코틀린에서는 fun 키워드를 이용하여 함수를 만든다.
```kotlin
// 기본적인 함수 선언 스타일
fun sum(a: Int, b: Int): Int {
    return a + b
}

// 표현식 스타일
fun sum2(a: Int, b: Int): Int = a + b

// 표현식 & 반환타입 생략
fun sum3(a: Int, b: Int) = a + b

// 몸통이 있는 함수는 반환 타입을 제거하면 컴파일 오류
fun sum4(a: Int, b:Int): Int {
    return a + b
}

// 반환타입이 없는 함수는 Unit을 반환한다.
fun printSum(a: Int, b: Int) {
    println("$a + $b = ${a + b}")
}
fun printSum2(a: Int, b: Int): Unit {
    println("$a + $b = ${a + b}")
}

// 디폴트 파라미터
fun greeting(message: String = "안녕하세요!") {
    println(message)
}

fun main() {
    greeting()
    greeting("Hi!")
}

fun log(level: String = "INFO", message: String) {
    print("[$level]$message")
}

fun main() {
    // 네임드 아규먼트
    log(message = "인포 로그")
    log(level = "DEBUG", "디버그 로그")
    log("WARN", "워닝 로그")
    log(level = "ERROR", message = "에러 로그")
}
```
<br/>

### 흐름 제어

- 코틀린의 if..else는 표현식으로서 값을 반환할 수 있다.
- 코틀린의 when은 표현식으로서 값을 반환할 수 있다.
```kotlin 
fun main() {
    // if..else
    val job = "Developer"

    if (job == "Developer") {
        println("개발자입니다.")
    } else {
        println("개발자가 아닙니다.")
    }

    // 코틀린의 if..else는 표현식이다.
    val age: Int = 10

    val str = if (age > 19) {
        "성인"
    } else {
        "미성년자"
    }

    // 코틀린은 삼항 연산자가 없다. if..else가 표현식으로 불필요하다.
    val a = 1
    val b = 2
    val c = if (b > a) b else a

    // when
    val day: Int = 2
    val result = when (day) {
        1 -> "월요일"
        2 -> "화요일"
        3 -> "수요일"
        4 -> "목요일"
        5 -> "금요일"
        6 -> "토요일"
        7 -> "일요일"
        else -> "에러"
    }
    println(result) // 화요일

    // 여러개의 조건을 콤마로 구분해 한줄에서 정의할 수 있다.
    when (getNumber()) {
        0, 1 -> print("0 또는 1")
        else -> print("0 또는 1이 아니다.")
    }

    // for loop (범위 연산자 ..를 이용)
    for (i in 0 .. 3) {
        println(i) // 0 1 2 3
    }

    // until을 사용해 반복 (마지막 숫자는 포함하지 않는다.)
    for (i in 0 until 3) {
        println(i) // 0 1 2
    }

    // step으로 들어온 값만큼 증가시킨다.
    for (i in 0 .. 6 step 2) {
        println(i) // 0 2 4 6
    }

    // downTo를 사용해 반복하면서 값을 감소시킨다.
    for (i in 3 downTo 1) {
        println(i) // 3 2 1
    }

    // 전달받은 배열 반복
    val numbers = arrayOf(1, 2, 3)
    for (i in numbers) {
        println(i) // 1 2 3
    }

    // while looop
    var x = 5
    while(x > 0) {
        println(x)
        x--
    }
}

fun getNumber() = 2
```
<br/>

### 널 안정성

- 자바를 포함한 많은 프로그래밍 언어에서 가장 많이 발생하는 예외 유형으로는 NullPointerException(NPE)가 있다. 자바에서는 NPE를 줄이기 위해 JDK8부터 Optional을 지원한다. 자바의 옵셔널은 값을 래핑하기 때문에 객체 생성에 따른 오버헤드가 발생하고, 컴파일 단계에서 Null 가능성을 검사하지 않는다.
- 코틀린은 언어적 차원에서 NPE가 발생할 가능성을 제거한다. 코틀린의 타입은 기본적으로 Non-Null 타입으로 null을 허용하지 않는다.
- 코틀린은 null을 허용하는 Nullable 타입을 제공한다. Nullable 참조는 컴파일 단계에서 널 안정성을 제공한다.
```kotlin
// 코틀린의 타입은 기본적으로 Null을 허용하지 않는다.
val a: String = null // ❌ 컴파일 오류
var b: String = "aabbcc"
b = null // ❌ 컴파일 오류

// 코틀린은 null을 허용하는 Nullable 타입을 제공한다.
var a: String? = null
a.length // ❌ 컴파일 오류

a?.length // safe-call 연산자: Nullable 참조에 대한 접근은 안전 연산자를 사용

// 엘비스 연산자를 사용해 null이 아닌 경우 특정 값을 사용하도록 한다.
val b: Int = if (a != null) a.length else 0
val b: a?.length ?: 0
```
<br/>

#### 자바와 코틀린 NUll 처리 비교

 - `Java Null 처리`
```java
// java
public static String getNullStr() {
    return null;
}

public static int getLengthIfNotNull(String str) {
    if (str == null || str.length() == 0) {
        return 0;
    }
    return str.length();
}

public static void main(String[] args) {
    String nullableStr = getNullStr();

    // Optional 사용
    nullableStr = Optional.ofNullable(nullableStr)
            .orElse("null인 경우 반환");
    
    // Optional을 주석처리하고 null 참조를 사용하더라도 컴파일 오류가 발생하지 않음
    int nullableStrLength = nullableStr.length();
    System.out.println(nullableStrLength);

    // 메서드 내부에서 null을 검사하는 방법도 있다.
    int length = getLengthIfNotNull(null);
    System.out.println(length);
}
```
<br/>

 - `Kotlin Null 처리`
```kotlin
fun getNullStr(): String? = null

fun getLengthIfNotNull(str: String?) = str?.length ?: 0

fun main() {
    val nullableStr = getNullStr()

    val nullableStrLength = nullableStr.length // ❌ 컴파일 오류
    println(nullableStrLength)
 
}
```
<br/>

#### 코틀린에서도 NPE가 발생할 수 있다.

 - 자바와 상호운용하는 경우 자바에서 NPE를 유발하는 코드를 코틀린에서 사용하면 NPE가 발생할 수 있다.
 - 코틀린에서 자바 코드를 사용할 떄는 항상 Nullable 가능성을 염두해 안전 연산자와 엘비스 연산자를 사용한다.
    - 엘비스 연산자는 좌변이 Null인 경우 우변을 반환한다.
```kotlin
// 명시적 NPE 호출
throw NullPointerException()

// !! NotNull임을 단언하는 단언 연산자 사용
val c: String? = null // Null 허용 타입 지정
val d = c!!.length // NotNull 임을 단언하고 함수 사용

// 자바에서 NPE를 유발하는 코드 사용
println(JavaClass.getNullStr().length)

println(JavaClass.getNullStr()?.length)
```
<br/>

### 예외처리

코틀린의 모든 예외 클래스는 최상위 예외 클래스인 Throwable을 상속한다.
 - 코틀린에서는 자바의 Exception 계층을 코틀린 패키지로 래핑한다.
 - 코틀린에서는 체크드 익셉션을 강제하지 않는다.
 - 코틀린의 try-catch는 표현식이다.
 - 예외를 발생시키기 위해서는 throw 키워드를 사용한다.
 - throw 역시 표현식으로 throw를 리턴할 수 있다.
```kotlin
val a = try {
    "1234".toInt()
} catch (e: NumberFormatException) {
    println("catch")
} finally {
    println("finally")
}

// 예외 발생시키기
throw Exception("예외 발생")

// 예외가 발생하면 Nothing 타입이 반환된다.
fun failFast(message: String): Nothing {
    throw IllegalArgumentException(message)
}
```
