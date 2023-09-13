# 초기 이커머스 아이디어를 구현하기

 - 버전 관리(VCS)의 Git 기본 이론 및 사용법
 - 웹 프레임워크(Spring)에 대한 설명
 - SDKMAN을 통한 JDK 설치
 - Spring Boot 기본 어노테이션 및 사용법
 - 데이터베이스 기본 개념(트랜잭션, 인덱스)

## 버전 관리

 - 버전 관리(VCS)
    - 버전 관리(Version Control)는 소프트웨어 개발 및 파일 관리에서 중요한 개념입니다. 이것은 프로젝트의 변화와 수정 사항을 추적하고 관리하는 도구나 기술을 의미합니다.
    - 파일의 변화를 기록
    - 복구, 특정 시점의 파일을 가져온다
    - 수정된 내용을 비교 가능하다
    - 추적이 가능하다
 - 버전 관리 종류
    - 분산 버전 관리 시스템
        - Git이 가장 유명한 예입니다. 이러한 시스템은 로컬 및 원격 저장소에서 작업을 수행하며 분산된 방식으로 버전을 관리합니다.
    - 중앙 집중식 버전 관리 시스템
        - Subversion(SVN)가 이러한 방식의 시스템의 예입니다. 중앙 서버에서 파일을 관리하고 클라이언트가 중앙 서버에서 파일을 받아오고 업데이트합니다.
 - Git
    - Git은 버전 관리 시스템(VCS, Version Control System) 중 하나로, 소프트웨어 개발에서 변경 사항을 추적하고 관리하는 데 사용되는 분산형 버전 관리 시스템입니다. Linus Torvalds가 2005년에 개발하였고, 현재는 전 세계적으로 많은 개발자와 프로젝트에서 사용되고 있습니다.
    - 분산 버전 관리 시스템, 리눅스 커널 개발에 사용, 무료, 오픈소스, 모든 OS 지원, 업계 표준
 - Git의 버전 관리 개념
    - 워킹 디렉토리(작업 디렉토리)
    - 스테이징 영역: 단순한 파일을 지칭, 커밋할 파일의 정보 저장(인덱스)
    - Git 디렉토리: 프로젝트의 메타 정보, 객체 데이터베이스
 - Git 버전 관리 흐름
    - Committed: 로컬 Git 데이터베이스에 안전하게 저장
    - Modified: 수정한 파일을 아직 로컬 데이터베이스에 커밋하지 않은 것
    - Staged: 현재 수정한 파일을 곧 커밋
 - Github
    - GitHub는 Git 리포지토리 호스팅 및 소프트웨어 개발 협업 플랫폼으로, Git을 기반으로 하는 협업 및 버전 관리 서비스입니다. 2008년에 Tom Preston-Werner, Chris Wanstrath, PJ Hyett 등에 의해 개발되었으며, 현재는 Microsoft가 소유하고 있습니다. GitHub은 개발자들 간의 코드 공유, 협업, 버전 관리, 이슈 트래킹 등을 지원하며, 오픈 소스 프로젝트와 개인 프로젝트 모두에 널리 사용됩니다.
    - 원격 저장소 및 호스팅, 비공개 저장소, 공개 저장소, 빌드 및 배포 자동화, 프로젝트 관리 기능, 이슈 관리 기능, 위키 제공, 정적 페이지 호스팅, 코드 조각

<br/>

#### Git 주요 개념 및 기본 명령어

 - Git 지역 저장소 생성
    - git init
 - Git 설정
    - git config
 - Git 변경 관리
    - git add: 버전 관리 파일 준비
    - git rm --cached <파일명>: 버전 관리에서 제거하기
    - git status: 깃 버전 관리 상태 확인
    - git commit: 버전 관리 저장(스냅샷, 해시 생성)
    - git reset
 - 변경 이력
    - git log
    - git log -숫자: 숫자 개수만큼 로그 보기
    - git log -pretty=oneline: 깃 커밋 로그를 한 줄로 보기
 - Git 주요 개념
    - 커밋(Commit)
        - 변경 작업 완료 > 준비 > 버전 관리에 저장
        - 변경 사항을 스냅샷으로 저장 > 해시값이 생성됨 > 체크섬
    - HEAD
        - 작업 트리 마지막 커밋을 가리키는 포인터
        - 현재 작업 중인 커밋
    - 체크아웃(Checkout)
        - 작업할 브랜치 지정, 헤드의 위치 변경
        - git checkout [브랜치명 or 커밋의해시]
    - 상대참조
        - 깃은 커밋 단위를 해시로 관리한다. 이것은 사람이 알아보기 힘들어, 상대적인 참조 연산자를 제공한다.
        - 캐럿(^), 틸드(~)
        - 한 단계 부모 커밋으로 이동: git checkout main^
        - 두 단계 부모 커밋으로 이동: git checkout main^^
        - 한 단계 부모 커밋으로 이동: git checkout main~1
        - 세 단계 부모 커밋으로 이동: git checkout main~3

