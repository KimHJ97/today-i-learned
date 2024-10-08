# TypeScript

TypeScript는 Microsoft에서 개발한 오픈 소스 프로그래밍 언어로, JavaScript의 상위 집합(Superset)입니다. TypeScript는 JavaScript에 정적 타입(Static Type)을 추가한 언어로, JavaScript 코드와 완전히 호환되며 더 큰 규모의 애플리케이션을 개발할 때 도움이 되는 여러 기능을 제공합니다.  

## Type 종류

 - Primitive Types
    - string: 문자열
    - number: 숫자
    - boolean: true/false
    - null: null
    - undefined: 초기화되지 않은 변수
    - symbol: 고유한 상수
 - Object Types
    - function: 함수
    - array: 배열
    - classes: 클래스
    - object: 객체
```typescript
// function
coinst getNumber = (i: number): void => {
    console.log(i);
}

// array
const arr: string[] = ['a', 'b', 'c'];

// class
class Music { }
let music: Music = new Music();

// object
let point: { x: number; y: number } = { x: 20, y: 10 };
```
 - 추가 타입
    - Any: 모든 타입을 허용 (noImplicitAny 옵션 허용시 any 타입 사용하지 못하도록 함)
    - Union: 변수 또는 함수 매개변수에 대해 둘 이상의 데이터 유형 사용 가능
    - Tuple: 배열 타입을 보다 특수한 형태로 사용할 수 있음, tuple에 명시적으로 지정된 형식에 따라 아이템 순서를 설정해야 되고, 추가되는 아이템 또한 tuple에 명시된 타입만 사용 가능
    - Enum: 열거형으로 값들의 집합을 명명하고 이를 사용하도록 한다. 속성값으로는 문자열과 숫자만 허용한다.
    - Void: 함수가 값을 반환하지 않으면 반환 유형으로 void를 지정한다. (사실 undefined가 반환된다.)
    - Never: Never 타입은 어떤 일이 절대로 일어나지 않을 것이라고 확신할 때 사용된다. 함수의 리턴 타입으로 never가 사용될 경우, 항상 오류를 리턴하거나 리턴 값을 절대로 내보내지 않음을 의미한다.
```typescript
// Any 타입
let something: any = "Hello World!";
something = 23;
something = true;

let arr: any[] = ["John", 212, true];
arr.push("Smith");

// Union 타입
let code: (string | number);
code = 123; // ✔
code = "ABC"; // ✔
code = false; // ❌ Compile Error

// Tuple 타입
var employee: [number, string] = [1, "Steve"];
var person: [number, string, boolean] = [1, "Steve", true];
var user: [number, string, boolean, number, string];
user = [1, "Steve", true, 20, "Admin"];

var employee: [number, string][];
employee = [[1, "Steve"], [2, "Bill"]];

var employee: [number, string] = [1, "Steve"];
employee.push(2, "Bill");

// Enum 타입
enum PrintMedia {
    Newspaper,      // 0
    Newsletter,     // 1
    Magazine,       // 2
    Book            // 3
}
let mediaType: number = PrintMedia.Book // 3
let type: string  PrintMedia[3] // Book

export enum LanguageCode {
    korean = 'ko',
    english = 'en',
    japanese = 'ja',
    chinese = 'zh'
}
const code: LanguageCode = LanguageCode.english

// Void 타입
function sayHi(): void {
    console.log('hi');
}
let speech: void = sayHi();
console.log(speech); // undefined

// Never 타입
function throwError(errorMsg: string): never {
    throw new Error(errorMsg);
}

function keepProcessing(): never {
    while (true) {
        console.log('.');
    }
}
```

## Type Assertion

TypeScript에서 Type Assertion(타입 단언)이란, 특정 값이 우리가 예상하는 타입이라는 것을 TypeScript 컴파일러에게 명확히 알려주는 방법입니다. Type Assertion은 TypeScript가 추론한 타입을 개발자가 직접 변경하거나, 타입 추론이 불완전할 때 명시적으로 타입을 지정하는 데 사용됩니다. 이를 통해 타입에 대한 보다 세부적인 제어를 할 수 있습니다.  
Type Assertiong 을 사용하는 문법은 Angle Bracket 문법과 as 문법이 존재합니다. React에서는 JSX 문법과 겹치기 떄문에 as 문법을 많이 사용합니다.  

 - Angle Bracket 문법
```typescript
let someValue: any = "this is a string";
let strLength: number = (<string>someValue).length;

console.log(strLength); // 출력: 16
```

 - as 문법
```typescript
let someValue: any = "this is a string";
let strLength: number = (someValue as string).length;

console.log(strLength); // 출력: 16
```

 - 언제 Type Assertiong을 사용하는가
    - __타입 추론이 불완전한 경우__: TypeScript가 정확한 타입을 추론하지 못하는 경우에 사용합니다. 예를 들어, DOM에서 엘리먼트를 가져올 때, TypeScript는 기본적으로 HTMLElement 타입을 추론합니다. 그러나 특정 엘리먼트에 더 구체적인 타입을 사용해야 하는 경우, Type Assertion이 유용합니다.
    - __값이 여러 가지 타입을 가질 수 있는 경우__: 타입을 명확하게 정의하지 않으면, TypeScript는 값을 넓은 범위의 타입으로 추론할 수 있습니다. 예를 들어 any 타입으로 선언된 값이 있을 때, 특정 타입으로 단언해야 사용할 수 있는 속성들이 있습니다.
```typescript
// 타입 추론이 불완전한 경우
let inputElement = document.getElementById("inputField") as HTMLInputElement;
inputElement.value = "TypeScript"; // HTMLInputElement임을 명시

// 값이 여러 가지 타입을 가질 수 있는 경우
function getLength(something: any): number {
    if ((something as string).length !== undefined) {
        return (something as string).length;
    }
    return something.toString().length;
}
```
