# Dart Language

## 프로그래밍 언어

프로그래밍 언어(Programming Language)는 컴퓨터와 소프트웨어를 제어하고 프로그램을 작성하기 위한 형식화된 명령어와 규칙의 집합입니다. 이러한 언어는 사람과 컴퓨터 간의 의사 소통을 중개하며, 개발자가 원하는 작업을 컴퓨터에게 지시할 수 있도록 합니다.  
 - 저급 언어
    - 기계가 더 잘 알아볼 수 있는 언어
    - 실행속도가 빠름
    - 대표적인 언어로는 0과 1로 이루어진 기계어나 기호코드 위주로 이루어진 어셈블리어
 - 고급 언어
    - 저급언어보다 사람이 조금 더 알아보기 쉬운 언어
    - Compile 등의 번역 과정이 필요
    - 흔히 알려진 프로그래밍 언어로는 C, C++, Java, Kotlin, Javascript, Swift 등이 있음

<br/>

#### Dart란

Dart(다트)는 Google에서 개발한 오픈 소스 프로그래밍 언어입니다. Dart는 다양한 종류의 애플리케이션을 개발하기 위한 언어로 설계되었으며, 특히 웹 및 모바일 애플리케이션을 만들기 위한 목적으로 만들어졌습니다.  
 - Google에서 개발한 고급 프로그래밍 언어
 - 객체지향 프로그래밍 언어로 안정적이고 빠르게 애플리케이션을 만들기 위해 개발
    - 객체 지향 프로그래밍 언어로, 클래스와 객체 지향 설계 원칙을 지원합니다. 이를 통해 코드의 가독성을 높이고 재사용성을 증가시킵니다.
 - 다양한 플랫폼에서 실행될 수 있도록 설계되어, 두 가지 컴파일러(JIT, AOT)를 가짐
    - Just-In-Time 컴파일러(JIT)와 Ahead-Of-Time 컴파일러(AOT)를 모두 지원하여 빠른 실행 성능을 제공합니다. JIT 컴파일러는 개발 중에 빠른 반복 개발을 지원하고, AOT 컴파일러는 배포 시에 빠른 성능을 보장합니다.  
 - 강력한 타입 시스템을 갖추고 있어 코드의 안정성과 가독성을 높일 수 있음
    - 동적 타입(Dynamic Typing) 및 정적 타입(Static Typing) 시스템을 모두 지원합니다. 개발자는 필요에 따라 타입을 지정하거나 생략할 수 있습니다.

<br/>

#### Dart의 컴파일러

 - JIT 컴파일러 (Just-In-Time Compiler)
    - 코드 실행 시점에 컴파일을 수행할 수 있는 컴파일러로 빠른 개발과 디버깅을 할 때 주로 사용되는 컴파일러이다. Flutter 개발의 특징인 Hot-Reload, Hot-Restart를 구현할 때 활용된다.
 - AOT 컴파일러 (Ahead-Of-Time Compiler)
    - 사전에 미리 컴파일을 수행하여 높은 실행 속도를 필요로 할 때 활용되는 컴파일러로 코드 내부를 보호할 수 있으며, Dart 코드를 다른 플랫폼에서 실행할 수 있도록 컴파일 후 배포 가능한 바이너리 파일을 생성하는 것이 특징이다.

<br/>

## Dart의 변수와 타입

 - 변수
    - 특정한 값(데이터)를 담아두는 그릇
    - 변수에는 변수명을 정하는 선언과 값을 저장하는 할당 두 가지를 활용하게 된다.
 - 변수 타입
    - 데이터의 유형을 타입이라고 하고, 기본형과 확장형 두 가지로 나뉜다.
    - 기본형
        - 참/거짓: bool
        - 정수: int
        - 실수: double
        - 문자열: String
        - Null: null
    - 자료형
        - List, Set, Map
    - 확장형
        - Object, Enum, Future, Stream
 - 타입 정의 유무
    - Dart는 타입을 반드시 정의할 필요는 없다.
    - 하지만, 프로그래밍 특성상 주고받는 타입에 대한 정의가 명확해야 추후에 코드를 관리하고 다른 사람과 협업하는 데에 큰 도움이 된다.
    - var: 최초 한 번 부여된 타입이 고정적으로 사용
    - dynamic: 타입이 코드 진행중에서 언제든 변환이 된다.
 - 상수
    - 변수는 한 번 할당한 값을 여러 번 수정할 수 있다.
    - 상수는 값을 한 번 할당하면 바꿀 수 없다.
    - const: 컴파일 시점에 상수 처리될 경우에 활용
    - final: 프로그램의 진행 중에 상수 처리될 경우에 활용