<br/>

#### Git Branch(브랜치)

Git에서 브랜치(Branch)는 프로젝트의 변경 사항을 분리하여 관리하는 데 사용되는 개념입니다. 브랜치를 만들면 현재 코드 베이스에서 분리된 작업을 수행하고, 이를 통합하거나 병합하는 데 사용할 수 있습니다.  
 - 독립적인 작업 공간
 - 관련 명령어: git branch, git checkout, git merge, git pull, git push 등

```Bash
# 브랜치 생성
$ git branch [신규 브랜치명]

# 브랜치 이동
$ git checkout [브랜치명]

# 브랜치 합치기(병합): 현재 브랜치에 다른 브랜치에 변경된 내용을 합친다.
$ git merge [작업한 브랜치]

# 브랜치 삭제
$ git branch -d [브랜치명]
```

<br/>

#### 커밋 되돌리기 및 이력관리

 - 커밋 수정하기
    - 커밋을 한 후 다시 커밋을 하고 싶을 때 사용
    - 바로 이전의 커밋을 덮어쓴다.
```Bash
$ git commit --amend
```

 - 커밋 취소하기
    - 이전에 커밋한 것을 취소
    - __다른 사람과 이미 공유한 커밋을 취소하면 안 된다.__
    - git reset은 현재 작업위치인 HEAD의 포인터를 특정위치로 변경하는 것으로 HEAD의 위치를 변경해주었기 때문에 HEAD보다 뒤에있는 커밋들은 연결이 사라지게 되고 히스토리에서 삭제된 것 처럼 보이게 되는 것이다. git reset으로 없어진 커밋은 삭제된 것이 아니라, '고아(orphans)' 상태가 된 것일 뿐이므로 git reflog를 통해서는 확인할 수 있다. Git은 일반적으로 30일마다 가비지 컬렉터를 실행하여 이러한 고아 커밋을 영구적으로 삭제한다.
    - '--hard': 변경 이력을 삭제하고, 커밋 반영 코드 모두 삭제된다.
    - '--mixed': 변경 이력을 삭제하고, 커밋 반영 코드는 unstage 상태로 남아있다. add 후 commit 하여 커밋할 수 있다.
    - '--soft': 변경 이력을 삭제하고, 커밋 반영 코드는 stage 상태로 남아있다. commit 하여 커밋할 수 있다.
```Bash
$ git reset HEAD^
$ git reset "취소할 커밋 체크섬"
```

 - 커밋 되돌리기(revert)
    - 커밋한 내용을 되돌린다.
    - 이전 커밋과 반대의 내용으로 커밋 추가
    - 과거 커밋 이력이 유지된다.
```Bash
$ git revert "되돌릴 커밋 체크섬"
$ git revert "커밋 체크섬'.."커밋 체크섬"
```

 - 커밋 가져오기(cherry-pick)
    - 다른 브랜치의 커밋을 현재 작업 브랜치로 가져온다
```Bash
$ git cherry-pick "커밋 체크섬"
```

<br/>

#### 병합시 충돌 해결하기

 충돌(Conflict)은 두 개 이상의 변경 사항이 충돌하거나 상충할 때 발생하는 상황을 나타냅니다.  
  - 동시 수정: 여러 개발자나 여러 개의 브랜치에서 동시에 같은 파일 또는 같은 부분을 수정할 때 충돌이 발생할 수 있습니다.
 - 병합(merge) 충돌: 브랜치를 병합할 때, 하나의 브랜치에서 수정된 부분과 다른 브랜치에서 수정된 부분이 충돌할 때 발생합니다. 이는 Git이 자동으로 병합할 수 없는 경우에 발생합니다.
 - 충돌 표시: 충돌이 발생하면 버전 관리 시스템은 충돌 부분을 표시하고, 어떤 변경 사항을 선택할지를 개발자에게 물어봅니다.

