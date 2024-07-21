# Reeact 기초

## DOM

DOM은 Document Object Model의 약자로 문서를 논리 트리롤 표현한다.  
문서 객체 모델(DOM)은 메모리에 웹 페이지 문서 구조를 표현함으로써 스크립트 및 프로그래밍 언어와 페이지를 연결한다.  

 - __순수 JS로 DOM 그리기__
    - 코드 샌드박스: https://codesandbox.io
```html
<!DOCTYPE html>
<html lang="ko">
<body>
    <div id="root"></div>
    <script>
        const rootElement = document.getElementById("root");
        const element = document.createElement("h1");
        element.textContent = "Hello, World!";
        rootElement.appendChild(element);
    </script>
</body>
</html>
```
<br/>

 - __순수 React JS로 DOM 그리기__
    - React CDN 문서: https://ko.reactjs.org/docs/cdn-links.html
    - 리액트에서 요소를 만들려면 createElement() 함수를 이용한다. 
        - const element = createElement(type, props, ...children)
        - type, prop, children를 인수로 제공하고 createElement을 호출하여 React 엘리먼트를 생성합니다.
```html
<!DOCTYPE html>
<html lang="ko">
<body>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

    <div id="root"></div>

    <script>
        const rootElement = document.getElementById("root");
        const element = React.createElement("h1", { children: "Hello, World!" });
        // const element = React.createElement("h1", null, "Hello, World!");
        ReactDOM.render(element, rootElement);
    </script>
</body>
</html>
```
<br/>

## JSX와 Babel, JSX 다루기

JSX는 문자열, HTML도 아닌 JavaScript 확장 문법이다.  
JSX는 React에서 확장한 문법으로 JavaScript는 해당 문법을 해석하지 못한다. 때문에, JSX로 작성된 코드를 JavaScript Compiler(Babel)를 이용하여 JavaScript 문법으로 변경하고 실행시켜야 한다.  
 - Babel: https://babeljs.io
    - Babel은 JavaScript Compiler로 다른 언어나 다른 문법으로 작성된 코드를 JavaScript로 변경해준다.
    - 예를 들어, JSX 문법으로 작성된 코드를 React.createElement() 등 JavaScript 함수로 변경해준다.
<br/>

 - __JSX로 DOM 그리기__
    - JSX는 React에서 확장한 문법으로 JavaScript에서 지원하지 않는다. 때문에, 실행 시점에 JavaScript 코드로 변경해주어야 한다.
    - HTML 문서에서 JavaScript Compiler를 적용하기 위해서는 컴파일러 스크립트를 로드하고, 스크립트 태그에 바벨이 컴파일할 코드를 정의해준다.
        - 스크립트 태그의 타입을 지정해준다.
```html
<!DOCTYPE html>
<html lang="ko">
<body>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script crossorigin src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

    <div id="root"></div>

    <script type="text/babel">
        const rootElement = document.getElementById("root");

        // 방법 1
        const element = <h1 className="title">Hello, World!</h1>

        // 방법 2
        const text = "Hello, World!";
        const titleClassName = "title";
        const element2 = <h1 className={titleClassName}>{text}</h1>

        ReactDOM.render(element, rootElement);
        
    </script>
</body>
</html>
```
<br/>

## 멀티 Element 생성하기

 - children에 들어가는 React Element는 JSX 문법으로 작성하고, Babel에 의해서 React.createElement()로 변경된다.
 - React에서 요소를 추가할 떄, children에 정의한다. 때문에, JSX로 처음 태그를 만들 떄 상위에 div 태그가 자동으로 추가된다.
    - 이러한 문제를 해결하기 위해 React에서는 React.Fragment 태그를 제공한다.
    - React.Fragment는 열고 닫는 태그 모양으로 줄여서 사용할 수도 있다.
```html
<!DOCTYPE html>
<html lang="ko">
<body>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script crossorigin src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

    <div id="root"></div>

    <script type="text/babel">
        const rootElement = document.getElementById("root");
        const element = (
            <div 
                children={
                    [
                        React.createElement("h1", null, "Hi"),
                        React.createElement("h3", null, "Bye")
                    ]
                } 
            />
        );

        const element2 = (
            <React.Fragment
                children={
                    [
                        React.createElement("h1", null, "Hi"),
                        React.createElement("h3", null, "Bye")
                    ]
                } 
            />
        );

        const element3 = (
            <React.Fragment
                children={
                    [
                        <h1>Hi</h1>,
                        <h3>Bye</h3>
                    ]
                }
            />
        );

        const element4 = (
            <React.Fragment>
                {[<h1>Hi</h1>, <h3>Bye</h3>]}
            </React.Fragment>
        );

        const element5 = (
            <React.Fragment>
                <h1>Hi</h1>
                <h3>Bye</h3>
            </React.Fragment>
        );

        const element6 = (
            <>
                <h1>Hi</h1>
                <h3>Bye</h3>
            </>
        );

        ReactDOM.render(element5, rootElement);
    </script>
</body>
</html>
```
<br/>

