# 1. Vue 시작하기

## 1-1. 개요

Vue.js는 사용자 인터페이스를 만들기 위한 진보적인 프론트엔드 프레임워크 중 하나입니다. 웹 애플리케이션의 UI를 구축하고 관리하기 위한 기능을 제공합니다. Vue.js는 단일 페이지 애플리케이션(Single Page Application) 및 웹 애플리케이션의 일부분을 관리하는 데 사용될 수 있습니다.  

Vue.js는 반응성 및 선언적인 API를 강조하며, 가볍고 빠르며 유연한 설계로 인기가 있습니다. 또한 가상 DOM(Virtual DOM)을 사용하여 성능을 최적화하고, 컴포넌트 기반 아키텍처를 채택하여 코드의 재사용성과 유지보수성을 향상시킵니다.  

Vue 2 지원은 2023년 12월 31일에 종료되었습니다.  
 - Vue 2 공식 문서: https://v2.ko.vuejs.org/v2/guide/
 - Vue 3 공식 문서: https://ko.vuejs.org/guide/introduction.html

<br/>

## 1-2. Vue CDN

스크립트 태그를 통해 CDN에서 직접 Vue를 사용할 수 있습니다.  
CDN에서 Vue를 사용하는 경우 "빌드 단계"가 필요하지 않습니다. 따라서 설정이 훨씬 간단해지며 정적 HTML을 향상시키거나 백엔드 프레임워크와 통합하는 데 적합합니다. 하지만 싱글 파일 컴포넌트(SFC) 구문은 사용할 수 없습니다.  

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
```

<br/>

 - `예제 코드`
```html
<div id="app">
    <h1>{{ message }}</h1>
</div>

<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script>
    Vue.createApp({
        data() {
            return {
                message: 'Hello Vue!'
            }
        }
    }).mount('#app')
</script>
```

<br/>

## 1-3. Vue CLI

Vue.js는 단일 페이지 애플리케이션(SPA)를 빠르게 구축할 수 있는 공식 CLI를 제공합니다. 최신 프론트엔드 워크플로우를 위해 사전 구성된 빌드 설정을 제공합니다. 핫 리로드, 저장시 린트 체크 및 프로덕션 준비가 된 빌드로 시작하고 실행하는데 몇 분 밖에 걸리지 않습니다.  

 - `Vue 프로젝트 만들기`
    - npm init vue, npm create vue 명령어 모두 공식 Vue 프로젝트 스캐폴딩 도구인 create-vue를 설치 및 실행한다.
```bash
# 1. 프로젝트 생성
$ npm create vue@latest

# 2. 프로젝트 옵션 설정
✔ Project name: … <your-project-name>
✔ Add TypeScript? … No / Yes
✔ Add JSX Support? … No / Yes
✔ Add Vue Router for Single Page Application development? … No / Yes
✔ Add Pinia for state management? … No / Yes
✔ Add Vitest for Unit testing? … No / Yes
✔ Add an End-to-End Testing Solution? … No / Cypress / Playwright
✔ Add ESLint for code quality? … No / Yes
✔ Add Prettier for code formatting? … No / Yes

Scaffolding project in ./<your-project-name>...
Done.

# 3. 의존 라이브러리 설치
$ cd <your-project-name>
$ npm install
$ npm run dev
```

<br/>

 - `Vue 프로젝트 만들기(vue/cli 이용)`
```bash
$ npm install -g @vue/cli
$ vue --version

$ vue create 프로젝트명
```

<br>

## 1-4. Vue3 Webpack Template

```bash
# Vue 설치
$ npm i vue@next

# Vue Loader 설치
$ npm i -D vue-loader@ vue-style-loader @vue/compiler-sfc

```

<br/>

 - `webpack.config.js`
    - resolve 옵션으로 '.js' 혹은 '.vue'를 임포트할 떄 확장자를 생략할 수 있도록 한다.
    - entry 부분으로 진입 지점을 정의한다.
    - rules에 vue 파일에 대해서 vue-loader를 정의한다.
    - rules에 css 파일에 대해서 vue-style-loader를 정의한다.
```javascript
// 현재 프로젝트에서 모듈 경로를 찾을 수 있도록 지정.
// 특히 Windows에서 발생하는 오류 해결을 위한 코드.
// 이 코드가 없어도 잘 동작하는 경우 필요치 않음.
const _require = id => require(require.resolve(id, { paths: [require.main.path] }))

// path: NodeJS에서 파일 및 디렉토리 경로 작업을 위한 전역 모듈
const path = _require('path')
const HtmlPlugin = _require('html-webpack-plugin')
const CopyPlugin = _require('copy-webpack-plugin')
const { VueLoaderPlugin } = _require('vue-loader')

