# react-router-dom

react-router-dom은 React 애플리케이션에서 클라이언트 사이드 라우팅을 쉽게 구현할 수 있도록 도와주는 라이브러리입니다. 웹 애플리케이션 내에서 URL을 기반으로 다른 컴포넌트나 페이지를 렌더링할 수 있게 하며, 전통적인 페이지 리로드 없이도 다른 화면으로 이동할 수 있는 SPA(Single Page Application) 스타일의 라우팅을 제공합니다.  

리액트는 SPA로 하나의 index.html 템플릿 파일을 가지고 있습니다. 이 하나의 템플릿에 자바스크립트를 이용해서 다른 컴포넌트를 index.html 템플릿에 넣으므로 페이지를 변경해주게 됩니다. 이때 React Router Dom 라이브러리가 새 컴포넌트로 라우팅/탐색을 하고 렌더링하는데 도움을 주게 됩니다.  

```bash
npm install react-router-dom --save
yarn add react-router-dom
```

## React Router 설정하기

 - `index.js`
    - BrowserRouter로 루트 컴포넌트를 감싸준다.
    - BrowserRouter는 HTML5 History API를 사용하여 UI를 URL과 동기화된 상태로 유지해줍니다. HTML5의 History API를 사용하여 페이지를 새로고침하지 않고도 주소를 변경할 수 있도록 합니다.
```javascript
ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
)
```

 - 여러 컴포넌트 생성 및 라우트 정의하기
    - Routes: Routes는 앱에서 생성될 모든 개별 경로에 대한 컨테이너 상위 역할을 합니다. Route로 생성된 자식 컴포넌트 중에서 매칭되는 첫 번쨰 Route를 렌더링해줍니다.
    - Route: Route는 단일 경로를 만드는 데 사용됩니다.
        - path: 원하는 컴포넌트의 URL 경로를 지정합니다.
        - element: 경로게 맞게 렌더링되어야 하는 컴포넌트를 지정합니다.
```javascript
function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={ <Home/> } />
                <Route path="/about" element={ <About/> } />
                <Route path="/contact" element={ <Contact/> } />
            </Routes>
        </div>
    )
}
```

 - Link를 이용해 경로를 이동하기
    - Link 구성 요소는 HTML의 앵커 요소와 유사합니다. to 속성을 이용해서 이동하게 되는 경로를 지정합니다.
```javascript
import { Link } from "react-router-dom";

function Home() {
    return (
        <div>
            <h1>홈페이지</h1>
            <Link to="about">About 페이지를 보여주기</Link>
            <Link to="contact">Contact 페이지를 보여주기</Link>
        </div>
    )
}
```

## React Router Dom APIs

 - 중첩 라우팅
```javascript
<Routes>
    <Route path="/" element={ <App />}>
        <Route index element={ <Home />} />
        <Route path="teams" element={ <Teams />} >
            <Route path=":teamId" element={ <Team />} />
            <Route path="new" element={ <NewTeamForm />} />
            <Route index element={ <LeagureStandings />} />
        </Route>
    </Route>
</Routes>
```

 - Outlet
    - 자식 경로 요소를 렌더링하려면 부모 경로 요소에서 Outlet 태그를 사용해야 합니다. 이렇게 하면 하위 경로가 렌더링될 떄 중첩된 UI가 표시될 수 있습니다. 부모 라우트가 정확히 일치하면 자식 인덱스 라우트를 렌더링하거나 인덱스 라우트가 없으면 아무것도 렌더링하지 않습니다.
```javascript
function App() {
    return (
        <div>
            <h1>Welcome to the app!</h1>
            <nav>
                <Link to="/">Home</Link> |{" "}
                <Link to="/teams">Teams</Link>
            </nav>
            <div className="content">
                <Outlet />
            </div>
        </div>
    )
}
```

 - useNavigate
    - 경로를 변경해줍니다.
    - navigate에 replace true 옵션을 사용하지 않으면 navigate에 적힌 주소로 넘어간 후 뒤로가기를 하더라도 방금 페이지로 돌아오지 않고 메인 페이지로 돌아오게 됩니다. false가 기본 값으로 뒤로가기가 가능하게 됩니다.
```javascript
import { useNavigate } from "react-=router-dom";

function SignupForm() {
    let navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();
        await submitForm(event.target);
        navigate("../success", { replace: true });
    }

    return <form onSubmit={handleSsubmit}>{/* .. */}</form>
}
```

 - useParams
    - useParams Hooks는 Route path와 일치하는 현재 URL에서 동적 매개변수의 키값 쌍 객체를 반환합니다.
    - PathVariable을 얻을 수 있습니다.
```javascript
import { Routes, Route, useParams } from "react-router-dom";

function App() {
    return (
        <Routes>
            <Route
                path="invoices/:invoiceId"
                element={<Invoice />}
            />
        </Routes>
    )
}

function Invoice() {
    let params = useParams();
    return <h1>Invoice {params.invoiceId}</h1>;
}
```

 - useLocation
    - useLocation 훅을 이용해서 현재 URL 정보를 가져올 수 있습니다.
    - 해당 훅은 현재 위치 객체를 반환합니다. 이것은 현재 위치가 변경될 때마다 일부 side effect를 수행하려는 경우에 유용할 수 있습니다.
```javascript
import * as React from 'react';
import { useLocation } from 'react-router-dom';

function App() {
    let location = useLocation();

    React.useEffect(() => {
        ga('send', 'pageview');
    }, [location]);

    return (
        // ..
    )
}
```

 - useRoutes
    - 해당 훅은 Routes 엘리먼트와 동일하지만, Route 요소 대신 JavaScript 객체를 사용하여 경로를 정의합니다.
```javascript
import * as React from 'react';
import { useRoutes } from 'react-router-dom';

function App() {
    let element = useRoutes([
        {
            path: "/",
            element: <Dashboard />,
            children: [
                {
                    path: "messages",
                    element: <DashboardMessages />
                },
                {
                    path: "tasks",
                    element: <DashboardTasks />
                }
            ]
        },
        {
            path: "team",
            element: <AboutPage />
        }
    ])

    return element;
}
```