## Element 찍어내기

 - JSX 기반의 엘리먼트는 대문자로 시작해야 한다. (기존에 있는 HTML 태그와 혼동하지 않기 위함)
```html
<div id="root"></div>

<script type="text/babel">
    const rootElement = document.getElementById("root");
    const Paint = ({title, description, children}) => (
        <>
            <h1>{title}</h1>
            <h3>{description}</h3>
            {children}
        </>
    );

    const element = (
        <>
            <Paint title="Good" description="좋다">
                <span>칠드런으로 넘어감</span>
            </Paint>
            <Paint title="Bad" description="나쁘다"/>
            <Paint title="So so" description="보통"/>
        </>
    );

    ReactDOM.render(element, rootElement);
</script>
```
<br/>

## JS와 JSX 섞어쓰기

 - 예시1
```html
<div id="root"></div>

<script type="text/babel">
    const rootElement = document.getElementById("root");
    const Text = ({ text }) => {
        // text가 대문자로 시작하면 h1, 소문자로 시작하면 h3 태그 반환
        if (text.charAt(0) === text.charAt(0).toUpperCase()) {
            return (
                <h1>{text}</h1>
            );
        } else {
            return <h3>{text}</h3>
        }
    };

    const element = (
        <>
            <Text text="Text"/>
            <Text text="text"/>
        </>
    );

    ReactDOM.render(element, rootElement);
</script>
```
<br/>

 - 예시2
```html
<div id="root"></div>

<script type="text/babel">
    const rootElement = document.getElementById("root");
    
    function Number({ number }) {
        // number가 짝수면 h1, 홀수면 h3
        return number % 2 === 0 ? <h1>{number}</h1> : <h3>{number}</h3>;
    }

    const element = <>
        <Number number={1}/>
        <Number number={2}/>
        <Number number={3}/>
    </>;

    ReactDOM.render(element, rootElement);
</script>
```
<br/>

 - 예시3 반복문
```html
<div id="root"></div>

<script type="text/babel">
    const rootElement = document.getElementById("root");
    
    function Number({ number, selected }) {
        return selected ? <h1>{number}</h1> : <h3>{number}</h3>;
    }

    const element = <>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => {
            return <Number number={number} selected={true} />
        })}
    </>;

    const element2 = <>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
            <Number number={number} selected={number === 3} />
        ))}
    </>;

    ReactDOM.render(element, rootElement);
</script>
```
<br/>

## 리액트 리렌더링 알아보기

바닐라 JS에서는 변경으로 인해 Element를 다시 그리고, React는 변경된 부분만을 다시 그린다.  

```html
<div id="root"></div>

<!-- JS 코드
<script>
    const rootElement = document.getElementById("root");
    function random() {
        const number = Math.floor(Math.random() * (10 - 1) + 1);
        const element = `
            <button>${number}</button>
        `;
        rootElement.innerHTML = element;
    }

    setInterval(random, 1000);
</script>
-->
<!-- React 코드 -->
<script type="text/babel">
    const rootElement = document.getElementById("root");
    function random() {
        const number = Math.floor(Math.random() * (10 - 1) + 1);
        const element = <button>{number}</button>;
        ReactDOM.render(element, rootElement);
    }

    setInterval(random, 1000);
</script>
```
<br/>

### 렌더링 된 엘리먼트 업데이트하기

리액트 엘리먼트는 불변 객체이다. 엘리먼트를 생성한 이후에는 해당 엘리먼트의 자식이나 속성을 변경할 수 없다.  
UI를 업데이트하는 방법은 새로운 엘리먼트를 생성하고 이를 render()로 전달하는 것이다.  
React DOM은 해당 엘리먼트와 그 자식 엘리먼트를 이전의 엘리먼트와 비교하고 DOM을 원하는 상태로 만드는데 필요한 경우에만 DOM을 업데이트한다.  
 - 문서: https://ko.reactjs.org/docs/rendering-elements.html
 - 재조정 문서: https://ko.reactjs.org/docs/reconciliation.html
    - 엘리먼트 타입이 바뀌면, 이전 엘리먼트는 버리고 새로 그린다.
    - 엘리먼트 타입이 같다면, key를 먼저 비교하고, props를 비교해서 변경사항을 반영한다.

