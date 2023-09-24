# AWS에 API 서버 배포

AWS (Amazon Web Services)는 아마존 웹 서비스의 준말로  클라우드 컴퓨팅 및 클라우드 인프라스트럭처 서비스 플랫폼입니다.  
 - 인프라, 스토리지, 데이터베이스, 서버리스 컴퓨팅, 네트워킹, 머신 러닝, 분석 및 다양한 애플리케이션 개발 및 배포를 위한 다양한 서비스를 제공
    - 서버: EC2
    - 데이터베이스: Aurora, RDS
    - 파일 저장소: S3
    - 네트워크: VPC
    - 메시지 큐: SQS
    - API 게이트웨이: API Gateway
    - 서버 디스크: Elastic Block Store
    - DNS: Route 53
    - 로드 밸런서: Elastic Load Balancing
```
1. EC2 (Elastic Compute Cloud)
가상 서버 호스팅을 제공하며, 사용자가 가상 머신을 프로비저닝하고 실행할 수 있습니다.

2. RDS (Relational Database Service)
관계형 데이터베이스 관리를 위한 서비스로, MySQL, PostgreSQL, Oracle, SQL Server 등의 데이터베이스 엔진을 제공합니다.

3. S3 (Simple Storage Service)
객체 스토리지 서비스로, 대용량 데이터 및 파일을 안전하게 저장하고 관리할 수 있습니다.

4. VPC (Virtual Private Cloud)
가상 사설 클라우드 네트워크를 생성하고 관리하여 보안 및 네트워킹을 제어합니다.
 - IP 주소 범위 선택, 소프트웨어 라우팅, 라우팅 테이블
 - 1개의 라우팅 테이블에 멀티 서브넷 생성
 - 1개의 인터넷 게이트웨이 설정
 - VPC 내부의 서브넷끼리는 직접 통신
```

<br/>

## 클라우드 컴퓨팅 관련 용어

```
1. 클라우드 컴퓨팅 (Cloud Computing)
인터넷을 통해 컴퓨팅 리소스(서버, 스토리지, 네트워크 등)를 제공하고 액세스하는 서비스 모델을 의미합니다. 이는 온디맨드로 컴퓨팅 리소스를 확장하고 축소할 수 있으며, 사용한 만큼만 비용을 지불하는 유연한 방식을 제공합니다.

2. 클라우드 서비스 모델 (Cloud Service Models)
 - IaaS (Infrastructure as a Service): 가상 서버, 스토리지, 네트워킹 등의 인프라를 제공하며, 사용자는 운영 체제 및 애플리케이션을 관리합니다. (인프라)
 - PaaS (Platform as a Service): 애플리케이션 개발 및 배포를 위한 플랫폼을 제공하며, 사용자는 애플리케이션 코드에 집중할 수 있습니다. (인프라 + OS)
 - SaaS (Software as a Service): 완성된 애플리케이션을 제공하며, 사용자는 애플리케이션을 사용하는 데 집중하고 백엔드 인프라를 걱정하지 않습니다. (노션, 지메일, 오피스 365 등)

3. 퍼블릭 클라우드 (Public Cloud)
다수의 사용자에게 인터넷을 통해 컴퓨팅 리소스를 제공하는 클라우드 환경을 말합니다. AWS, Microsoft Azure, Google Cloud Platform(GCP) 등이 대표적인 퍼블릭 클라우드 제공 업체입니다.

4. 프라이빗 클라우드 (Private Cloud)
단일 조직 또는 업체에서 소유하고 운영하는 클라우드 인프라로, 일반적으로 보안 및 컨트롤이 중요한 업무에 사용됩니다.

5. 하이브리드 클라우드 (Hybrid Cloud)
퍼블릭 클라우드와 프라이빗 클라우드를 조합하여 사용하는 모델로, 데이터 및 워크로드를 효과적으로 관리하고 이동할 수 있습니다.

6. 가상화 (Virtualization)
하나의 물리적 서버에서 여러 개의 가상 머신(VM)을 실행하는 기술로, 클라우드 컴퓨팅에서 리소스를 효과적으로 사용하는 데 사용됩니다.

7. 서버리스 컴퓨팅 (Serverless Computing)
서버 관리 없이 코드를 실행하고 스케일링하는 모델로, 요청 단위로 비용이 청구됩니다. AWS Lambda 및 Azure Functions가 서버리스 컴퓨팅 서비스의 예입니다.

8. 스케일링 (Scaling)
리소스를 동적으로 확장 또는 축소하여 워크로드에 대한 대응력을 유지하는 것을 의미합니다. 수평 스케일링은 더 많은 인스턴스를 추가하고 수직 스케일링은 개별 인스턴스의 성능을 증가시키는 것을 나타냅니다.

9. 고가용성 (High Availability)
시스템 또는 서비스가 중단되지 않고 지속적으로 작동하는 능력을 의미합니다. 여러 리전 및 가용 영역을 사용하여 고가용성을 구현할 수 있습니다.

10. 보안 그룹 (Security Group)
클라우드 환경에서 네트워크 트래픽을 제어하고 보안 정책을 적용하기 위한 방화벽 규칙의 그룹입니다.
```

