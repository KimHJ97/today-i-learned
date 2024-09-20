# React 입문

## React 컴포넌트

컴포넌트로 생성하는 함수에 이름은 반드시 첫 글자가 대문자여야 한다.  

 - App.jsx안에 컴포넌트 만들기
```javascript
import './App.css'

const Header = () => {
  return (
    <header>
      <h1>header</h1>
    </header>
  );
};

function App() {
  return (
    <>
      <Header/>
      <h1>안녕 리액트!</h1>
    </>
  )
}

export default App
```

 - 컴포넌트 파일 분리
```javascript
// Header.jsx
const Header = () => {
    return (
      <header>
        <h1>header</h1>
      </header>
    );
  };

export default Header;

// Main.jsx
const Main = () => {
    return (
        <main>
            <h1>main</h1>
        </main>
    );
};

export default Main;

// Footer.jsx
const Footer = () => {
    return (
        <footer>
            <h1>footer</h1>
        </footer>
    );
};

export default Footer;

// App.jsx
import './App.css'
import Header from './components/Header';
import Main from './components/Main';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Header/>
      <Main/>
      <Footer/>
    </>
  )
}

export default App
```

## JSX로 UI 표현하기

 - JSX 주의 사항
    - 중괄호 내부에는 자바스크립트 표현식만 넣을 수 있다.
    - 숫자, 문자열, 배열 값만 렌더링 된다. (true, undefined, null 은 렌더링되지 않음)
    - 모든 태그는 닫혀있어야 한다.
    - 최상위 태그는 반드시 하나여야만 한다.
```javascript
const Main = () => {
    const number = 10;
    const obj = { a: 1 };

    return (
        <main>
            <h1>main</h1>
            <h2>{number}</h2>
            <h2>{number + 10}</h2>
            <h2>{number% 2 === 0 ? "짝수" : "홀수"}</h2>
            <h2>{obj.a}</h2>
        </main>
    );
};

export default Main;

// 조건에 따른 다른 UI 출력하기
const Main = () => {
    const user = {
        name: "로그",
        isLogin: false,
    }

    return <>
        {user.isLogin ? (
            <div>로그아웃</div>
        ) : (
            <div>로그인</div>
        )}
    </>;
};

// 조건에 따른 다른 UI 출력하기 2
const Main = () => {
    const user = {
        name: "로그",
        isLogin: false,
    }

    if (user.isLogin) {
        return <div>로그아웃</div>;
    } else {
        return <div>로그인</div>;
    }
};
```

 - 스타일 설정하기
```javascript
// 1. 직접 스타일 적용
const Main = () => {
  return <div style={{
      backgroundColor: "red",
      borderBottom: "5px solid blue",
  }}>로그아웃</div>;
};

// 2. class 적용: className 속성 사용
import './Main.css';

const Main = () => {
  return <div className="logout">로그아웃</div>;
};
```

## Props로 데이터 전달하기

 - 기본 사용법
  - defaultProps로 값이 없을때 기본값을 설정할 수 있다.
```javascript
// App.jsx
function App() {
  return (
    <>
      <Button text={"메일"} color={"red"} />
      <Button text={"카페"} />
      <Button text={"블로그"} />
    </>
  )
}

// Button.jsx
const Button = (props) => {
    console.log(props);
    return (
        <button style={{ color: props.color }}>
            {props.text} - {props.color.toUpperCase()}
        </button>
    );
};

Button.defaultProps = {
    color: "black"
}

export default Button;
```

 - 구조 분해 할당
```javascript
const Button = ({ text, color }) => {
    return (
        <button style={{ color: color }}>
            {text} - {color.toUpperCase()}
        </button>
    );
};

Button.defaultProps = {
    color: "black"
}

export default Button;
```

 
 - 컴포넌트에 자식요소를 보내면 children으로 받아진다.
    - children Props로 받을 수 있다.
```javascript
function App() {
  return (
    <>
      <Button text={"메일"} color={"red"} />
      <Button text={"카페"} />
      <Button text={"블로그"}>
        <div>자식요소</div>
      </Button>
    </>
  )
}

const Button = ({ text, color, children }) => {
    return (
        <button style={{ color: color }}>
            {text} - {color.toUpperCase()}
            {children}
        </button>
    );
};
```

