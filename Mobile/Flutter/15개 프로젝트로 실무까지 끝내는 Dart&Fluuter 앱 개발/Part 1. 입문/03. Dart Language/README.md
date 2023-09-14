# Dart Language

 - 함수/메서드
 - 분기문과 반복문
    - if, switch, for, for-in, forEach, while, do-while
 - 예외처리
    - try, catch, on, finally, throw, rethrow
 - 비동기 프로그래밍
    - async, await, Future
    - async*, yield, Stream

<br/>

## 함수/메서드

Dart 언어에서 함수(Function)는 코드 블록으로, 특정 작업을 수행하고 값을 반환할 수 있는 재사용 가능한 코드 단위를 나타냅니다. Dart는 함수형 프로그래밍 언어로서 함수가 일급 객체(First-class Citizen)로 취급되므로 함수를 변수에 할당하고 다른 함수로 전달할 수 있습니다.  

 - 함수 정의 (Function Definition)
    - Dart에서 함수를 정의할 때는 Function 키워드를 사용하거나 타입 애너테이션을 사용하여 함수의 매개변수와 반환 값의 타입을 지정합니다.
```Dart
int add(int a, int b) {
  return a + b;
}
```

 - 함수 호출 (Function Call)
    - 정의한 함수를 호출할 때는 함수 이름 뒤에 괄호를 사용하고, 필요한 인수(argument)를 전달합니다.
```Dart
int result = add(3, 5);
print(result); // 출력: 8
```

 - 옵셔널 매개변수 (Optional Parameters)
    - Dart에서는 필수 매개변수 외에도 선택적으로 매개변수를 정의할 수 있습니다. 선택적 매개변수는 중괄호 {} 또는 대괄호 []로 묶어 정의하며, 함수 호출 시 생략할 수 있습니다.
    - 아래의 greet 함수는 name은 필수 매개변수이고, message는 선택적 매개변수입니다. message를 생략하고 호출할 수 있습니다.
```Dart
void greet(String name, {String? message}) {
  print('Hello, $name! ${message ?? ''}');
}
```

<br/>

## 분기문과 반복문

분기문과 반복문은 Dart 프로그램에서 로직을 제어하고 데이터를 처리하는 데 사용됩니다. 조건문은 특정 조건에 따라 프로그램의 흐름을 변경하고, 반복문은 동일한 작업을 여러 번 반복해서 수행할 때 사용됩니다.  

 - if 문
    - if 문은 주어진 조건이 참인 경우에만 특정 코드 블록을 실행합니다.
```Dart
if (condition) {
  // 조건이 참일 때 실행할 코드
} else if (anotherCondition) {
  // 다른 조건이 참일 때 실행할 코드
} else {
  // 모든 조건이 거짓일 때 실행할 코드
}
```

 - switch 문
    - switch 문은 여러 경우(case) 중 하나를 선택하여 해당하는 코드 블록을 실행합니다.
    - Flutter 3.10 / Dart 3.0 부터는 범위에 대한 조건이 가능하고, break;가 없어도 된다.
```Dart
switch (expression) {
  case value1:
    // value1에 해당하는 경우 실행할 코드
    break;
  case value2:
    // value2에 해당하는 경우 실행할 코드
    break;
  default:
    // 모든 case에 해당하지 않는 경우 실행할 코드
}
```

 - for 문
    - for 문은 반복 횟수를 지정하여 코드 블록을 반복 실행합니다.
    - for (기준 변수; 조건식; 가변치) { .. }
```Dart
for (var i = 0; i < limit; i++) {
  // 반복 실행할 코드
}
```

 - for-in 문
    - for-in 문은 리스트나 맵과 같은 컬렉션의 각 항목을 반복적으로 처리할 때 사용합니다.
    - for (단일 변수 in 컬렉션 (List / Set / Map)) { .. }
```Dart
List<int> collection = [0, 1, 2, 3, 4, 5];
for (var item in collection) {
  // 컬렉션의 각 항목에 대해 실행할 코드
}
```

 - forEach 메서드
    - forEach 메서드는 Iterable 객체(예: List)의 각 항목에 대해 지정된 함수를 실행합니다.
```Dart
collection.forEach((item) {
  // 각 항목에 대해 실행할 코드
});
```

 - while 문
    - while 문은 주어진 조건이 참인 동안 코드 블록을 반복 실행합니다.
```Dart
bool condition = true;
int count = 0;

while (condition) {
  // 조건이 참인 동안 실행할 코드
  if (count > 3) {
    condition = false;
  }

  count++;
}
```

 - do-while 문
    - do-while 문은 코드 블록을 먼저 한 번 실행한 다음, 주어진 조건이 참인 동안 계속해서 반복 실행합니다.
