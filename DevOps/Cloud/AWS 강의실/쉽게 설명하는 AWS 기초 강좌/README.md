# 쉽게 설명하는 AWS 기초 강좌

## 클라우드 컴퓨팅 종류

 - 애플리케이션의 구성
    - 애플리케이션
    - OS: Windows/Linux
    - Computing: CPU + RAM
    - Storage: HDD/SSD
    - Network: 랜카드/랜선
 - IaaS: Infrastructure as a Service
    - 인프라만 제공 (Computing, Storage, Network)
    - OS를 직접 설치하고 필요한 소프트웨어를 개발해서 사용
    - 즉 가상의 컴퓨터 하나를 임대하는 것과 비슷함
    - ex) AWS EC2
 - PaaS: Platform as a Service
    - 인프라 + OS + 기타 프로그램 실행에 필요한 부분(런타임)을 제공 (OS + Runtime, Computing, Storage, Network)
    - 바로 코드만 올려서 돌릴 수 있도록 구성
    - ex) Firebase, Google App Engine
 - SaaS: Software as a Service
    - 인프라 + OS + 필요한 소프트웨어가 제공 (APP 자체)
    - 서비스 자체를 제공
    - 다른 세팅 없이 서비스만 이용
    - ex) Gmail, DropBox, SlaCK, Google Docs

<br/>

## 리전 & 가용 영역 & 엣지 로케이션

리전은 AWS의 서비스가 제공되는 서버의 물리적 위치를 나타내며, 각 리전에는 고유의 코드가 부여된다.  
리전을 선택할 때 지연 속도, 법률(데이터, 서비스 제공 권한), 사용 가능한 AWS 서비스 등을 고려한다.  

 - 리전: AWS가 제공되는 서버의 물리적 위치
 - 가용 영역: 하나의 리전 안에 두 개 이상의 가용 영역이 있으며 하나 이상의 데이터 센터로 구성
 - 엣지 로케이션: AWS의 여러 서비스를 빠르게 제공하기 위한 거점(캐싱)
 - AWS의 서비스는 글로벌 서비스와 리전 서비스로 구분
 - AWS의 모든 리소스는 ARN이 부여됨