```
<<<<<<< HEAD
// 현재 브랜치의 변경 사항
..
=======
// 병합 대상 브랜치의 변경 사항
..
>>>>>>> branch_name
```

 - 병합 중에 충돌 과정
```Bash
# 1. 병합 수행
$ git merge [브랜치명]

# 2. 충돌 발생 및 충돌 해결: 충돌된 부분 내용 수정 진행
..

# 3. 병합 수행: 충돌 부분을 수정하고 적용
$ git add <파일명>
$ git merge --continue

# 병합 중단
$ git merge --abort 
```

<br/>

#### 동료와 함께 버전 관리 사용하기

 - Github에 신규 저장소를 만들고 함께 사용한다.
 - 원격 저장소를 Clone 하여 내 로컬에서 개발한다.
 - 개발한 내용을 다시 원격 저장소로 Push 한다.
 - 원격 저장소로 Push 된 커밋들을 PR로 만들어 요청한다.
    - Push된 커밋을 PR 만들고, 리뷰어 지정
 - 동료 개발자는 PR을 리뷰한다.
    - PR 확인, 코드 리뷰, 승인 또는 댓글과 변경 요청
 - 승인되면 PR을 메인 브랜치에 합친다.
    - PR 상태 확인
    - 머지하기 (머지, 스쿼시 머지, 리베이스 머지)

```Bash
# 원격 저장소 코드 가져오기
$ git clone [원격 저장소 URL]

# 원격 저장소 별칭 확인
$ git remote -v

# Clone 받은 프로젝트에서 변경, 커밋 -> PUsh
# 코드 수정 > add > commit > pull > push
$ git add .
$ git commit -m "커밋 메시지"
$ git pull origin main # 원격 저장소에 저장된 내용들을 로컬 저장소에 동기화
$ git push -u origin main
```

<br/>

## Web 개발용 프레임워크

웹 프레임워크(Web Framework)는 웹 애플리케이션 및 웹 서비스를 개발하기 위한 소프트웨어 프레임워크입니다. 이러한 프레임워크는 웹 개발을 단순화하고 표준화하며, 개발자가 웹 애플리케이션의 핵심 로직을 구축하는 데 도움을 줍니다.  
 - 동적인 웹 페이지, 템플릿 엔진, 입력 정합성 검증, 웹 애플리케이션, 데이터 베이스 연동, 보안 및 세션 관리, 로깅, 모니터링 등 제공
 - 템플릿 엔진(Template Engine): 웹 프레임워크는 HTML, CSS, JavaScript 등과 함께 사용하여 동적 웹 페이지를 생성하는 데 사용되는 템플릿 엔진을 제공합니다. 이를 통해 개발자는 데이터를 템플릿에 쉽게 삽입하고 웹 페이지를 생성할 수 있습니다.
 - 라우팅 및 URL 처리: 웹 프레임워크는 URL을 처리하고 사용자 요청에 따라 적절한 뷰(View)나 컨트롤러(Controller)로 라우팅하는 기능을 제공합니다.
 - 데이터베이스 연동: 웹 애플리케이션은 종종 데이터베이스와 상호 작용해야 합니다. 웹 프레임워크는 데이터베이스 연결 및 쿼리 실행을 쉽게 처리할 수 있는 기능을 제공합니다.
 - 세션 및 인증 관리: 사용자 인증 및 세션 관리를 포함한 보안 기능을 제공하여 웹 애플리케이션의 보안성을 강화합니다.
 - 웹 서비스 개발: RESTful API 또는 SOAP 기반의 웹 서비스를 쉽게 개발하고 제공할 수 있도록 도와줍니다.
 - 개발자 도구와 패턴: 웹 프레임워크는 개발자들에게 일관된 코드 구조와 디자인 패턴을 제시하여 개발 프로세스를 표준화하고 개발 생산성을 향상시킵니다.

