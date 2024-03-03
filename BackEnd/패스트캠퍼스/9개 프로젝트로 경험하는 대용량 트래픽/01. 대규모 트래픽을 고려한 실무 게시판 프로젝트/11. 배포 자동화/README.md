# 배포 자동화

## 1. 이론

### CI/CD

CI/CD는 Continuous Integration과 Continuous Delivery, Continuous Deployment의 약어로 소프트웨어 개발 및 배포 프로세스를 자동화하고 개선하는 방법을 가리킵니다.  

 - __CI 프로세스__
    - 코드 작성
    - 자동 빌드
    - 자동 테스트
    - 자동화된 통합
 - __CD 프로세스__
    - CI를 통한 자동화
    - 자동 배포 준비
    - 수동 승인
    - 자동 배포

<br/>

### Gradle

Gradle은 JVM 기반 프로젝트를 빌드하고 관리하기 위한 오픈 소스 빌드 자동화 도구입니다.  

 - 플러그인 시스템: Gradle은 다양한 플러그인을 제공하며, 이를 통해 다양한 프로젝트 유형을 지원합니다.
 - 의존성 관리: Gradle은 프로젝트의 의존성을 관리
 - 멀티 프로젝트 빌드: Gradle은 여러 프로젝트를 하나의 빌드로 관리할 수 있습니다.
 - 빌드 캐시: 빌드 시간을 최적화하기 위해 Gradle은 이전 빌드에서 생성된 산출물을 캐시하고 빌드 시간을 단축시킵니다.
 - 유연한 태스크: Gradle은 태스크 단위로 빌드 작업을 정의하며, 이를 활용하여 사용자 정의 빌드 프로세스를 만들 수 있습니다.

<div align="center">
    <img src="./images/build-lifecycle-example.png"><br/>
    이미지 출처 - https://docs.gradle.org/current/userguide/build_lifecycle.html
</div>
<br/>

### 젠킨스(Jenkins)

Jenkins는 오픈 소스 지속적 통합(CI) 및 지속적 배포(CD) 도구입니다. Jenkins는 소프트웨어 개발 및 배포 프로세스를 자동화하고 개선하기 위해 사용되며, 개발자 및 팀이 소프트웨어의 품질과 안전성을 관리할 수 있도록 도와줍니다.  

 - 지속적 통합(CI)
 - 자동화된 빌드
 - 자동화된 테스트
 - 지속적 배포(CD)
 - 플러그인 생태계
 - 스케줄링과 모니터링

<br/>

### 배포 아키텍처

전반적인 개발 순서로는 개발자간 코드 리뷰를 통해 깃 브랜치에 PUSH 후에 젠킨스가 빌드를 자동화하여 프로덕션 환경의 EC2에 자동 배포됩니다. 프론트에서 요청온 정보는 MySQL과 Redis에서 정보를 조회하여 응답을 줍니다.  



