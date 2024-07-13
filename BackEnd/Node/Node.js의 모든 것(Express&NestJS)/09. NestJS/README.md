# Nest.js

Nest.js는 Node.js 서버 애플리케이션을 위한 프레임워크로, 효율적이고 확장 가능한 애플리케이션을 구축하는 데 도움을 줍니다.
 - 모듈화 구조: Nest.js 애플리케이션은 여러 모듈로 구성됩니다. 모듈은 관련된 컴포넌트, 서비스, 컨트롤러 등을 그룹화하여 코드의 재사용성과 유지 보수성을 높입니다.
 - 데코레이터 기반: TypeScript 데코레이터를 사용하여 클래스와 메서드에 메타데이터를 추가할 수 있습니다. 데코레이터는 코드의 가독성을 높이고 명확하게 합니다.
 - 의존성 주입 (Dependency Injection): Nest.js는 강력한 의존성 주입 컨테이너를 제공하여, 객체의 생성과 관리, 의존성 해결을 간단하고 효율적으로 처리할 수 있습니다.
 - TypeScript 지원: Nest.js는 TypeScript로 작성되어 강력한 타입 시스템을 제공하며, 이는 코드의 품질과 개발자의 생산성을 높여줍니다.
 - Express 및 Fastify 통합: 기본적으로 Express를 사용하지만, Fastify를 선택적으로 사용할 수 있어 성능 향상이 가능합니다.

<br/>

## Nest.js 프로젝트 구조

 - `Nest.js 프로젝트 생성`
```bash
# 노드 버전 변경(NVM 이용)
nvm ls
nvm version
nvm install node # 최신 버전 설치
npm install {version} # 특정 버전 설치
nvm use v19.7.0
node -v

# yarn 설치
npm install --global yarn
yarn -v

# nest 설치
yarn global add @nestjs/cli

# nest 프로젝트 생성
nest new {project-name}

# 코드 포맷 검사 및 포맷팅
npx prettier --check .
npx prettier --write .
```
<br/>

 - `기본 프로젝트 구조`
    - src 디렉토리: 소스 코드가 포함된 디렉토리
        - app.controller.spec.ts: AppController 단위 테스트 파일
        - app.controller.ts: 컨트롤러
        - app.service.ts: 서비스
        - app.module.ts: 루트 모듈(해당 파일에 모든 컨트롤러, 서비스, 모듈 등이 정의되어야 한다.)
        - main.ts: 애플리케이션 진입점(애플리케이션을 부트스트랩하고 설정한다.)
    - .eslintrc.js: ESLint 설정 파일(프로젝트 코드 스타일과 규칙 정의)
    - .gitignore: Git에 포함되지 않을 파일이나 디렉토리 정의
    - .prettierrc: Prettier 설정 파일(코드 포맷팅 규칙 정의)
    - nest-cli.json: Nest CLI 설정 파일(프로젝트 구조와 설정 정의)
    - package.json: 프로젝트 메타데이터와 종속성 관리 파일
    - tsconfig.build.json: TypeScript 빌드 설정 파일(tsconfig.json과 분리하여 비륻 전용 설정 관리)
    - tsconfig.json: TypeSqcript 설정 파일(컴파일러 옵션, 파일 포함/제외 등 설정)
    - yarn.lock: Yarn 종속성 관리
```
project
 ┣━ src
 ┃   ┣━ app.controller.spec.tx
 ┃   ┣━ app.controller.ts
 ┃   ┣━ app.module.ts
 ┃   ┣━ app.service.ts
 ┃   ┗━ main.ts
 ┣━ test
 ┣━ .eslintrc.js
 ┣━ .gitignore
 ┣━ .prettierrc
 ┣━ nest-cli.json
 ┣━ package.json
 ┣━ tsconfig.build.json
 ┣━ tsconfig.json
 ┗━ yarn.lock
```
<br/>

 - `app.controller.ts`
```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```
<br/>

 - `app.service.ts`
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```
<br/>

 - `app.module.ts`
    - 해당 파일안에 Module, Controller, Service 등이 정의되어야 데코레이터로 의존성 주입이 가능하다.
```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```
<br/>

 - `main.ts`
    - 'app.module' 파일을 기반으로 Nest 애플리케이션을 설정하고 실행한다.
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```
<br/>

## Nest.js 기본 사용법

Nest.js에서 @Injectable, @Inject 데코레이터는 컨테이너에 관리 객체를 등록하고, 관리 객체를 의존성 주입 받는데 사용된다.  
하지만, 어노테이션만 정의한다고 바로 사용할 수 없고, 루트 모듈에 등록이 되어야한다.  