<br/>

#### 웹 프레임워크 분류

 - 마이크로 프레임워크
    - 자신이 필요한 라이브러리를 직접 포함시켜야 한다.
    - Spring Boot(Java, Kotlin)
    - Ktor, Javalin(Kotlin)
 - 풀-스택 프레임워크
    - 개발에 필요한 대부분의 라이브러리가 포함된다.
    - Play(Java, Scala)
    - Django(Python)
 - 서비스 개발시 프레임워크 선택 기준
    - 프레임워크 안정성, 보안성, 확장성, 유지보수성
    - 개발자 커뮤니티
    - 생산성
    - 학습곡선
    - 유지보수성
    - 개발자 채용

<br/>

#### Web 개발과 API 개발

 - 웹 개발: 고객에게 제공할 웹 서비스를 개발
    - 이커머스 고객 서비스: 쇼핑몰 사이트
        - 구매를 목적으로 검색과 탐색을 할 수 있는 웹/앱 서비스
    - 이커머스 판매자 서비스: 네이버 스마트스토어
        - 상품 판매에 필요한 기능을 제공하는 서비스
        - 상품 관리
        - 주문 관리
        - 배송 관리
        - 고객 관리
        - 광고 관리
        - 정산 관리
    - 서비스 운영에 필요한 관리자 서비스
        - 판매와 구매를 안정적으로 운영할 수 있도록 지원하는 서비스
        - 주문 관리
        - 배송 관리
        - 고객 서비스
        - 결제 서비스
        - 정산 서비스
        - 회원 관리
        - 기타 내부 시스템 관리
 - API 개발: 필요한 데이터를 제공하는 Application Programming Interface 개발
    - 서비스 전용 API
        - 이커머스 판매와 구매 서비스에 필요한 API
        - 고객 서비스 개발 목적으로 만들어진 API
        - 공식적으로 외부에 제공되지 않는 API
        - API 주소나 스팩은 알리지 않고 변경됨
    - Open API
        - 외부에 공식적으로 공개되어 제공되는 API
        - 사용을 위한 승인
        - API 변경 정보 공지 또는 안내
        - 관리되는 API
 - API 제공 방식
    - 송수신 유형, 데이터 유형 등 어떻게 제공되는지 정의
    - HTTP API, REST API, RESTfUL api
    - GraphQL
    - gRPC

<br/>

#### Spring Boot와 Spring Framework

 - [Spring Framework](https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/overview.html)
    - 자바 생태계에서 가장 많이 사용하는 프레임워크
    - 필요한 기능과 환경을 제공하여 개발자가 비즈니스에 집중할 수 있도록 한다.
    - 제어의 역전(IoC)
        - 객체 생명 주기를 위임
            - 스프링 컨테이너
            - IoC 컨테이너
    - 의존성 주입(DI)
        - 전통적인 방식은 필요한 컴포넌트 직접 생성 및 주입
        - 필요한 의존성 컴포넌트를 스프링 컨테이너, IoC 컨테이너가 주입
    - 관점 지향 개발(AOP)
        - 공통적으로 필요한 기능을 묶어서 모듈로 제공
            - 보안, 로깅, 트랜잭션 등
        - 핵심 기능과 부가 기능
        - 런타임 시점(프록시 패턴), 클래스 로딩 시점, 컴파일 시점
 - Spring Framework의 문제점
    - 설정의 복잡합
    - 직접 설정
    - XML을 이용한 설정
 - Spring Boot
    - Spring Framework의 문제점을 해결하기 위해 나옴
    - Spring 설정의 복잡합 해결
    - XML이 아닌 자바 설정(유지보수성)
    - 직접 설정이 아닌 자동 설정 제공
    - 내장 WAS 제공
    - 시스템 모니터링 제공
    - 빠른 개발 속도, 단독 실행 가능, 관례에 따른 자동 설정, 스프링 프레임 워크 기반, 웹 서버 내장, 스타터를 이용한 의존성 구성, 설정 파일을 통한 외부 설정, 자바 구성

<div align="center">
    <img src="./images/spring-overview.png">
</div>

<br/>

#### 자바 개발 환경 설정