<br/>

## 이벤트 핸들러

바닐라 자바스크립트에서는 addEventListener() 함수를 사용하거나, 태그 자체에 on{event} 를 이용해서 사용할 수 있다.  

 - 인라인 방식: 태그 내부에 이벤트 정의
```html
<button onclick="documenet.getElementById('demo').innerHTML=Date()">The time is?</button>
<p id="demo"></p>
```
<br/>

 - 자바스크립트 방식
```html
<button id="">The time is?</button>
<p id="demo"></p>

<script>
    const button = document.getElementById('button');
    button.addEventListener("click", () => documenet.getElementById('demo').innerHTML=Date() )
</script>
```

 - 리액트 이벤트 핸들러
    - 리액트 엘리먼트에 이벤트 핸들러를 등록하기 위해서는 카멜케이스로 작성해야 한다.
```html
    <div id="root"></div>

    <!-- React 코드 -->
    <script type="text/babel">
        const rootElement = document.getElementById("root");

        const handleClick = () => alert('pressed')
        const element = (
            <button 
                onClick={handleClick}
                onMouseOut={() => alert("bye")}
            >Press</button>
        );
        ReactDOM.render(element, rootElement);
    </script>
```
<br/>

## 컴포넌트 상태 다루기 - useState

```html
    <script type="text/babel">
        const rootElement = document.getElementById("root");

        const App = () => {
            const [keyword, setKeyword] = React.useState("");

            function handleChange(event) {
                setKeyword(event.target.value);
            }
            
            return (
                <>
                    <input onChange={handleChange} />
                    <button onChange={handleClick}>search</button>
                    <p>
                        {`Looking for ${keyword}`}
                    </p>
                </>
            )

        }

        ReactDOM.render(<App/>, rootElement);
    </script>
```
<br/>

## 컴포넌트 사이드 이팩트 다루기 - useEffect

사이드 이팩트는 부수 효과라는 뜻으로 리액트에서 어떠한 변경이나 효과가 일어날 떄, 다른 곳에 부수적인 효과를 내기 위한 기능을 말한다.  

```javascript
// 첫 렌더링시 실행(초기화 함수로 사용)
React.useEffect(() => {
    // ..
}, []);

// 특정 변수가 바뀌었을 때 마다 실행: 특정 상태가 바뀌었을 때 부수 효과를 줄 수 있음
React.useEffect(() => {
    // ..
}, [keyword]);

// 모든 변화에 부수 효과 수행
React.useEffect(() => {
    // ..
});

// 컴포넌트가 언마운트 될 때 부수 효과 수행
React.useEffect(() => {
    // ..

    return () => {
        // 종료시 수행
    }
})
```
<br/>

## 커스텀 훅 만들기

useState나 useEffect가 반복 사용되는 경우 함수를 따로 정의하여 커스텀 훅처럼 사용할 수 있다.  
커스텀하게 만든 함수 내에서 useState, useEffect를 정의하고, 필요한 곳에서 해당 함수를 호출하는 방식을 이용한다.  

```html
    <script type="text/babel">
        const rootElement = document.getElementById("root");

        // 커스텀 훅
        function useLocalStorage(itemName, value = "") {
            const [state, setState] = React.useState(() => {
                return window.localStorage.getItem(itemName) || value;
            });

            React.useEffect(() => {
                window.localStorage.setItem(itemName, state)
            }, [state]);

            return [state, setState];
        }

        const App = () => {
            const [keyword, setKeyword] = useLocalStorage("keyword");
            const [result, setResult] = useLocalStorage("result");
            const [typing, setTyping] = useLocalStorage("typing", false);

            function handleChange(event) {
                setKeyword(event.target.value);
                setTyping(true);
            }

            function handleClick() {
                setTyping(false);
                setResult(`We find results of ${keyword}`);
            }
            
            return (
                <>
                    <input onChange={handleChange} value={keyword}/>
                    <button onClick={handleClick}>search</button>
                    <p>
                        {typing ? `Looking for ${keyword}` : result}
                    </p>
                </>
            )

        }

        ReactDOM.render(<App/>, rootElement);
    </script>
```
<br/>

## hook flow

 - useEffect: 렌더가 끝난 뒤에 수행
 - update시: useEffect clean up, useEffect
 - dependency array: 전달받은 값의 변화가 있는 경우에만 수행