```
★ Spring 컴포넌트 스캔
JVM 환경의 Spring 프레임워크에서는 '@ComponenetScan' 혹은 'context:componenet-scan' 등으로 
특정 패키지 하위에 @Componenet가 붙은 클래스들을 자동으로 스프링 컨테이너 빈으로 등록해준다.

<context:component-scan base-package="com.example.package" />

@Configuration
@ComponentScan(basePackages = "com.example.package")
public class AppConfig {}

★ Spring 직접 빈 등록
<!-- MyService 빈 등록 -->
<bean id="myService" class="com.example.MyService"/>

<!-- MyController 빈 등록 및 MyService 빈 주입 -->
<bean id="myController" class="com.example.MyController">
    <constructor-arg ref="myService"/>
</bean>

@Configuration
public class AppConfig {

    @Bean
    public MyService myService() {
        return new MyService();
    }

    @Bean
    public MyController myController() {
        return new MyController(myService());
    }
}
```
<br/>

Nest JS는 컴포넌트 스캔을 제공하지 않아, 컴포넌트가 추가될 때마다 모듈에 명시해주어야 한다.  
이러한 부분이 번거로울 수 있어, nest 명령어를 이용하여 컨트롤러, 서비스 등을 생성하는 방식으로 자동으로 모듈에 명시되도록 할 수 있다.  
 - nest new {project-name}: 신규 Nest JS 프로젝트 생성
 - nest build {app-name}: Nest JS 애플리케이션 빌드
 - nest start {app-name}: Nest JS 애플리케이션 실행
 - nest info: Nest JS 프로젝트 세부 정보 출력
 - nest add {library}: 프로젝트에 외부 라이브러리 추가
 - nest generate {schematic} {name}: 컨트롤러, 서비스 등 컴포넌트 생성
```bash
# nest 명령어 확인
nest --help

# 컨트롤러 생성
nest generate controller users
nest g co users

# 모듈 생성
nest generate module users
nest g mo users
```
<br/>

## Nest.js 기본 개념

 - providers: 모듈이 생성하고, 의존성 주입 컨테이너에 추가할 클래스 인스턴스 또는 값의 배열로 주로 서비스와 레포지토리 등이 여기에 포함된다.
 - controllers: 모듈이 정의하는 컨트롤러의 배열, 컨트롤러는 클라이언트의 요청을 처리하고, 적절한 응답을 반환하는 역할을 한다.
 - imports: 모듈이 의존하는 다른 모듈의 배열, NestJS는 이러한 모듈들을 현재 모듈의 providers와 controllers가 사용할 수 있도록 제공한다.
 - exports: 모듈에서 제공하여, 다른 모듈에서 import 하여 사용할 수 있는 providers의 배열

<br/>

### 기능 모듈(Feature Modules)

 - 애플리케이션의 특정 기능을 캡슐화
 - 컨트롤러, 서비스, 레포지토리 등을 그룹화한 모듈
```javascript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService} from './users.service';

@Module({
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule {}
```
<br/>

### 공유 모듈(Shared Modules)

 - 애플리케이션 전반에 공유되는 기능을 제공
 - 데이터베이스 접속, 로깅 인증 등 공통적인 작업을 수행하는 기능들을 공유 모듈로 구성
```javascript
import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Module({
    providers: [DatabaseService],
    exportrs: [DatabaseService],
})
export class DatabaseModule {}
```
<br/>

## Nest.js 기본 HTTP 요청 라우팅

 - @Get, @Post, @Put, @Patch, @Delete, @All: 표준 HTTP 메서드 데코레이터
 - @Param: URL PathVariable 파싱
 - @Query: Query 파라미터 파싱
 - @Body: HTTP Body 파싱
 - @Headers: HTTP Header 파싱
 - @Session: 세션 객체 매개변수로 주입
 - @Req, @Res: 요청과 응답 객체 매개변수로 주입
 - @Injectable: Nest 컨테이너 관리 객체로 등록
 - @Inject: Nest 컨테이너 관리 객체를 주입(속성 주입 혹은 세터 주입시 사용)
```typescript
import { Body, Controller, Delete, Get, Injectable, Param, Post, Put } from '@nestjs/common';
import { BoardService } from './board.service';

@Controller('board')
export class BoardController {
    constructor(
        private readonly boardService: BoardService
    ){}
    

    // 속성 주입
    //@Inject(BoardService)
    //private readonly boardService: BoardService;

    @Get()
    findAll() {
        return this.boardService.findAll();
    }

    @Get(':id')
    find(
        @Param('id') id: number
    ) {
        return this.boardService.find(Number(id));
    }

    @Post()
    create(
        @Body() data
    ) {
        return this.boardService.create(data);
    }

    @Put(':id')
    update(
        @Param('id') id: number,
        @Body() data
    ) {
        return this.boardService.update(Number(id), data);
    }


    @Delete(':id')
    remove(
        @Param('id') id: number
    ) {
        return this.boardService.delete(Number(id));
    }
}
```