<br/>

### 실습

 - DartPad 사이트에서 다트 언어에 대한 코드를 웹 사이트에서 확인할 수 있다.
 - DartPad: https://dartpad.dev
```Dart
void main() {
  print('Hello World!');
}
```

 - 기본형 변수
```Dart
void main() {
  // 참/거짓형: bool
  bool isTrue = true;
  
  // 정수형: int
  int num = 100;
  
  // 실수형: double
  double num2 = 3.14;
  double num3 = 3;
  
  // 문자열형: String
  String str = 'Hello World';
  
  // Null형: null
  Null thisIsNull = null;
  
  print(isTrue);
  print(num);
  print(num2);
  print(num3);
  print(str);
  print(thisIsNull);
}
```

 - 가변형 변수(var, dynamic)
```Dart
void main() {
  // 가변형: var / dynamic
  
  var value = 1;
  value = 2;
  // value = 'str'; // ❌ 타입 변경은 불가능
  
  dynamic dynamicValue = 1;
  dynamicValue = 2;
  dynamicValue = 'str'; // ✔ 타입 변경 가능
}
```

<br/>

## Dart 연산자


프로그래밍 언어에서 연산자(Operator)는 수학적 또는 논리적 연산을 수행하는 기호나 기능을 나타냅니다. 연산자는 변수, 상수 또는 값들 간에 다양한 계산을 수행하고 결과를 반환하는데 사용됩니다. 연산자는 프로그래밍 언어의 핵심 요소 중 하나이며, 다양한 작업을 수행하기 위해 사용됩니다.  
 - 산술 연산자
    - 산술 연산자는 숫자 값들 간의 수학적 계산을 수행합니다. 주요 산술 연산자로는 덧셈(+), 뺄셈(-), 곱셈(*), 나눗셈(/), 나머지(%), 지수(**) 연산자 등이 있습니다.
    - '+', '-', '*', '/', '%', '~/', '++', '--', '++', '--'
 - 비교 연산자
    - 비교 연산자는 값들 간의 비교를 수행하고, 비교 결과는 참(True) 또는 거짓(False)으로 반환됩니다. 주요 비교 연산자로는 등호(==), 부등호(!=), 크다(>), 작다(<), 크거나 같다(>=), 작거나 같다(<=) 등이 있습니다.
    - '==', '!=', '>', '>=', '<', '<='
 - 논리 연산자
    - 논리 연산자는 논리적 조건을 평가하고, 두 개 이상의 조건을 결합하여 논리 연산을 수행합니다. 주요 논리 연산자로는 논리 AND(&&), 논리 OR(||), 논리 NOT(!) 등이 있습니다.
    - '&&', '||', '??'
 - 할당 연산자
    - 할당 연산자는 변수에 값을 할당합니다. 가장 기본적인 할당 연산자는 등호(=)이며, 다른 연산자와 결합하여 간단한 할당과 동시에 연산을 수행할 수 있습니다.
    - '=', '*=', '/=', '+=', '-=', '&=', '^='
 - 기타 연산자
    - 프로그래밍 언어에 따라 다양한 다른 연산자가 존재할 수 있으며, 이러한 연산자는 특수한 용도로 사용됩니다. 예를 들어, 삼항 연산자(조건부 연산자)는 조건에 따라 값을 선택하는 데 사용됩니다.
    - 삼항 연산자, 비트 연산자 등
 - Null Safety 타입과 연산자
    - Dart는 2.12 버전부터 Null 값에 대한 안정성을 위해 Null Safety라는 개념이 도입되어 관련한 추가 타입과 연산자가 존재한다.
    - Nullable Type
        - Null을 허용하는 타입으로 변수 뒤에 '?'을 붙여 활용한다.
        - int?, double?, bool?, String? 등
    - Non-nullable Type
        - Null을 비허용하는 타입으로 변수 뒤에 '!'을 붙여 활용한다. 만약, 해당 값이 null인 경우 에러가 발생한다.
        - int!, double!, bool!, String! 등

