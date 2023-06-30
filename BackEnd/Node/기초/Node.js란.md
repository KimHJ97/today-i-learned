# Node.js란

## 자바스크립트 엔진

컴퓨터는 오직 0과 1의 숫자만을 이해할 수 있다.  
때문에, 우리가 작성하는 자바스크립트 코드를 실행하기 위해서는 자바스크립트 엔진이 필요하다.  
자바스크립트 엔진은 인터프리터로서 자바스크립트 코드를 컴퓨터가 이해할 수 있는 기계어로 번역해준다.  

<br/>

---
## JIT Compiliation (Just In Time)

초기 자바스크립트 엔진은 단순히 인터프리터의 역할을 수행하였지만, 현재는 JIT Compiliation을 이용한다.  
인터프리터 언어는 한줄씩 해석하고 실행하기 때문에 다른 컴파일 언어보다 느리다는 단점이 있다.  
최근 웹 프로젝트의 크기가 커지고, 다양하고 무거운 기능을 수행할 수 있게 되었다.  
때문에 자바스크립트 코드의 더 나은 퍼포먼스를 위해서 JIT 컴파일을 이용하고 있다.  
 - 코드 -> 인터프리터 -> 실행
 - 코드 -> 컴파일러 -> 기계어 -> 결과

<br/>

---
## REPL

REPL은 Read-Eval(evaluation)-Print Loop의 약어로 사용자가 특정 코드를 입력하면 그 코드를 평가하고 코드의 실행 결과를 출력해주는 것을 반복해주는 환경을 말한다.  
REPL 환경은 자바스크립트 학습 중에 간단한 자바스크립트 코드 등을 즉석에서 바로 실행해 결과를 확인해 볼 때 주로 사용한다.  
 - V8 엔진이 하나씩 해석해준다.
 - REPL 환경은 자바스크립트 학습 중에 간단한 자바스크립트 코드 등을 즉석에서 바로 실행해 결과를 확인해 볼 때 주로 사용한다.
 - REPL 환경에서 나오는 방법은 .exit를 입력하거나, Ctrl + C를 두번 입력하면 된다.

<br/>

---
## Browser API & Node.js API

브라우저에서만 사용할 수 있는 API가 있고, Node.js 에서만 사용할 수 있는 API가 있다. 또한, 브라우저와 Node.js 모두 사용할 수 있는 API가 있다.  
 - window 객체: window 객체는 브라우저에서 제공하는 객체로 Node.js 환경에서 사용할 수 없다.
 - process 객체: process 객체는 Node.js에서 제공하는 객체로 브라우저에서 사용할 수 없다.

<br/>

---
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

---
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

---
## libuv (유니콘 벨로시랩터 라이브러리)

이벤트 루프를 기반으로 하는 비동기 I/O에 대한 지원을 제공하는 다중 플랫폼 C 라이브러리이다.  
주로 Node.js에서 사용하도록 개발되었지만 Julia, Luvit, pyuv 등과 같은 다른 도구에서도 사용된다.  
Node.js는 이 라이브러리를 사용하여 지원되는 모든 플랫폼에서 통합 인터페이스로 I/O 작업을 추상화한다.  
즉, libuv를 쓰면 각 플랫폼(Window, Mac, Linux)의 가장 빠른 비동기 IO 인터페이스로 통일된 코드로 돌릴 수 있는 장점이 있다.
 - 이 라이브러리는 파일 시스템, DNS, 네트워크, 파이프, 신호 처리, 폴링 및 스트리밍을 처리하는 메커니즘을 제공한다.
 - 컴퓨터 내부 또는 외부의 자잋와 프로그램간의 데이터를 주고 받는 입출력(I/O) 작업 제공

<br/>

---
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

---
## Node.js가 비동기 작업을 처리하는 방법

노드 JS는 자바스크립트 언어를 사용한다.  
자바스크립트 언어는 싱글 스레드로 동작한다.  
싱글 스레드는 한 번에 하나의 작업만 수행할 수 있는데, 어떻게 노드 JS에서 비동기 작업을 수행할 수 있을까?  

<br/>