자바로 애플리케이션을 개발하기 위해서는 JDK가 필요하다.  
JDK에는 다양한 버전이 존재하며, 서로 다른 버전의 JDK가 필요한 경우 하나의 컴퓨터에서 관리하기 어렵다.  
이를 SDK를 관리해주는 도구를 이용하여 해결할 수 있다.  
 - 직접 JDK를 찾아 다운로드 및 설치
 - SDK를 관리해주는 도구를 이용해서 다운로드 및 설치

<br/>

`SDKMAN`

 - The Software Development Kit Manager
 - 유닉스 기반의 다양한 SDK의 다양한 버전을 관리해주는 도구
 - 홈페이지: https://sdkman.io/

```Bash
# 설치 스크립트 실행
$ curl -s "https://get.sdkman.io" | bash

# 쉘 실행
$ source "$HOME/.sdkman/bin/sdkman-init.sh"

# 설치 확인
$ sdk version

# SDKMAN으로 자바 환경 설치
$ sdk install java # 최신 버전 설치
$ sdk install java 17-zulu # 특정 버전 설치

# 설치된 자바 버전 제거
$ sdk uninstall java 17-zulu

# 설치 가능한 SDK 목록 확인
$ sdk list
$ sdk list java 

# 특정 SDK 사용 설정: 현재 사용하는 쉘에서만 적용된다.
$ sdk current
$ sdk use java 17-zulu

# 모든 쉘에 SDK 버전 적용
$ sdk current java
$ sdk default java 17-zulu
```

<br/>

#### Web 프레임워크 기초

 - 기본 용어
    - DTO
        - Data Transfer Object
    - REST API
        - Representation State Transafer의 약자
        - HTTP 메서드인 GET, POST, PUT, DELETE 등 활용하여 웹 자원을 표현
        - REST 아키텍처 방식에 따라 API를 개발하는 방법 (RESTful API)
    - 레이어드 아키텍처
        - 클라이언트의 요청을 처리하고 응답하는데 사용되는 구조
        - 클라이언트 요청 ↔ 프레젠테이션 계층 ↔ 비즈니스 계층 ↔ 데이터 접근 계층
        - 프레젠테이션 계층: 요청을 해석, 처리 위임, 응답, API Endpoint, Controller
        - 비즈니스 계층: 요청을 처리, 도메인 로직을 활용
        - 데이터 접근 계층: 데이터를 처리하는 저장소와 연동을 담당
 - Spring Web 개발 어노테이션
    - @SpringBootApplication
        - 스프링 부트 애플리케이션을 실행해주는 역할
        - 설정, 자동 설정, 컴포넌트 스캔
    - @Controller
        - 해당 클래스 Controller 역할을 한다는 것을 나타냄
        - 일반적으로 요청을 받아서 처리하고 응답하는 역할
    - @Service
        - 해당 클래스가 Service 역할을 한다는 것을 나타냄
        - 도메인 로직을 처리하는 역할
    - @Repository
        - 해당 클래스가 Repository 역할을 한다는 것을 나타냄
        - 저장소와 관련한 역할
    - @Component
        - 해당 클래스가 스프링 컴포넌트로 등록된다는 것을 나타냄
        - 일반적으로 개발자가 만든 클래스를 객체(Bean)로 등록시 사용
    - @Bean
        - 해당 클래스가 스프링 빈으로 등록된다는 것을 나타냄
        - 프레임워크나 외부에서 제공받는 클래스(Bean) 등록시 사용
    - @Configuration
        - 스프링, 자바 프로젝트의 설정을 코드로 할 수 있도록 한다.
 - Spring API 개발 관련 어노테이션
    - @RestController
        - REST API를 만들기 위한 Controller 어노테이션
        - 일반적으로 요청을 받아서 처리하고 응답하는 역할
    - @GetMapping
        - GET 요청을 처리하기 위한 메서드 지정
    - @PostMapping
        - POST 요청을 처리하기 위한 메서드 지정
    - @PutMapping
        - PUT 요청을 처리하기 위한 메서드 지정
    - @DeleteMapping
        - DELETE 요청을 처리하기 위한 메서드 지정
 - Spring 클라이언트 요청/응답 파라미터 관련 어노테이션
    - @RequestMapping(value = "URL")
        - 클라이언트에서 들어온 요청이 value의 패스와 동일하면 해당 클래스나 메서드를 실행
        - 클래스 단위에서 사용 가능
        - 메서드 단위에서 사용 가능
    - @RequestParam
        - 요청의 파라미터 내용을 받는데 사용됨
        - 클라이언트의 요청 파라미터 내용을 메서드의 파라미터와 매핑해주는 역할
    - @PathVariable
        - 클라이언트의 요청 URL에 담긴 특정 값을 담을 때 사용
    - @RequestBody
        - 요청의 Body에 담긴 내용을 받는데 사용됨
        - 클라이언트에서 받은 Body의 내용을 메서드의 파라미터와 매핑해주는 역할
    - @ResponseBody
        - 메서드를 실행 후 결과를 HTTP 응답에 담아 전달해주는 역할
        - 다양한 데이터 포맷을 응답 가능(JSON, XML 등)