```Dart
do {
  // 최소 한 번 실행되고, 조건이 참인 동안 실행할 코드
} while (condition);
```

<br/>

## 예외 처리

Dart 언어에서 예외 처리(Exception Handling)는 프로그램 실행 중에 발생하는 예외 상황을 관리하고, 그에 따른 대응 방법을 정의하는 데 사용됩니다. Dart에서 예외는 실행 중에 예상치 못한 오류 또는 예외 상황을 나타냅니다. 예외 처리는 애플리케이션의 안정성을 유지하고 비정상적인 상황에서도 graceful한 종료 또는 복구를 가능하게 합니다.  

Dart에서는 내장된 예외 클래스인 Exception, Error, 그리고 다양한 예외 타입들이 제공되며, 사용자 정의 예외를 만들어 활용할 수도 있습니다. 예외 처리는 애플리케이션의 안정성을 높이고 예외 상황에 대한 로깅 또는 복구 메커니즘을 구현하는 데 중요한 역할을 합니다.  

```Dart
try{
    // 예외가 발생할 것으로 예상되는 코드
    print(10 ~/ 0);
} on UnsupportedError catch(error, stack) {
    // 특정 예외(UnsupportedError)가 발생했을 때 실행 하고자 하는 코드
    print('~/ 해당 연산자는 0으로 나눌 수 없습니다.');
} catch(error, stack) {
    // 예외가 발생했을 때 실행 하고자 하는 코드 (모든 예외 처리)
    print(error);
    print(stack);
} finally {
    // 예외 발생 여부와 상관없이 항상 실행 하고자 하는 코드
    print('프로그램 종료');
}
```

 - try-catch 블록
    - try: 예외가 발생할 수 있는 코드 블록을 try 블록 내에 작성합니다.
    - catch: 예외를 처리하고 적절한 조치를 취하기 위한 코드 블록을 catch 블록 내에 작성합니다. catch 블록은 예외 객체와 해당 예외를 처리하는 로직을 포함합니다.
        - catch 블록안에는 error 객체와 stackTrace가 파라미터로 들어온다.
    - on: 특정 예외 타입에 대한 처리를 할 때 사용됩니다.
```Dart
try {
  // 예외가 발생할 수 있는 코드
} catch (error, stackTrace) {
  // 예외 처리 로직
  print('예외 발생: $error');
  print(stackTrace);
}
```

 - on 예외 타입
    - 특정 예외 타입에 대한 처리를 할 때 on 키워드를 사용합니다.
    - on 블록은 특정 예외 타입에 대해서만 동작하며, 다른 예외 타입은 처리하지 않습니다.
```Dart
try {
  // 예외가 발생할 수 있는 코드
} on ExceptionType catch (e) {
  // 특정 예외 타입에 대한 처리
  print('특정 예외 처리: $e');
}
```

 - finally 블록
    - finally 블록은 예외의 발생 여부와 상관없이 항상 실행되는 코드 블록입니다. 주로 리소스 해제 또는 정리 작업에 사용됩니다.
```Dart
try {
  // 예외가 발생할 수 있는 코드
} catch (e) {
  // 예외 처리 로직
  print('예외 발생: $e');
} finally {
  // 항상 실행되는 코드
  print('예외 처리 완료');
}
```

 - throw 키워드
    - throw 키워드는 직접 예외를 발생시킬 때 사용됩니다. 사용자 정의 예외를 생성하거나 특정 조건에서 예외를 발생시킬 수 있습니다.
```Dart
if (condition) {
  throw Exception('이 예외는 특정 조건에서 발생했습니다.');
}
```

 - rethrow 키워드
    - rethrow 문은 Dart에서 예외를 다시 던지는 데 사용되는 특별한 키워드입니다. rethrow는 예외를 잡아서 처리하는 동안 예외를 수정하지 않고, 현재 처리 중인 예외를 다시 던질 때 사용됩니다. 즉, 현재 예외를 다른 곳으로 전파합니다.
    - rethrow는 주로 예외를 잡아서 특정 조건에 따라 예외를 처리하거나 로깅한 후, 해당 예외를 다시 호출자에게 전달할 때 유용합니다.
```Dart
void main() {
  try {
    divide(5, 0);
  } catch (e) {
    print('예외가 발생했습니다: $e');
  }
}

void divide(int a, int b) {
  try {
    if (b == 0) {
      throw Exception('0으로 나눌 수 없습니다.');
    }
    print(a ~/ b);
  } catch (e) {
    print('나누기 함수에서 예외를 잡았습니다: $e');
    rethrow; // 현재 예외를 다시 던짐
  }
}
```

