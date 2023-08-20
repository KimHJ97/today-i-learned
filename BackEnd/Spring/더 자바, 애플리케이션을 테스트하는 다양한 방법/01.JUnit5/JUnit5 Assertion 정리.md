# JUnit 5 Assertion 정리


Assertion(어설션)은 프로그램에서 특정 조건이 참(true)임을 명시적으로 검사하고, 조건이 참이 아닐 경우 프로그램 실행을 중단하거나 예외를 발생시키는 것을 말합니다. 어설션은 코드의 특정 지점에서 프로그램의 상태나 값이 올바른지를 검증하는 도구로 사용됩니다. 주로 디버깅, 테스트, 오류 발견 등에 활용됩니다.  
 - JUnit 5의 기본적으로 Assertion API를 제공한다.
 - AssertJ: https://joel-costigliola.github.io/assertj/
 - Hamcrest: https://hamcrest.org/JavaHamcrest/
 - Truth: https://truth.dev/

<br/>

## assertEquals(expected, actual)

예상 결과와 실제 결과가 같은지 비교합니다. 이때 값의 타입과 내용이 같아야 합니다.  

## assertTrue(condition)

주어진 조건이 true인지 확인합니다.

## assertFalse(condition)

주어진 조건이 false인지 확인합니다.  

## assertNull(object)

주어진 객체가 null인지 확인합니다.  

## assertNotNull(object)

주어진 객체가 null이 아닌지 확인합니다.  

## assertSame(expected, actual)

예상 결과와 실제 결과가 같은 객체를 참조하는지 확인합니다.  

## assertNotSame(expected, actual)

예상 결과와 실제 결과가 다른 객체를 참조하는지 확인합니다.  

## assertThrows(exceptionType, executable)

특정 종류의 예외가 발생하는지 확인합니다. executable에 실행 가능한 코드 블록을 전달합니다.  

## assertDoesNotThrow(executable)

어떠한 예외도 발생하지 않는지 확인합니다. executable에 실행 가능한 코드 블록을 전달합니다.  

## assertArrayEquals(expectedArray, actualArray)

예상 배열과 실제 배열이 같은지 비교합니다. 배열의 크기와 내용이 일치해야 합니다.  

## assertIterableEquals(expectedIterable, actualIterable)

예상 Iterable과 실제 Iterable이 같은지 비교합니다. 순서와 원소들이 일치해야 합니다.  

## assertLinesMatch(expectedLines, actualLines)

예상 라인 목록과 실제 라인 목록이 일치하는지 확인합니다. 정규 표현식과 함께 사용할 수 있습니다.  

## assertTimeout(duration, executable)

주어진 시간 내에 코드 블록이 완료되는지 확인합니다. 시간 초과가 발생하면 테스트 실패로 처리됩니다.  

## assertTimeoutPreemptively(duration, executable)

assertTimeout과 비슷하지만, 코드 블록이 시간 초과 되더라도 중단하지 않고 계속 실행합니다.  

## assertAll(Executable... executables)

여러 어설션(assertion)을 그룹화하여 모두 실행하고 결과를 모아서 보고하는 메서드입니다. 이를 통해 여러 개의 어설션을 한 번에 실행하고, 실패한 어설션의 정보를 모두 확인할 수 있습니다.  
 - JUnit은 기본적으로 Assertion을 하나씩 수행하며, Assertion 메서드가 실패시 다음의 코드를 실행하지 않는다. 때문에, 한 번에 어떤 Assertion에서 실패하는지 확인하기 어렵다. 이러한 경우 assertAll을 이용해 모든 Assertion을 수행하도록 할 수 있다.