```Java
// GET API
@GetMapping("/hello")
public String helloGet() {
    return "Hello Get";
}

// POST API
@PostMapping("/hello")
public String helloPost() {
    return "Hello Post";
}

// POST API와 @RequestBody
@PostMapping("/hello/customer")
public String helloPostCustomer(@RequestBody Customer customer) {
    return "Hello Post " + customer.getName();
}

// GET API와 @RequestParam
@GetMapping("/hello/customer")
public String helloCustomerParam(@RequestParam Long customerId) {
    return "Hello Get Request Param " + customerId;
}

// GET API와 @PathVariable
@GetMapping("/hello/customer/{customerId}")
public String helloCustomer(@PathVariable Long customerId) {
    return "Hello Get PathVariable " + customerId;
}
```

 - Intellij HTTP Client
    - 'project/client/hello-api-client.http'
```http
### GET API
GET http://localhost:8080/hello
Accept: application/json

### POST API
POST http://localhost:8080/hello
Content-Type: application/json

### POST API와 @RequestBody
POST http://localhost:8080/hello/customer
Content-Type: application/json

{
    "name": "Sonic",
    "age": 21,
    "job": "Developer"
}

### GET API와 @RequestParam
GET http://localhost:8080/hello/customer?customerId=100
Accept: application/json

### GET API와 @PathVariable
GET http://localhost:8080/hello/customer/100
Accept: application/json
```

<br/>

## 데이터베이스 이론

#### 데이터베이스

데이터베이스(Database)는 체계적으로 구성된 데이터의 집합을 저장하고 관리하는 시스템입니다. 데이터베이스는 정보를 효과적으로 저장, 검색, 수정 및 삭제할 수 있는 방법을 제공하며, 다양한 애플리케이션 및 시스템에서 데이터를 보존하고 관리하는 데 사용됩니다.  
 - 데이터 저장, 데이터 관리, 데이터 공유, 데이터 검색, 데이터 보존, 데이터 무결성, 보안
 - 일반적으로 데이터베이스는 관계형 데이터베이스(Relational Database)와 NoSQL 데이터베이스(Not Only SQL)로 분류됩니다.
    - 관계형 데이터베이스는 테이블과 관계를 사용하여 데이터를 저장하고 관리하는데, MySQL, PostgreSQL, Oracle 등이 대표적인 예입니다.
    - NoSQL 데이터베이스는 관계형 모델을 사용하지 않고 다양한 데이터 구조 및 유연한 스키마를 지원하며, MongoDB, Cassandra, Redis 등이 예시입니다.
 - 테이블
    - 수집한 데이터를 특정한 형태로 정리하여 관리하는 목록
    - 2차원 형태로 표현(행, 열)
 - 스키마
    - 데이터베이스, 테이블에 대한 구조와 정보
    - 자료의 구조, 자료의 표현 방법, 자료 간의 관계를 형식 언어로 정의한 구조
 - 데이터베이스 관리자(DBMS)
    - DBMS(DataBase Management System)
    - 데이터베이스를 관리하기 위한 시스템(정렬, 검색, 데이터 정합성 검사, 백업, 복구, 보안 등을 제공)

<br/>

#### 관계형 데이터베이스