<br/>

## 비동기 프로그래밍 맛보기

art는 비동기 프로그래밍을 위한 강력한 기능과 문법을 제공합니다. 이러한 기능은 I/O 작업, 네트워크 통신 및 다른 비동기 작업을 효과적으로 처리하기 위해 사용됩니다. 비동기 프로그래밍은 애플리케이션이 블로킹되지 않고 작업을 병렬로 수행할 수 있도록 합니다.  

Dart의 비동기 프로그래밍 문법을 사용하면 I/O 작업, 네트워크 호출 등의 비동기 작업을 보다 효율적으로 다룰 수 있습니다. 비동기 프로그래밍은 애플리케이션의 반응성을 높이고 블로킹을 최소화하여 애플리케이션의 성능을 향상시킵니다.  
 - async / await / Fture: 1회만 응답을 돌려받는 경우
 - async* / yield / Stream: 지속적으로 응답을 돌려받는 경우
    - async*는 Dart에서 비동기 스트림을 생성하는 데 사용되는 키워드입니다. async* 함수는 제너레이터(generator) 함수로서, yield 키워드와 함께 사용하여 스트림의 요소를 생성하고 반환합니다.
    - yield는 async* 함수 내에서 사용되며, 현재의 함수 실행을 일시 중단하고 값을 스트림으로 내보내는 역할을 합니다. yield는 스트림에 값을 추가하고 함수의 상태를 보존합니다. 다음 호출에서 함수는 yield 이후의 코드를 실행합니다.
    - Stream은 비동기적으로 발생하는 이벤트의 연속을 나타내는 객체입니다. 스트림은 이벤트 스트림을 생성하고 이를 통해 데이터를 비동기적으로 송수신하는 데 사용됩니다.
```Dart
// async / await / Future: 1회만 응답을 돌려받는 경우
Future<void> todo(int second) async {
    await Future.delayed(Duration(seconds: second));
    print('TODO Done in $second second');
}

todo(3);
todo(1);
todo(5);

// async* / yield / Stream: 지속적으로 응답을 돌려받는 경우
Stream<int> todo2() async* {
    int counter = 0;

    while(counter <= 10) {
        counter++;
        await Future.delayed(Duration(seconds: 1));
        print('TODO is Running $counter');
        yield counter;
    }

    print('TODO is Done');
}

todo2().listen((event) {});
```

<br/>

 - Future와 async/await
    - Future: Future는 비동기 작업의 결과를 나타내는 객체입니다. 비동기 함수가 값을 반환할 때 Future로 감싸져 반환됩니다. Future는 비동기 작업이 완료되면 값을 가지고 완료 상태가 됩니다.
    - async 및 await: async 키워드는 함수가 비동기 함수임을 나타내며, await 키워드는 Future 객체가 완료될 때까지 대기하고 그 결과를 반환합니다. await는 비동기 코드 블록 내에서만 사용할 수 있습니다.
```Dart
Future<void> fetchData() async {
  // 비동기 작업을 수행하는 비동기 함수
  var result = await performAsyncOperation();
  print('비동기 작업 결과: $result');
}
```

 - Future의 처리:
    - Future는 비동기 작업의 결과 또는 예외를 처리하는 데 사용됩니다. then, catchError, whenComplete 등의 메서드를 사용하여 Future를 처리할 수 있습니다.
```Dart
Future<int> fetchData() {
  return performAsyncOperation()
      .then((result) => print('비동기 작업 결과: $result'))
      .catchError((error) => print('에러 발생: $error'))
      .whenComplete(() => print('완료'));
}
```

 - Future의 병렬 처리
    - Dart에서 여러 Future를 병렬로 처리하고 모든 작업이 완료될 때까지 기다리는 것은 Future.wait를 사용하여 수행할 수 있습니다.
```Dart
Future<void> processTasks() async {
  var task1 = performTask1();
  var task2 = performTask2();
  await Future.wait([task1, task2]);
  print('모든 작업 완료');
}
```

 - Stream과 StreamController
    - Stream은 비동기적으로 이벤트를 발생시키고 수신하는 데 사용됩니다. StreamController를 사용하여 이벤트를 생성하고 수신할 수 있는 Stream을 생성할 수 있습니다.
```Dart
Stream<int> countStream() {
  var controller = StreamController<int>();
  for (var i = 1; i <= 5; i++) {
    controller.sink.add(i);
  }
  controller.close();
  return controller.stream;
}
```