노드는 Libuv에서 제공하는 Event Loop를 이용한다.  
 - Livbuv의 Thead Pool
   - Libuv에 있는 Event Loop 덕분에 비동기 I/O 작업을 처리할 수 있다.
   - 노드를 사용할 때 비동기 함수를 콜 하면 이벤트 루프로 전달된다.
   - 파일 시스템과 네트워크 작업도 똑같이 이벤트 루프로 전달된다.
   - Event Loop는 언제 코드를 실행할지 정하며, OS에게 이 비동기 함수를 실행하라고 전달하고, 일이 끝나면 끝났다고 전달받는다.
   - 결국 새로운 이벤트를 계속 Listen하고 OS에 전달하므로 인해서 Main Thread가 블록되지 않게 한다.
   - I/O-intensive
      - DNS: dns.lookup(), dns.looupService()
      - File System: All file system APIs except fs.FSWatcher() and ..
   - CPU-intensive
      - Crypto: crypto.pbkdf2(), crypto.srypt(), crypto.randomByte(), ..
      - Zlib: All zlib APIs except those that are explicity ..
 - Kernel
   - Kernel은 OS의 핵심 부분이며, 컴퓨터의 하드웨어와 통하며, 여러 스레드를 가지고 있다.
   - 인터넷을 통해서 다른 컴퓨터와 통신하는 것 같은 기본적인 oPERATION을 잘 처리한다.
   - Network

<br/>

### Event Loop에서 일을 전달할 때 어디로 전달하는가?

File System은 Thread Pool로, Network는 OS에 있는 커널로 직접 전달한다.  
 - Libuv는 C로 쓰여 있기 때문에 Thread Pool을 가지고 있다.
   - Main Thread는 V8 엔진과 Node.js binding 부분과 Libuv 부분을 담당한다.
   - 쓰레드는 기본적으로 4개이며, 128개까지 늘어날 수 있다. (메인 + 스레드4개)
   - Node.js는 I/O작업을 자신의 메인 스레드가 아닌 다른 스레드에 위임함으로써 싱글 스레드로 논 블로킹 I/O를 지원한다. 다르게 말하면 Node.js는 I/O 작업을 Libuv에게 위임함으로써 논 블로킹 I/O를 지원하고 그 기반에는 이벤트 루프가 있다.

<br/>

---
## Event Loop란?

이벤트 루프는 Node.js가 여러 비동기 작업을 관리하기 위한 구현체이다.  
즉, 비동기 작업들을 모아서 관리하고 순서대로 실행할 수 있게 해주는 도구이다.  

<br/>

### Event Loop 구조

각 단계는 특정 작업을 수행하기 위한 페이즈(Phase)를 의미한다.  
그리고 한 페이즈에서 다음 페이즈로 넘어가는 것을 틱(Tick)이라고 부른다.  
각 단계(Phase)에서는 각각의 큐가 있다. 예를 들어 settimeout 함수가 불러지면 timer라는 페이즈에 있는 큐에 쌓이게 된다. 그리고 이 큐는 FIFO로 먼저 들어온게 먼저 나가게 되어있다.  
또한, 싱글 스레드이기 때문에 timers 페이즈에 있는 일을 끝내거나 최대 콜백 수가 될 때까지 한 후에 다른 단계로 이동하게 된다.  
 - timers
   - setTimeout() 및 setInterval()에 의해 예약된 콜백을 실행한다.
 - pending callbacks
   - TCP 오류 유형과 같은 일부 시스템 작업에 대한 콜백을 실행한다.
 - idle, prepare
   - 내부적으로만 사용된다. 이 단계에서 이벤트 루프는 아무 작업도 수행하지 안흔다. 유휴 상태로 다음 단계로 이동할 준비를 한다.
 - poll
   - 대부분의 I/O 관련 콜백을 실행한다. (close 콜백, 타이머에 의해 예약된 콜백 및 setImmediate()을 제외하고 거의 모든 것)
 - check
   - setImmediate() 콜백이 호출된다.
 - close callbacks
   - 이벤트 루프는 socket.on('close', fn) 또는 process.exit()와 같은 종료 이벤트와 관련도니 콜백을 실행한다. 이벤트 루프의 각 실행 사이에 Node.js는 비동기 I/O 또는 타이머를 기다리고 있는지 확인하고 없는 경우 완전히 종료한다.