<br/>

## AWS 계정

AWS를 사용하기 위해서는 계정을 만들어야 한다.  
AWS는 아마존 이커머스에서 만들어진 서비스이지만, 해당 계정과는 다르게 별도로 만들어서 관리된다.  
AWS의 계정은 크게 Root 계정(모든 권한)과 IAM 계정 2가지로 분류하여 제공한다.  
 - 실제 실무에서는 Root 계정은 개발자에게 공유되지 않고, 별도의 IAM 계정을 만들어서 개발자들이 사용하게 된다.

<br/>

## Amazon VPC

Amazon VPC (Virtual Private Cloud)는 AWS(Amazon Web Services)에서 제공하는 가상 네트워크 환경으로, 사용자가 논리적으로 격리된 클라우드 네트워크를 생성하고 관리할 수 있게 해주는 서비스입니다.  
VPC를 사용하면 AWS 클라우드에서 리소스를 실행하고 네트워크 규칙을 적용하는 데 높은 수준의 컨트롤을 제공합니다.  
 - 서브넷(Subnet)
    - 서브넷(Subnet)은 네트워크를 더 작고 관리 가능한 하위 네트워크로 분할하는 방법 중 하나입니다. 서브넷은 주로 대규모 네트워크를 조직화하고 보안 및 트래픽 관리를 위해 사용됩니다. 서브넷은 주로 IP 주소 범위, 가용 영역, 논리적인 분리 등을 기준으로 나누어집니다.
    - Amazon VPC(Virtual Private Cloud)와 같은 클라우드 환경에서는 서브넷을 사용하여 가상 네트워크를 생성하고 관리합니다. 각 서브넷은 특정 VPC 내에 속하며, 이를 통해 사용자는 자체적으로 격리된 가상 네트워크 환경을 만들 수 있습니다.
 - 네트워크 ACL(Access Control List)
    - 네트워크 ACL(Network Access Control List)은 클라우드 컴퓨팅 환경에서 사용되는 보안 그룹(Security Group)과 함께 네트워크 보안을 관리하고 트래픽을 제어하기 위한 방화벽 규칙의 그룹입니다. 네트워크 ACL은 특정 서브넷(Subnet) 내의 인바운드(입력) 및 아웃바운드(출력) 트래픽을 관리하여 네트워크 리소스에 대한 액세스를 제한하고 보안을 강화하는 데 사용됩니다.
    - 가상의 방화벽으로 서브넷에 설정되며, 데이터 유입(인바운드)과 데이터 전송(아웃바운드) 트래픽을 관리합니다.

<br/>

## Amazon EBS

Amazon EBS(Elastic Block Store)는 Amazon Web Services(AWS)에서 제공하는 블록 스토리지 서비스로, EC2 인스턴스와 함께 사용되어 데이터를 저장하고 관리하는 데 사용됩니다. EBS는 안정적이며 고성능의 블록 스토리지를 제공하며 다양한 유스 케이스에 대응할 수 있습니다.  
 - Amazon EC2 전용 스토리지
 - HDD와 SDD가 제공된다.
    - HDD: 대용량, 싸다, 느리다
    - SDD: 고성능, 빠르다, 비싸다
 - __저장하고 있는 용량만큼 비용을 지불한다.__
    - 웹 애플리케이션을 로그를 쌓는 경우 주기적으로 저장된 내용을 지우거나, 백업 하도록 하여야 한다.

<br/>

## Elastic Load Balancer (ELB)