관계형 데이터베이스(Relational Database)는 데이터를 테이블 형태로 구조화하고 관리하는 데이터베이스 시스템의 한 유형입니다. 이러한 데이터베이스는 테이블, 로우(레코드), 컬럼(필드)으로 이루어져 있으며 데이터 간의 관계를 표현하기 위해 키(Primary Key, Foreign Key)를 사용합니다. 관계형 데이터베이스는 특정한 데이터 구조와 스키마를 따르며, 데이터의 일관성과 무결성을 유지하기 위한 다양한 제약 조건을 지원합니다.  
 - MySQL, MariaDB, Oracle, PostgreSQL, MS SQL Server
 - 강점
    - 흔하고 많이 사용되어 범용적이다.
    - 단순한 데이터 저장 구조를 가진다. (테이블, 행, 열)
    - 데이터의 타입 기반이다. (숫자, 문자, 날짜)
    - 기본적인 서비스 성능을 가진다.
    - 트랜잭션을 지원한다.
 - 약점
    - 대용량과 고속 처리에 약하다.

<br/>

#### NoSQL 데이터베이스

NoSQL(Not Only SQL) 데이터베이스는 관계형 데이터베이스와는 다른 데이터 모델과 저장 방식을 사용하는 데이터베이스 시스템의 범주를 나타냅니다. NoSQL 데이터베이스는 정형 데이터 뿐만 아니라 반정형 데이터와 비정형 데이터를 저장하고 관리할 수 있으며, 다양한 응용 분야와 요구 사항에 대응할 수 있도록 설계되었습니다.  
 - 문서 데이터베이스(Document Database): 데이터를 문서 형식(예: JSON, XML)으로 저장하며, 각 문서에는 고유한 키가 있습니다. MongoDB와 CouchDB가 대표적인 예입니다.
 - 키-값 스토어(Key-Value Store): 간단한 키와 해당 키에 연결된 값으로 데이터를 저장합니다. 예로는 Redis와 Amazon DynamoDB가 있습니다.
 - 열 지향 데이터베이스(Column-family Database): 데이터를 행 대신 열 단위로 저장하며, 대량의 데이터를 빠르게 처리할 수 있습니다. Apache Cassandra와 HBase가 이 유형에 속합니다.
 - 그래프 데이터베이스(Graph Database): 데이터 간의 복잡한 관계를 저장하고 조회하기 위한 그래프 모델을 사용합니다. Neo4j와 Amazon Neptune이 이 유형의 예입니다.
 - NoSQL의 강점: 고속, 비정형 데이터, 분산 처리, 많은 양의 데이터
 - NoSQL의 약점: 관계형 결합의 미지원, 일관성이나 정합성이 약함, 트랜잭션 미지원 또는 어려움

<br/>

#### 트랜잭션

트랜잭션(Transaction)은 데이터베이스 관리 시스템(DBMS, Database Management System)에서 수행되는 작업의 단위를 나타냅니다. 트랜잭션은 데이터베이스에서 데이터를 읽거나 쓰는 작업의 논리적인 집합으로, 이러한 작업들은 모두 하나로 묶여 있으며, "원자적(Atomic)"이라는 특성을 가집니다. 원자성은 트랜잭션의 작업이 전부 수행되거나 전부 수행되지 않는 것을 의미하며, 중간 단계에서 실패하면 트랜잭션은 롤백되어 이전 상태로 복원됩니다.  

트랜잭션은 데이터베이스에서 일관성을 유지하고, 여러 사용자가 동시에 데이터를 업데이트하더라도 데이터 손실이나 불일치를 방지하기 위해 중요한 개념입니다.
 - 원자성(Atomicity): 트랜잭션은 일련의 작업이 모두 성공하거나 모두 실패할 때만 완료됩니다. 중간 단계에서 문제가 발생하면 트랜잭션은 롤백되어 이전 상태로 복원됩니다.
 - 일관성(Consistency): 트랜잭션이 시작하기 전과 종료한 후에 데이터베이스는 일관된 상태여야 합니다. 트랜잭션은 데이터베이스의 무결성 제약 조건을 준수해야 합니다.
 - 고립성(Isolation): 동시에 여러 트랜잭션이 실행될 때, 각 트랜잭션은 다른 트랜잭션의 작업에 영향을 주지 않아야 합니다. 즉, 트랜잭션은 격리되어야 합니다.
 - 지속성(Durability): 트랜잭션이 완료되면 그 결과는 영구적으로 저장되어야 하며, 시스템 장애 또는 중단이 발생해도 데이터는 손실되지 않아야 합니다.
 - 트랜잭션 관련 명령어
    - BEGIN TRANSACTION: 트랜잭션 시작
    - COMMIT: 트랜잭션 성공적으로 완료
    - ROLLBACK: 트랜잭션 실패하거나 롤백이 필요한 경우

