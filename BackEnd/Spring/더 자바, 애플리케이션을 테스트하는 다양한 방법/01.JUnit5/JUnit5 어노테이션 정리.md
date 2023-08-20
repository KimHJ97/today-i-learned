# JUnit 5 어노테이션 정리

## @Test

해당 어노테이션은 테스트 메서드를 정의하는 데 사용됩니다.  
이 어노테이션을 메서드에 추가하면 해당 메서드가 단위 테스트로 인식되며, JUnit은 이 메서드를 실행하여 테스트 결과를 판별합니다.  

## @BeforeAll

해당 어노테이션은 테스트 클래스 내의 정적 메서드에 적용됩니다.  
이 메서드는 모든 테스트 메서드 실행 전에 한 번 호출됩니다.  
주로 초기화 작업을 수행하는 데 사용됩니다.  
 - 테스트 실행 전 딱 한 번 호출되는 메서드 정의(초기화 작업)
 - 해당 어노테이션을 사용하는 메서드를 구현할 때에는 반드시 static 메서드로 정의되어야 한다.

## @AfterAll

해당 어노테이션은 테스트 클래스 내의 정적 메서드에 적용됩니다.  
이 메서드는 모든 테스트 메서드 실행 후에 한 번 호출됩니다.  
주로 정리 작업을 수행하는 데 사용됩니다.  
 - 모든 테스트 실행 후 마지막에 딱 한 번 호출되는 메서드 정의(정리 작업)
 - 해당 어노테이션을 사용하는 메서드를 구현할 때에는 반드시 static 메서드로 정의되어야 한다.

## @BeforeEach

해당 어노테이션은 테스트 메서드 실행 전에 호출되는 메서드에 적용됩니다.  
각각의 테스트 메서드 실행 전에 초기화 작업을 수행하는 데 사용됩니다.  
 - 단일 테스트 실행 전에 한 번씩 호출된다.

## AfterEach

해당 어노테이션은 테스트 메서드 실행 후에 호출되는 메서드에 적용됩니다.  
각각의 테스트 메서드 실행 후에 정리 작업을 수행하는 데 사용됩니다.  
 - 단일 테스트 실행 후에 한 번씩 호출된다.

## @DisplayName

해당 어노테이션은 테스트 클래스 또는 메서드에 대한 사용자 정의 표시 이름을 지정하는 데 사용됩니다.  
테스트 실행 결과 리포트에서 읽기 쉽고 명확한 이름을 제공할 수 있습니다.  

## @DisplayNameGeneration
해당 어노테이션은 테스트 클래스 내의 테스트 메서드의 표시 이름을 동적으로 생성하는 데 사용됩니다.  
테스트 메서드의 이름 생성 규칙을 지정할 수 있습니다.  
 - 일반적으로 테스트 메서드의 이름은 메서드의 이름 그대로 사용되거나 언더스코어(_) 등의 형식을 사용하여 자동으로 만들어지곤 한다. 이때 @DisplayNameGeneration을 사용하여 표시 이름을 동적으로 생성할 수 있다.

## @Enabled

해당 어노테이션은 특정 조건을 만족할 때 테스트 메서드를 활성화하는 데 사용됩니다. @Enabled 어노테이션과 조건을 함께 사용하여 특정 상황에서만 테스트를 실행할 수 있습니다.  
 - 추가적으로 OnOs, OnJre, IfSystemProperty, IfEnvironmentVariable 등을 추가한 어노테이션이 제공된다.
 - @EnabledOnOs, @EnabledOnJre, @EnabledIfSystemProperty, @EnabledIfEnvironmentVariable
```Java
@Test
@EnabledIfEnvironmentVariable(named = "TEST_ENV", matches = "LOCAL") // TEST_ENV 환경 변수 값이 "LOCAL"인 경우에만 테스트 실행
@EnabledOnJre({JRE.JAVA_8, JRE.JAVA_11}) // JRE 8, 11 버전에서만 테스트 실행
void test() {
    // 테스트 로직
}
```

## @Disabled

해당 어노테이션은 특정 테스트 메서드 또는 테스트 클래스를 비활성화하는 데 사용됩니다.  
해당 테스트는 실행되지 않습니다.  
 - 추가적으로 OnOs, OnJre, IfSystemProperty, IfEnvironmentVariable 등을 추가한 어노테이션이 제공된다.
 - @DisabledOnOs, @DisabledOnJre, @DisabledIfSystemProperty, @DisabledIfEnvironmentVariable
```Java
@Test
@DisabledOnOs(OS.WINDOWS) // Widnows 운영체제가 아닌 경우에만 테스트 실행
@EnabledOnJre({JRE.JAVA_8, JRE.JAVA_11}) // JRE 8, 11 버전에서만 테스트 실행
void test() {
    // 테스트 로직
}
```

## @RepeatedTest

해당 어노테이션은 일한 테스트 메서드를 여러 번 반복해서 실행하는 데 사용됩니다. 이를 통해 특정 테스트를 여러 번 실행하여 각 반복마다 다른 입력 값을 사용하거나 랜덤한 조건을 시뮬레이션하는 등의 상황에서 사용할 수 있습니다.  
 - 반복 횟수와 반복 테스트 이름을 설정할 수 있다.
    - displayName
    - currentRepetition
    - totalRepetitions
 - RepetitionInfo 타입의 인자를 받을 수 있다.