Amazon Elastic Load Balancer(ELB)는 Amazon Web Services(AWS)에서 제공하는 관리형 로드 밸런서 서비스입니다. ELB는 여러 EC2 인스턴스 또는 다른 리소스 간에 트래픽을 분산하고 요청을 처리하기 위한 분산 네트워크 로드 밸런서를 제공합니다. 이로써 애플리케이션의 가용성을 향상시키고 부하를 분산하여 안정적인 서비스 제공을 지원합니다.  
 - 트래픽 부하 분산 제공, 서비스 안정성, 확장성 확보
 - 로드 밸런서 유형: Amazon ELB에는 다음과 같은 세 가지 로드 밸런서 유형이 있습니다.
    - Application Load Balancer (ALB, 기본): HTTP 및 HTTPS 트래픽을 기반으로 하는 애플리케이션 레벨 로드 밸런서로, 다양한 기능 및 라우팅 규칙을 지원합니다.
    - Network Load Balancer (NLB): TCP 및 UDP 트래픽을 기반으로 하는 로드 밸런서로, 초당 수백만 개의 연결을 지원하며 고성능 네트워크 로드 밸런싱을 제공합니다.
    - Classic Load Balancer (CLB): 이전 버전의 로드 밸런서로, 기본적인 로드 밸런싱 기능을 제공합니다.

<br/>

## Auto Scaling

AWS 에서는 서버의 상태에 따라서 자동으로 서버를 늘리거나 줄이는 Auto Scaling 기능을 제공합니다. Auto Scaling을 사용하면 애플리케이션의 가용성을 향상시키고 리소스 비용을 최적화할 수 있습니다.  
 - 부하 관련 정책을 정하고 이에 따라 오토스케일링 그룹을 생성
    - 최소 대수
    - 최대 대수
 - 정책
    - 인스턴스의 부하 임계치를 정하고 자동으로 증가 또는 감소
    - 스케줄에 맞춰 자동으로 증가 또는 감소
    - EC2 상태에 따라 교체

<br/>

## Amazon Machine Image (AMI)

Amazon Machine Image(AMI)는 Amazon Web Services(AWS)에서 사용되는 가상 머신 이미지를 나타내는 개념입니다. AMI는 EC2 인스턴스(가상 머신)를 시작하기 위한 기본 템플릿이며, 이 이미지에는 운영 체제(OS), 애플리케이션, 데이터 및 설정 정보가 포함될 수 있습니다. AMI를 사용하면 새로운 EC2 인스턴스를 빠르게 시작하고 확장할 수 있으므로 애플리케이션 배포와 관리가 용이해집니다.  
 - 인스턴스 생성을 위해 만들어진 템플릿
 - ami는 서버에 필요한 구성을 템플릿 형태로 제공

<br/>

## AWS API 서버 배포 실습

### AWS Elastic Beanstalk
AWS Elastic Beanstalk는 개발자가 웹 애플리케이션 및 서비스를 쉽게 배포하고 관리할 수 있는 PaaS(Platform as a Service) 서비스입니다. Elastic Beanstalk를 사용하면 애플리케이션 코드를 업로드하고, 운영체제, 웹 서버, 런타임, 데이터베이스 등을 관리하는 복잡한 작업을 AWS에 의존하여 자동화할 수 있습니다. 이를 통해 개발자는 애플리케이션 개발과 배포에 집중할 수 있으며 인프라 관리 부담을 최소화할 수 있습니다.  

AWS Elastic Beanstalk는 민첩한 애플리케이션 배포 및 관리를 위한 강력한 도구로, 개발자 및 팀이 애플리케이션을 신속하게 개발하고 배포하면서 AWS 클라우드에서의 운영 부담을 줄일 수 있도록 도와줍니다.  
 - 환경 구성, 배포 및 이력, 로그 확인, 모니터링, 이벤트 지원

```
1. 다양한 프로그래밍 언어 지원
Elastic Beanstalk는 여러 가지 프로그래밍 언어 및 프레임워크를 지원합니다.
예를 들어, Java, .NET, Python, Ruby, Node.js, PHP, Go 등 다양한 언어로 개발된 애플리케이션을 배포할 수 있습니다.

2. 자동 확장
Elastic Beanstalk는 트래픽 증가에 따라 애플리케이션을 자동으로 확장하고, 트래픽 감소 시 자동으로 축소합니다.
이를 통해 애플리케이션의 성능과 가용성을 최적화할 수 있습니다.

3. 애플리케이션 스택 지원
Elastic Beanstalk는 다양한 애플리케이션 스택(예: Apache, Nginx, Tomcat, Docker 등)을 지원하며, 스택에 따라 필요한 런타임 및 환경을 자동으로 설정합니다.

4. 인프라 관리 자동화
Elastic Beanstalk는 인프라 구성과 운영체제 패치, 웹 서버 설정, 로드 밸런싱 등을 자동으로 관리합니다. 사용자는 이러한 세부 사항을 신경 쓰지 않아도 됩니다.

5. 스케일링 제어
사용자는 원하는 대로 확장 및 축소 규칙을 설정하고, 로드 밸런서 및 Auto Scaling 그룹과 통합하여 애플리케이션의 스케일링을 제어할 수 있습니다.

6. 데이터베이스 통합
Elastic Beanstalk는 다양한 데이터베이스 서비스와 통합할 수 있으며, RDS(Relational Database Service) 및 NoSQL 데이터베이스와 함께 사용할 수 있습니다.

7. 환경 관리
Elastic Beanstalk는 다중 환경을 지원하므로 스테이징 환경 및 프로덕션 환경과 같이 다양한 환경을 설정하고 관리할 수 있습니다.
 - 소프트웨어(Gradle), 인스턴스, 용량(AMI, 로드밸런싱, Auto Scaling), 로드 밸런서(ALB), 배포 방식(롤링 업데이트), 보안, 모니터링(Cloud Watch)

8. 모니터링 및 로깅
Elastic Beanstalk는 CloudWatch와 통합하여 애플리케이션의 성능 모니터링 및 로그 수집을 지원합니다.
 - 헬스 체크, 총 요청 수, 응답 시간, CPU 사용률, 네트워크 입력, 네트워크 출력 등
 - 로그 메뉴에서 로그 확인 가능
```