module.exports = {
  resolve: {
    // 경로에서 확장자 생략 설정
    extensions: ['.js', '.vue'],
    // 경로 별칭 설정
    alias: {
      '~': path.resolve(__dirname, 'src'),
      'assets': path.resolve(__dirname, 'src/assets')
    }
  },

  // 파일을 읽어들이기 시작하는 진입점 설정
  entry: './src/main.js',

  // 결과물(번들)을 반환하는 설정
  output: {
    // 주석은 기본값!, `__dirname`은 현재 파일의 위치를 알려주는 NodeJS 전역 변수
    // path: path.resolve(__dirname, 'dist'),
    // filename: 'main.js',
    clean: true
  },

  // 모듈 처리 방식을 설정
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.s?css$/,
        use: [
          // 순서 중요!
          'vue-style-loader',
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/, // 제외할 경로
        use: [
          'babel-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif|webp)$/,
        use: 'file-loader'
      }
    ]
  },

  // 번들링 후 결과물의 처리 방식 등 다양한 플러그인들을 설정
  plugins: [
    new HtmlPlugin({
      template: './index.html'
    }),
    new CopyPlugin({
      patterns: [
        { from: 'static' }
      ]
    }),
    new VueLoaderPlugin()
  ],

  // 개발 서버 옵션
  devServer: {
    host: 'localhost',
    port: 8080,
    hot: true
  }
}
```

<br/>

## 1-5. ESLint 구성

 - `패키지 설치`
```bash
$ npm i -D eslint eslint-plugin-vue babel-eslint
```

<br/>

 - `.eslintrc.js 파일 만들기`
    - https://eslint.vuejs.org/user-guide/
```javascript
module.exports = {
  env: {
    browser: true,
    node: true
  },
  extends: [
    // vue 코드 규칙
    //'plugin:vue/vue3-essential', // Lv1
    'plugin:vue/vue3-strongly-recommended', // Lv2
    //'plugin:vue/vue3-recommended', // Lv3 (가장 엄격)
    // js 코드 규칙
    'eslint:recommended'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    "vue/html-closing-bracket-newline": ["error", {
      "singleline": "never",
      "multiline": "never"
    }],
    "vue/html-self-closing": ["error", {
      "html": {
        "void": "always", // img 태그같은 빈태그
        "normal": "never", // div 태그같은 일반태그
        "component": "always" // 컴포넌트 태그
      },
      "svg": "always",
      "math": "always"
    }]
  }
}
```

<br/>

 - `VSCode 설정 변경`
    - 에디터에서 파일 저장시 ESLint 적용하도록 하기
    - 'Ctrl' + 'Shift' + 'P' 입력 후 settings json 파일 열기
```json
"editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
}
```

<br/>

## 1-6. 선언적 렌더링과 입력 핸들링

 - `Vue 파일 기본 구조`
```vue
<template>
</template>

<script>
export default {

}
</script>

<style>
</style>
```

<br/>

 - `카운터 예제`
```vue
<template>
  <h1 @click="increase">
    {{ count }}
  </h1>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increase() {
      this.count += 1
    }
  }
}
</script>

<style>
  h1 {
    font-size: 50px;
    color: royalblue;
  }
</style>
```

<br/>

## 1-7. 조건문과 반복문

 - `App.vue`
```vue
<template>
  <h1 @click="increase">
    {{ count }}
  </h1>
  <div v-if="count > 4">
    4보다 크다!
  </div>
  <ul>
    <li 
      v-for="fruit in fruits"
      :key="fruit">
      {{ fruit }}
    </li>
  </ul>
</template>

<script>
export default {
  data() {
    return {
      count: 0,
      fruits: ['Apple', 'Banana', 'Cherry']
    }
  },
  methods: {
    increase() {
      this.count += 1
    }
  }
}
</script>

<style lang="scss">
  h1 {
    font-size: 50px;
    color: royalblue;
  }

  ul {
    li {
      font-size: 40px;
    }
  }
</style>
```

<br/>

### 컴포넌트 분리

 - `Fruit.vue`
    - Vue 파일 내부 style 태그에 scoped 속성을 정의하면, 다른 컴포넌트에 영향을 미치지 않고 현재 컴포넌트에서만 유효하게 동작한다.
```vue
<template>
  <li>{{ name }}</li>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scopred lang="scss">
  h1 {
    color: red !important;
  }
</style>
```

<br/>

 - `App.vue`
```vue
<template>
  <h1 @click="increase">
    {{ count }}
  </h1>
  <div v-if="count > 4">
    4보다 크다!
  </div>
  <ul>
    <Fruit 
      v-for="fruit in fruits"
      :key="fruit"
      :name="fruit">
      {{ fruit }}
    </Fruit>
  </ul>
</template>

<script>
import Fruit from '~/components/Fruit'

export default {
  components: {
    Fruit: Fruit
  },
  data() {
    return {
      count: 0,
      fruits: ['Apple', 'Banana', 'Cherry']
    }
  },
  methods: {
    increase() {
      this.count += 1
    }
  }
}
</script>
```