<br/>

---
## Event Loop 심화

#### Timer

Timer phase는 이벤트 루프의 시작을 알리는 페이즈이다.  
이 페이즈가 가지고 있는 큐에는 setTimeout이나 setInterval 타이머들의 콜백을 저장하게 된다.  
이 부분에서 바로 타이머들의 콜백이 큐에 들어가는 것은 아니며 타이머들은 min heap에 들어가 있게 된다.  
힙에 만료된 타이머가 있는 경우 이벤트 루프는 연결된 콜백을 가져와 타이머 대기열이 비어있을 때까지 지연의 오름차순으로 실행을 시작한다.  
 - min heap은 데이터를 이진트리 형태로 관리하며 최솟값을 찾아내는 데 효율적인 구조. 그래서 가장 먼저 실행되는 Timer를 손쉽게 발견할 수 있다.

<br/>

#### Poll

Event Loop가 Poll Phase에 들어왔다면 다음과 같은 Queue에 들어 있는 일을 처리해준다.  
 - 데이터베이스 관련 작업으로 인한 결과가 왔을 때 실행되는 콜백
 - HTTP 요청으로 인한 응답이 왔을 때 실행되는 콜백
 - 파일을 비동기로 읽은 후에 실행되는 콜백

<br/>

Pool Phase는 또한 다른 Phase와 다르게 Poll Phase에 일이 다 소진되더라도 바로 다음 Phase로 이동하는 것은 아니다.  
이벤트 루프가 Pool 단계에 들어가고 예약된 타이머가 없으면 다음 두 가지 중 하나가 발생한다.
 - 1. 폴 큐가 비어있지 않은 경우: 이벤트 루프는 큐가 소진되거나 시스템의 실행 한도에 도달할 때까지 동기적으로 콜백을 실행하는 콜백 큐를 반복한다.
 - 2. 폴 큐가 비어있으면: 다음 두 가지 중 하나가 더 발생한다.
   - 스크립트가 setImmediate()에 의해 예약된 경우 이벤트 루프는 폴링 단계를 종료하고 예약된 스크립트를 실행하기 위해 Check 단계로 계속된다.
   - 스크립트가 setImmediate()에 의해 예약되지 않은 경우 이벤트 루프는 콜백이 Queue에 추가될 떄까지 기다렸다가 즉시 실행된다.

폴 큐가 비어있으면 이벤트 루프는 시간 임계값에 도달한 타이머를 확인한다.  
하나 이상의 타이머가 준비되면 이벤트 루프는 타이머 단계로 동라가 해당 타이머의 콜백을 실행한다.

<br/>

#### Check

이 단계에서는 Poll 단계가 완료된 직후 콜백을 실행할 수 있다.  
폴 단계가 Idle 상태가 되고 스크립트가 setImmediate()를 사용하여 Queue에 지정된 경우 이벤트 루프는 기다리지 않고 Check 단계를 계속할 수 있다.  

<br/>

## Node.js Event Emitter

브라우저에서 JavaScript로 작업한 경우마우스 클릭, 키보드 버튼 누르기, 마우스 움직임에 대한 반응 등과 같은 이벤트를 통해 사용자 상호 작용이 얼마나 처리되는지 알 수 있다.  
백엔드측 Node.js도 event-driven 시스템을 이용해서 작동된다.  
 - 이벤트를 처리하는데 사용할 수 있는 EventEmitter 클래스가 제공된다.

```JS
const EventEmitter = require('events');
const celebrity = new EventEmitter();

// on은 이벤트가 트리거될 때 실행될 콜백 함수를 추가하는 데 사용된다.
celebrity.on('update post', () => {
  console.log('This post is so awesome!');
});

celebrity.on('update post', () => {
  console.log('I like this post!');
});

// emit은 이벤트를 트리거하는 데 사용된다.
  // emit()에 추가 인수로 전달하여 이벤트 핸들러에 인수를 전달할 수 있다.
  // celebrity.emit('update post', 'message');
  // celebrity.on('update post', (args) => { console.log(args) }); // message
celebrity.emit('update post');
```