<br/>

### AWS Elastic Beanstalk 만들기

```
1. AWS > Elastic Beanstalk
 - 새 환경 생성
    - 환경 티어 선택: 웹 서버 환경
        - 기본적으로 포트 80을 통해 HTTP 요청을 수신한 후 처리
        - 웹 서버 환경은 HTTP 요청을 지원하는 웹 API
    - 애플리케이션 정보
        - 애플리케이션 이름: hello-world-api-app
        - 애플리케이션 태그
            - 키: role
            - 값: hello-api
    - 환경 정보
        - 환경 이름: hello-world-api-app-env
        - 도메인: hello-api
    - 플랫폼
        - 플랫폼: Java
        - 플랫폼 브랜치: Corretto 11 (JDK 버전)
        - 플랫폼 버전: 3.4.3 (추천 값 사용)
    - 애플리케이션 코드
        - 코드 업로드
            - 버전 레이블: hello-world-api-app-source
            - 소스 코드 오리진: 로컬 파일 업로드 (Jar 파일)
```

<br/>

### Github Action과 AWS Elastic Beanstalk

 - AWS EB에 배포하기 위한 워크 플로우를 정의한다.
    - Procfile
        - Procfile은 Elastic Beanstalk에게 실행할 Jar을 알려주는 프로세스 구성 파일
        - Procfile을 애플리케이션과 함꼐 소스 번들로 제공
```YML
name: Deploy to AWS EB

on:
  workflow_dispatch: # 수동 배포

permissions:
  contents: read

jobs:
  build:

    runs-on: ubuntu-latest # Ubuntu 환경에서 Job을 실행

    steps:
    - uses: actions/checkout@v3 # 소스 코드 체크아웃
    - name: Set up JDK 11 # JDK 11 버전
      uses: actions/setup-java@v3
      with:
        java-version: '11'
        distribution: 'temurin'

    - name: Build with Gradle # Gradle 빌드 (bootJar)
      uses: gradle/gradle-build-action@67421db6bd0bf253fb4bd25b31ebb98943c375e1
      with:
        arguments: clean build bootJar

    - name: Get current time # 현재 시간 얻기
      uses: 1466587594/get-current-time@v2
      id: current-time
      with:
        format: YYYYMMDDTHHmm
        utcOffset: "+09:00"  

    - name: Generate deployment package # 배포를 위한 준비 (Zip 패키징, BootJar 파일)
      run: |
        mkdir -p deployment
        cp build/libs/hello-github-action-0.0.1-SNAPSHOT.jar deployment/hello-github-action-0.0.1-SNAPSHOT.jar
        cp deployment/Procfile deployment/Procfile
        cd deployment && zip -r hello-github-action-${{steps.current-time.outputs.formattedTime}} .
        ls    
        
    - name: Deploy Hello Github Action to EB # AWS EB에 업로드
      uses: einaregilsson/beanstalk-deploy@v14
      with:
        aws_access_key: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws_secret_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        application_name: hello-world-api-app # AWS 빈스톡 애플리케이션 이름
        environment_name: hello-world-api-app-env # AWS 빈스톡 애플리케이션 환경 이름
        version_label: hello-world-api-app-version-${{steps.current-time.outputs.formattedTime}} # 라벨
        region: ap-northeast-2 # AWS 리전
        deployment_package: deployment/hello-github-action-${{steps.current-time.outputs.formattedTime}}.zip
```
