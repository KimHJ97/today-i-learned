

## DOM 이란?

DOM은 문서 객체 모델(Document Object Model)의 줄임말입니다. 이는 프로그래밍 언어에서 웹 페이지의 구조, 콘텐츠 및 스타일에 대한 동적인 접근과 조작을 가능하게 하는 인터페이스를 의미합니다. DOM은 HTML, XHTML 또는 XML 문서를 트리 구조로 나타내어 각 요소에 대한 접근 및 조작을 허용하여 웹 애플리케이션의 상호작용성과 동적인 동작을 가능케 합니다. 주로 JavaScript를 통해 DOM에 접근하고 조작하며, 웹 개발에서 중요한 역할을 합니다.  

 - 문서 객체 모델(Document Object Model)로 스크립트 언어로 HTML 요소를 제어할 수 있도록 웹 문서를 객체화 한 것을 말한다.
 - MDN 문서: https://developer.mozilla.org/ko/docs/Web/API/Document_Object_Model/Introduction

```javascript
// 최상위 노드 접근
document.getRootNode();

// 하위 노드 접근
document.childNodes[1].childNodes[2];

// 셀렉터로 노드 접근
let header = document.querySelector('h1');
header.textContent = '제목1';
```

<br/>

## BOM 이란?

BOM은 브라우저 객체 모델(Browser Object Model)의 줄임말입니다. 이는 웹 브라우저의 창이나 프레임을 프로그래밍적으로 제어하기 위한 인터페이스를 제공합니다. BOM은 웹 브라우저의 창과 관련된 객체들을 포함하며, 이를 통해 브라우저의 크기, 위치, 히스토리 등에 접근하고 조작할 수 있습니다. 주로 JavaScript를 사용하여 BOM에 접근하고 조작하며, 웹 애플리케이션의 동작을 제어하는 데 사용됩니다.  

 - 브라우저 객체 모델(Browser Object Model)
 - 웹 문서 영역을 제어할 수 있도록 document 객체를 제공한다. document 객체는 웹 페이지 자체를 의미하며, DOM 트리의 최상위 노드이다. document 객체를 통해 원하는 HTML 노드에 접근할 수 있다.

<br/>

### Browser 객체

 - __window__
    - 모든 객체가 소속된 객체이며, 브라우저 창을 의미한다.
```javascript
// 새 탭 열기
window.open('https://google.com');
open('https://google.com');

// 탭 닫기
window.close();

// 경고창 출력
window.alert("경고");
alert("경고");
```

<br/>

 - __document__
    - 현재 문서에 대한 정보를 갖고 있는 객체이다.
    - HTML 웹 문서는 브라우저에 의해 해석되면서 DOM Tree로 변환된다. document는 이러한 DOM에 대한 정보를 갖고 있다. 즉, document 객체에서 제공하는 메서드로 DOM 객체들을 제어할 수 있다.
```javascript
// document 객체도 window 객체의 소속된 객체이다.
window.document

// DOM 노드 접근
document.querySelector('#id');

// DOM 노드 접근 및 텍스트 수정
document.querySelector('#id').textContent = '텍스트 변경';
```

<br/>

 - __history__
    - 현재의 브라우저가 접근했던 URL hisotry를 제어할 수 있다.
```javascript
// 뒤로 가기
history.back();

// 앞으로 가기
history.forward()
```

<br/>

 - __location__
    - 문서의 주소와 관련된 객체로 window 객체의 프로퍼티인 동시에 document의 프로퍼티이다. 해당 객체를 이용하면 윈도우의 문서 URL을 변경할 수 있고, 문서의 위치와 관련해서 다양한 정보를 얻을 수 있다.
```javascript
// 웹 문서에 대한 정보 얻기
location.host;

// 웹 문서 주소 변경
location.href = 'https://google.com';
```

<br/>

 - __screen__
    - 사용자의 디스플레이 화면에 대한 정보를 갖고 있는 객체이다.
```javascript
// 사용자 디스플레이 정보 얻기
// availHeight, availLeft, availTop, availWidth, colorDepth, height
console.dir(screen);
```

<br/>

 - __navigator__
    - 실행중인 애플리케이션(브라우저)에 대한 정보를 얻을 수 있다. 크로스 브라우징 이슈를 해결할 때 사용할 수 있다.
```javascript
// 현재 애플리케이션 위치 정보 얻기
navigator.geolocation.getCurrentPosition();

// 앱(브라우저) 이름 얻기
navigator.appName

// 앱(브라우저)에 대한 버전 얻기
navigator.appVersion

// 서버에 요청할 때 앱(브라우저)에 대한 정보 얻기
navigator.userAgent

// ex) 위치 정보
navigator.geolocation.getCurrentPosition(function(pos) {
    var crd = pos.coords;

    console.log("Your current position is:");
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
});
```