<br/>


#### 인덱스

데이터베이스에서 인덱스(Index)는 데이터 검색 속도를 향상시키기 위한 데이터 구조입니다. 인덱스는 특정 컬럼(또는 여러 컬럼의 조합)에 대한 데이터의 위치 정보를 유지하고, 데이터베이스 관리 시스템(DBMS)이 레코드를 빠르게 찾을 수 있도록 도와줍니다. 인덱스는 일종의 색인(또는 책의 색인)과 비슷한 역할을 하며, 테이블의 데이터에 대한 빠른 액세스를 가능하게 합니다.  
 - 빠른 데이터 검색: 인덱스를 사용하면 데이터베이스에서 원하는 레코드를 빠르게 찾을 수 있습니다. 전체 테이블을 스캔하지 않고도 인덱스를 통해 원하는 데이터에 직접 액세스할 수 있습니다.
 - 검색 시간 절약: 대량의 데이터를 다루는 경우, 인덱스를 사용하면 검색 시간을 크게 절약할 수 있으며, 사용자 경험을 향상시킵니다.
 - 정렬된 결과: 일부 인덱스 유형은 데이터를 정렬된 상태로 유지하며, 정렬된 결과를 반환하기 위해 추가 정렬 작업을 수행하지 않아도 됩니다.
 - 데이터 무결성 유지: 일부 인덱스 유형은 데이터의 중복을 방지하고 데이터 무결성을 유지하는 데 도움을 줍니다.
 - 인덱스의 종류
    - 기본 키 인덱스(Primary Key Index): 테이블의 기본 키 컬럼에 대한 인덱스로, 데이터베이스 내의 각 레코드를 고유하게 식별합니다.
    - 고유 인덱스(Unique Index): 특정 컬럼(또는 컬럼 조합)에 대한 인덱스로, 중복된 값을 허용하지 않습니다.
    - 클러스터 인덱스(Clustered Index): 테이블의 레코드를 물리적으로 정렬하는 데 사용되며, 한 테이블당 하나의 클러스터 인덱스만 가질 수 있습니다.
    - 비클러스터 인덱스(Non-Clustered Index): 데이터를 물리적으로 정렬하지 않고, 데이터 레코드의 복사본을 만들어 인덱싱하는 데 사용됩니다. 한 테이블에 여러 비클러스터 인덱스를 가질 수 있습니다.
    - 복합 인덱스(Composite Index): 두 개 이상의 컬럼에 대한 인덱스로, 여러 컬럼을 조합하여 검색 또는 정렬에 사용됩니다.
 - 인덱스에 적합한 컬럼
    - 컬럼 값의 종류가 많을 때
    - 데이터 양이 많을 떄 조건의 데이터 한정적
    - 자주 정렬이나 검색 필터에 사용
 - 인덱스의 단점
    - 삽입, 수정, 삭제시 속도가 떨어진다. (인덱스 관리)
    - 수정이 빈번한 테이블은 조심해야 함
    - 인덱스 관리 영역만큼 데이터베이스 용량이 더 필요

<br/>

#### 데이터베이스 실습

 - MySQL 샘플 데이터베이스: https://www.mysqltutorial.org/getting-started-with-mysql/
```SQL
-- 데이터베이스 생성하기
CREATE SCHEMA ecommerce DEFAULT CHARACTER SET utf8 COLLATE utf8_bin;

-- 데이터베이스 유저 만들기
CREATE USER 'app'@'localhost' identified by 'app123!@#';
GRANT ALL PRIVILEGES ON *.* TO 'app'@'localhost';
GRANT ALL PRIVILEGES ON ecommerce.* TO 'app'@'localhost';
```