```Java
@DisplayName("반복 테스트")
@RepeatedTest(value = 5, name = "{displayName}, {currentRepetition}/{totalRepetitions}")
void repeatTest(RepetitionInfo repetitionInfo) {
    System.out.println(
        "현재 반복 횟수: " + repetitionInfo.getCurrentRepetition()
        ", 전체 반복 횟수: " + repetitionInfo.getTotalRepetitions()
        );
}
```

## @ParameterizedTest
해당 어노테이션은 동일한 테스트 메서드를 다양한 인수(매개변수)를 사용하여 반복해서 실행하는 데 사용됩니다. 이를 통해 테스트 메서드를 여러 가지 경우에 대해 실행하고 각 경우마다 다른 입력 값을 사용하여 검증할 수 있습니다.
 - 테스트에 여러 다른 매개변수를 대입해가며 반복 실행한다.
    - displayName, index, arguments, {0}, {1}, ..
 - 인자 값들의 소스
    - @ValueSource
    - @NullSource, @EmptySource, @NullAndEmptySource
    - @EnumSource
    - @MethodSource
    - @CsvSource
    - @CvsFileSource
    - @ArgumentSource
    - 인자 값 타입 변환
        - 암묵적인 타입 변환: https://junit.org/junit5/docs/current/user-guide/#writing-tests-parameterized-tests-argument-conversion-implicit
        - 명시적인 타입 변환: SimpleArgumentConverter 구현체, @ConvertWith
    - 인자 값 조합
        - ArgumentsAccessor
        - 커스텀 Accessor
            - ArgumentsAggregator 인터페이스 구현, @AggregateWith
```Java
@DisplayName("반복 테스트")
@ParameterizedTest(name = "{index} {displayName} message={0}")
@ValueSource(strings = {"Hello", "World"})
void parameterizedTest(String message) {
    System.out.println(message);
}

@ParameterizedTest
@CsvSource({ "apple, 1", "banana, 2", "orange, 3" })
void test_fruit_count(String fruit, int count) {
    // Test logic here using 'fruit' and 'count'
}

// 단일 값 객체로 받기: SimpleArgumentConverter 구현
@ParameterizedTest
@ValueSource(ints = {10, 20, 40})
void argumentConrvertTest(@ConvertWith(StudyConverter.class) Study study) {
    System.out.println(study.getLimit());
}
static class StudyConverter extends SimpleArgumentConverter {
    @Override
    protected Object convert(Object source, Class<?> targetType) throws ArgumentConversionException {
        assertEquals(Study.class, targetType, "Can only convert to Study")
        return new Study(Integer.parseInt(source.toString()));
    }
}

// 여러 값 받기: ArgumentsAccessor
@ParameterizedTest
@CsvSource({"10, '자바 스터디'", "20, '스프링 스터디'"})
void argumentsAccessorTest(ArgumentsAccessor argumentsAccessor) {
    Study study = new Study(argumentsAccessor.getInteger(0), argumentsAccessor.getString(1));
}

// 여러 값 객체로 받기: ArgumentsAggregator 구현
@ParameterizedTest
@CsvSource({"10, '자바 스터디'", "20, '스프링 스터디'"})
void argumentsAggregatorTest(@AggregateWith(StudyAggregator.class) Study study) {
    // 테스트 로직
}
static class StudyAggregator implements ArgumentsAggregator {
    @Override
    public Object aggregateArguments(ArgumentsAccessor argumentsAccessor, ParameterContext parameterContext) throws ArgumentsAggregationException {
        return new Study(argumentsAccessor.getInteger(0), argumentsAccessor.getString(1));
    }
}
```

## @TestInstance

@TestInstance 어노테이션을 사용하여 테스트 클래스의 테스트 인스턴스 모드를 지정할 수 있습니다.  
기본적으로 JUnit 5는 테스트 메서드마다 새로운 테스트 인스턴스를 생성합니다. 이는 테스트 메서드 간에 상호 영향을 주지 않기 위함입니다.  
 - Per Method (기본값): 각 테스트 메서드마다 새로운 테스트 인스턴스를 생성합니다. 테스트 메서드 간에 상호 독립적으로 실행되므로 서로 영향을 주지 않습니다.
 - Per Class: 테스트 클래스당 하나의 테스트 인스턴스를 생성합니다. 같은 테스트 클래스의 모든 테스트 메서드는 같은 테스트 인스턴스를 공유하게 됩니다. 이 모드에서는 테스트 간의 데이터 공유나 상태 공유가 가능합니다. (Per Class로 지정시 @BeforeAll, @AfterAll이 static 메서드가 아니여도 된다.)
```Java
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class MyTestClass {

    private int sharedValue = 0;

    @Test
    void test_method_1() {
        // Use 'sharedValue'
    }

    @Test
    void test_method_2() {
        // Use 'sharedValue'
    }
}
```

## @TestMethodOrder

해당 어노테이션을 사용하여 테스트 메서드의 실행 순서를 설정할 수 있습니다.  
 - MethodOrderer 구현체를 설정하여야 한다.
 - 기본 구현체
    - Alphanumeric, OrderAnnoation, Random
```Java
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class MyTestMethodOrderClass {

    @Test
    @Order(1)
    void test_method_1() {
        // Test logic here
    }

    @Test
    @Order(2)
    void test_method_2() {
        // Test logic here
    }

    @Test
    @Order(3)
    void test_method_3() {
        // Test logic here
    }
}
```