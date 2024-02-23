# 2. Vue 문법

## 2-1. 인스턴스와 라이프사이클

 - `애플리케이션 인스턴스`
    - createApp 함수를 사용하여 새로운 애플리케이션 인스턴스를 생성한다.
```javascript
import { createApp } from 'vue'

const app = createApp({
  /* root component options */
})
```

<br/>

 - `인스턴스 옵션 설정`
```javascript
import { createApp } from 'vue'

// 옵션 설정
const app = Vue.createApp({})
app.component('SearchInput', SearchInputComponent)
app.directive('focus', FocusDirective)
app.use(LocalePlugin)

// 옵션 설정: 메서드 체이닝 방식
Vue.createApp({})
    .component('SearchInput', SearchInputComponent)
    .directive('focus', FocusDirective)
    .use(LocalePlugin)

```

<br/>

### 루트 구성 요소

createApp에 전달된 옵션은 루트 컴포넌트를 구성하는데 사용됩니다. 이 컴포넌트는 애플리케이션을 mount할 때, 렌더링의 시작점으로 사용됩니다.  

애플리케이션 인스턴스는 mount() 함수가 호출될 때까지 아무것도 렌더링하지 않습니다. 모든 앱 구성 및 자산 등록이 완료된 후에는 항상 mount() 메서드를 호출해야 합니다.  

```javascript
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

<br/>

### 라이프사이클 훅(생명주기 훅)

각 Vue 컴포넌트 인스턴스는 생성될 때 일련의 초기화 단계를 거칩니다. 예를 들어, 데이터 감시를 설정하고, 템플릿을 컴파일하고, 인스턴스를 DOM에 마운트하고, 데이터가 변경되면 DOM을 업데이트해야 합니다. 그 과정에서 생명 주기 훅(lifecycle hooks)이라 불리는 함수도 실행하여, 특정 단계에서 개발자가 의도하는 로직이 실행될 수 있도록 합니다.  

인스턴스 라이프사이클에는 mounted, updated, unmounted 같은 훅이 존재합니다. 모든 라이프사이클 훅에서는 Vue 인스턴스를 가리키는 this 컨텍스트와 함께 호출됩니다.  

```javascript
Vue.createApp({
    data() {
        return { count: 1 }
    },
    created() {
        // 인스턴스가 생성될 때 실행
        console.log('count is: ' + this.count)
    }
})
```

<div align="center">
    <img src="./images/Vue_lifecycle.png"><br/>
    이미지 출처 - https://ko.vuejs.org/guide/essentials/lifecycle
</div>
<br/>

## 2-2. 템플릿 문법

Vue는 렌더링된 DOM을 기본 구성 요소 인스턴스의 데이터에 선언적으로 바인딩할 수 있는 HTML 기반 템플릿 구문을 사용합니다. 모든 Vue 템플릿은 사양을 준수하는 브라우저와 HTML 파서로 구문 분석할 수 있는 구문적으로 유효한 HTML입니다.  

### 텍스트 보간

데이터 바인딩의 가장 기본적인 형태는 "Mustache" 구문(이중 중괄호)을 사용한 텍스트 보간입니다.  
Mustache 태그는 해당 컴포넌트 인스턴스의 msg 속성 값으로 대체됩니다. 또한, msg 속성이 변경될 때 마다 갱신됩니다.  

```javascript
<span>Message: {{ msg }}</span>
```

<br/>

__v-once 디렉티브__ 를 사용하면 데이터가 변경되어도 갱신되지 않는 일회성 보간을 수행할 수 있씁니다. 다만, 이런 경우 같은 노드의 바인딩에도 영향을 미친다는 점을 유의해야 합니다.  

```javascript
<span v-once>Message: {{ msg }}</span>
```

<br/>

### 원시 HTML

이중 콧수염은 데이터를 HTML이 아닌 일반 텍스트로 해석합니다. 실제 HTML을 출력하려면 다음 __v-html 지시문__ 을 사용해야 합니다.

```vue
<template>
    <p>Using text interpolation: {{ rawHtml }}</p>
    <p>Using v-html directive: <span v-html="rawHtml"></span></p>
</template>
```

<br/>

### 속성 바인딩

Mustaches(이중 중괄호 구문)는 HTML 속성에 사용할 수 없습니다. 대신에 __v-bind 디렉티브__ 를 사용해야합니다.  

v-bind 디렉티브는 엘리먼트의 id 속성을 컴포넌트의 dynamicId 속성과 동기화된 상태로 유지하도록 Vue에 지시합니다. 바인딩된 값이 null 또는 undefined이면 엘리먼트의 속성이 제거된 상태로 렌더링 됩니다.  

'v-bind'는 매우 많이 사용되어 ':id'로 단축 문법이 제공됩니다.  

```vue
<template>
    <!-- id 속성 바인딩 -->
    <div v-bind:id="dynamicId"></div>
    <div :id="dynamicId"></div>

    <!-- href 속성 바인딩 -->
    <a v-bind:href="url">링크</a>
    <a :href="url">링크</a>
    
    <!-- 동적 전달인자와 함께 쓴 약어 -->
    <a :[key]="url">링크</a>

    <!-- v-on 약어 -->
    <a v-on:click="doSomething">링크</a>
    <a @click="doSomething">링크</a>
    <a @[event]="doSomething">링크</a>
</template>
```