```Dart
void main() {
  // 산술 연산자
  //  사칙 연산(+, -, *, /)
  int num1 = 10;
  int num2 = 20;
  double num3 = num1 / num2; // ✔ 나눗셈 연산자는 double로 반환된다.
  
  print(num1 + num2); // 10 + 20 = 30
  print(num1 - num2); // 10 - 20 = -10
  print(num1 * num2); // 10 * 20 = 200
  print(num1 / num2); // 10 / 20 = 0.5
  
  //  문자열 사칙 연산
  String str1 = 'Hello';
  String str2 = str1 + ' World';
  String str3 = '$str1 World';
  
  print(str2);
  print(str3);
  
  // 비교 연산자
  print(num1 == num2); // ✔ 동등 비교는 '=='을 사용한다. '='는 할당 연산자이다.
  print(num1 != num2); // 10과 20은 다르기 떄문에 true
  print(num1 < num2); // 10은 20보다 작기 떄문에 true
  print(num1 > num2); // 10은 20보다 작기 떄문에 false
  
  // 논리 연산자 (&&(and), ||(or))
  print(true && false); // and 연산은 모두 참이여야 true 반환
  print(true || false); // or 연산은 하나라도 참이면 true 반환
  
  // 삼항 연산자 (논리연산 ? 참일경우값 : 거짓일경우값)
  String letter = 10 < 20 ? '참' : '거짓';
  print(letter); // 10이 20보다 작은 것이 참으로 '참'이 출력된다.
  
  // 할당 연산자 (=, +=, -=)
  int temp = 10;
  temp += 20; // temp = temp + 20 => 10 + 20 => 30
  print(temp); // 30
  
  // Null 처리 연산자
  int? nullableNumber = null;
  // int! nonNullableNumber = null; // ❌ Null 값이 허용되지 않는다.
  
  print(null ?? 'Null 대체 값'); // ✔ Null 대체 값이 출력된다.
  print(10 ?? 'Null 대체 값'); // ✔ 10은 null이 아니기 때문에 10이 출력된다.
}
```

<br/>

## Dart 클래스

클래스(Class)는 객체 지향 프로그래밍(Object-Oriented Programming, OOP)에서 중요한 개념 중 하나로, 객체를 생성하기 위한 일종의 설계 도면 또는 템플릿을 나타냅니다. 클래스는 객체(Object)를 만들기 위한 속성(데이터)과 메서드(동작)의 집합을 정의하며, 이를 기반으로 여러 객체를 생성할 수 있습니다. 객체는 클래스의 인스턴스(Instance)이며, 클래스는 객체를 생성하기 위한 틀을 제공합니다. 
 - 클래스는 일종의 객체를 만들기 위한 템플릿으로 클래스를 활용하여 일종의 데이터와 코드를 그룹화해서 관련된 코드를 같이 유지하고, 객체를 쉽게 만들어 객체지향 프로그래밍을 효과적으로 활용할 수 있다. 
 - 클래스의 구성 요소
    - 필드
        - 클래스 내부에 선언된 데이터 (변수/상수 등)
        - 클래스 내부에는 객체의 상태나 속성을 나타내는 변수들이 포함됩니다. 이러한 변수들은 클래스의 특성을 나타내며, 종종 "멤버 변수" 또는 "속성"으로 불립니다.
    - 메서드
        - 클래스 내부에 선언된 기능 (함수)
        - 클래스 내부에는 객체가 수행할 수 있는 동작을 정의하는 메서드(함수)가 포함됩니다. 메서드는 클래스 내의 데이터를 조작하거나 다른 객체와 상호 작용하는 데 사용됩니다.
    - 생성자
        - 클래스 인스턴스를 생성할 때 사용되는 코드로 생성시 특정 작업을 지시하는 등의 활용이 가능
        - 생성자를 통해 매개변수를 전달하거나, 클래스 내 필드의 초기값을 설정하는 등의 작업을 할 수 있습니다.
        - Default constructors: 기본 생성자로 생성자를 선언하지 않을 경우 제공되는 생성자
        - Named constructors: 개발자가 필요에 의해 생성한 생성자로 클래스에 대한 여러 생성자를 구현하거나, 추가적인 클래스의 명확성을 제공
        - Redirecting constructors: 목적이 동일한 생성자로 전달하기 위한 생성자로 생성자의 본문은 비어있지만, 전달된 생성자에 대한 초기값 등을 구현할 때 활용
        - Const constructors: 상수 생성자로 클래스가 불변의 객체를 생성하는 경우 활용
        - Factory constructors: 매번 새로운 인스턴스를 만들지 않는 생성자를 활용할 때 사용하며, 이미 존재하는 인스턴스를 반환하거나 단순한 초기값 부여가 아닌 연산이 필요한 객체 생성시 활용

```Dart
void main() {
  //  기본 생성자
  Point point = new Point();
  point.x = 3;
  point.y = 5;
  print(point.x);
  print(point.y);
  
  // 명명 생성자
  Person person = new Person("로그", 27);
  print(person.name);
  print(person.age);
}

// 기본 생성자
class Point {
  double? x;
  double? y;
}

// 명명 생성자
class Person {
  String name;
  int age;
  
  Person(this.name, this.age);
}
```
