# Node.js란

## 자바스크립트 엔진

컴퓨터는 오직 0과 1의 숫자만을 이해할 수 있다.  
때문에, 우리가 작성하는 자바스크립트 코드를 실행하기 위해서는 자바스크립트 엔진이 필요하다.  
자바스크립트 엔진은 인터프리터로서 자바스크립트 코드를 컴퓨터가 이해할 수 있는 기계어로 번역해준다.  

<br/>

## JIT Compiliation (Just In Time)
초기 자바스크립트 엔진은 단순히 인터프리터의 역할을 수행하였지만, 현재는 JIT Compiliation을 이용한다.  
인터프리터 언어는 한줄씩 해석하고 실행하기 때문에 다른 컴파일 언어보다 느리다는 단점이 있다.  
최근 웹 프로젝트의 크기가 커지고, 다양하고 무거운 기능을 수행할 수 있게 되었다.  
때문에 자바스크립트 코드의 더 나은 퍼포먼스를 위해서 JIT 컴파일을 이용하고 있다.  
 - 코드 -> 인터프리터 -> 실행
 - 코드 -> 컴파일러 -> 기계어 -> 결과

<br/>

## REPL

REPL은 Read-Eval(evaluation)-Print Loop의 약어로 사용자가 특정 코드를 입력하면 그 코드를 평가하고 코드의 실행 결과를 출력해주는 것을 반복해주는 환경을 말한다.  
REPL 환경은 자바스크립트 학습 중에 간단한 자바스크립트 코드 등을 즉석에서 바로 실행해 결과를 확인해 볼 때 주로 사용한다.  
 - V8 엔진이 하나씩 해석해준다.
 - REPL 환경은 자바스크립트 학습 중에 간단한 자바스크립트 코드 등을 즉석에서 바로 실행해 결과를 확인해 볼 때 주로 사용한다.
 - REPL 환경에서 나오는 방법은 .exit를 입력하거나, Ctrl + C를 두번 입력하면 된다.

<br/>

## Browser API & Node.js API

브라우저에서만 사용할 수 있는 API가 있고, Node.js 에서만 사용할 수 있는 API가 있다. 또한, 브라우저와 Node.js 모두 사용할 수 있는 API가 있다.  
 - window 객체: window 객체는 브라우저에서 제공하는 객체로 Node.js 환경에서 사용할 수 없다.
 - process 객체: process 객체는 Node.js에서 제공하는 객체로 브라우저에서 사용할 수 없다.

<br/>

## global 객체

 - 브라우저 API
    - window
    - document
    - history
    - location
    - navigator
 - Node.js API
    - global
    - process
    - module
    - filename
    - require()
 - 둘다 사용가능한 API
    - url
    - settimeout
    - console

<br/>

## Node.js가 작업을 처리하는 방법

기본적으로 런타임 환경에서 자바스크립트로 처리할 수 있는 작업은 V8 엔진을 통해서 동작하게 된다.  
하지만, 파일을 읽는 것 같은 작업은 V8 엔진으로 할 수 없다.  
이러한 부분은 libuv를 통해서 작업을 하게 된다.
 - V8: 자바스크립트 코드 실행
 - libuv: 자바스크립트 코드를 읽는 것 외에 데이터베이스 접근, 파일 읽기 등을 처리

```
# 인터넷에 있는 파일 다운로드 예시
 - 요약: V8이 코드를 해석하고 Node.js APIs 들 중 하나의 함수를 호출하고, Node.js 바인딩을 통해서 libuv에 의해서 원하는 작업을 처리한다.
1. Javascript로 파일 다운로드 요청을 보낸다.
2. Node.js http 모듈 API 사용
3. Node.js binding을 통해서 libuv로 할 일을 건네준다.
4. libuv를 통해서 파일을 다운로드한다. 이 시간 동안에 자바스크립트는 다른 일을 할 수 있다.
 - window, mac, Linux 등 파일 시스템 처리 방법이 다른데, 이것을 libuv가 핸들링해준다.
```

<br/>

## libuv (유니콘 벨로시랩터 라이브러리)

이벤트 루프를 기반으로 하는 비동기 I/O에 대한 지원을 제공하는 다중 플랫폼 C 라이브러리이다.  
주로 Node.js에서 사용하도록 개발되었지만 Julia, Luvit, pyuv 등과 같은 다른 도구에서도 사용된다.  
Node.js는 이 라이브러리를 사용하여 지원되는 모든 플랫폼에서 통합 인터페이스로 I/O 작업을 추상화한다.  
즉, libuv를 쓰면 각 플랫폼(Window, Mac, Linux)의 가장 빠른 비동기 IO 인터페이스로 통일된 코드로 돌릴 수 있는 장점이 있다.
 - 이 라이브러리는 파일 시스템, DNS, 네트워크, 파이프, 신호 처리, 폴링 및 스트리밍을 처리하는 메커니즘을 제공한다.
 - 컴퓨터 내부 또는 외부의 자잋와 프로그램간의 데이터를 주고 받는 입출력(I/O) 작업 제공

<br/>

## Blocking, Non-Blocking

Node.js 표준 라이브러리의 모든 I/O 메서드는 Non-Blocking 및 Callback 함수를 허용하는 비동기 버전을 제공한다. 일부 메서드에는 이름이 Sync로 끝나는 차단 상대도 있다.  

```JS
// Blocking
const fs = require('fs');
const data = fs.readFileSync('/file.md');
moreWork();

// Non-Blocking
const fs = require('fs');
fs.readFile('/file.md', (err, data) => {
    if(err) throw err;
});
moreWork();
```

<br/>

