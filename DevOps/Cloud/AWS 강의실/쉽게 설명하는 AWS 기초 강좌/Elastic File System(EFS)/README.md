# Elastic File System(EFS)

Amazon EFS(Amazon Elastic File System)는 AWS 클라우드 서비스와 온프레미스 리소스에서 사용할 수 있는 간단하고 확장 가능하며 탄력적인 완전관리형 NFS 파일 시스템을 제공한다.  
이 제품은 애플리케이션을 중단하지 않고 온디맨드 방식으로 페타바이트 규모까지 확장하도록 구축되어, 파일을 추가하고 제거할 때 자동으로 확장하고 축소하며 확장 규모에 맞게 용량을 프로비저닝 및 관리할 필요가 없다.  

기본적으로 EC2에 하나의 EBS(하드디스크)가 연결된다. 하지만, EC2를 사용하다보면 공유된 스토리지가 필요한 경우가 있다. (세션, 소스코드, 빅데이터 분석, 머신러닝 등 분산 처리를 위한 공유 스토리지) 이러한 경우 EFS를 이용할 수 있다.  
 - NFS 기반 공유 스토리지 서비스(NFSv4)
    - 따로 용량을 지정할 필요 없이 사용한 만큼 용량이 증가 (EBS는 미리 크기를 지정한다.)
 - 페타바이트 단위까지 확장 가능
 - 몇 천개의 동시 접속 유지 가능
 - 데이터는 여러 AZ(가용영역)에 나누어 분산 저장
 - 쓰기 후 읽기(Read After Write) 일관성
 - Private Service: AWS 외부에서 접속 불가능
    - AWS 외부에서 접속하기 위해서는 VPN 혹은 Direct Connect 등으로 별도로 VPC와 연결 필요
 - 각 가용영역에 Mount Target을 두고 각각의 가용영역에서 해당 Mount Target으로 접근
 - Linux Only

<br/>

## Amazon EFS 퍼포먼스 모드

 - Amazon EFS 퍼포먼스 모드
    - General Purpose: 가장 보편적인 모드로 거의 대부분의 경우 사용 권장
    - Max IO: 매우 높은 IOPS가 필요한 경우
        - 빅데이터, 미디어 처리 등

<br/>

## Amazon EFS Throughput 모드

 - Amazon EFS Throughput 모드
    - Bursting Throughput: 낮은 Throughput일 때 크레딧을 모아서 높은 Throughput일 때 사용
        - EC2 T타입과 비슷한 개념
    - Provisioned Throughput: 미리 지정한 만큼의 Throughput을 미리 확보해두고 사용

<br/>

## Amazon EFS 스토리지 클래스

 - Amazon EFS 스토리지 클래스
    - EFS Standard: 3개 이상의 가용영역에 보관
    - EFS Standart - IA: 3개 이상의 가용영역에 보관, 조금 저렴한 비용 대신 데이터를 가져올 때 비용 발생
    - EFS One Zone: 하나의 가용영역에 보관  -> 저장된 가용영역의 상황에 영향을 받을 수 있음(중요하지 않거나 다시 만들 수 있는 파일을 보관)
    - EFS One Zone: - IA: 저장된 가용영역의 상황에 영향을 받을 수 있음, 데이터를 가져올 때 비용 발생(가장 저렴)

<br/>

## Amazon FSx

 - FSx for Windows File Server
    - EFS의 윈도우즈 버전
    - SMB 프로토콜을 활용
    - Microsoft Active Directory와 통합 등의 관리 기능 사용 가능
    - Linux, MacOS 등의 다른 OS에서도 활용 가능
 - FSx for Lustre
    - 리눅스를 위한 고성능 병렬 스토리지 시스템
    - 주로 머신러닝, 빅데이터 등의 고성능 컴퓨팅에 사용
    - AWS 밖의 온프레미스에서도 액세스 가능

<br/>

## EFS 실습

 - EFS를 활용한 스토리지 공유 웹서버 만들기
    - 3개의 EC2 인스턴스가 하나의 소스 코드를 공유하도록 한다.
        - Amazon EFS를 위한 보안 그룹 생성
        - Amazon EFS 생성
        - EC2 인스턴스 3개 프로비전
            - 유저 데이터
                - 생성한 EFS를 마운트
                - 웹 서버 생성/실행
        - 각 웹서버에서 스토리지를 공유하는 것을 확인
        - 리소스 정리
```
1. 보안 그룹 만들기
 - EC2 대시보드 > 네트워크 및 보안 > 보안 그룹 > 생성
    - 보안 그룹 이름: Demo-EFS-SG
    - 인바운드 규칙: 모든 TCP, Anywhere-IPv4 (모든 TCP 허용)

2. Amazon EFS 만들기
 - EFS 대시보드 > 파일 시스템 생성
    - 이름: Demo-My-EFS
    - 스토리지 클래스: Standard
 - 만들어진 EFS > 네트워크탭 > 관리 > 가용영역 보안그룹 변경
    - 보안 그룹: Demo-EFS-SG

3. 
 - EC2 대시보드 > 인스턴스 시작
    - 이름: Demo-EC2-EFS
    - 인스턴스 개수: 3
    - 네트워크: 기존 보안 그룹 선택 (Demo-EFS-SG)
    - 고급 세부 정보
        - 사용자 데이터 등록


```

 - efs_userdata
    - EFS는 NFS 기반으로 nfs-utils를 설치하고, httpd 아파치 웹서버를 설치한다.
    - 그다음, EC2가 위치한 가용영역의 EFS 마운트 포인트를 검색하고, 해당 주소를 defaults로 마운트하도록 설정한다.
    - 디렉토리를 만들어서 EFS 마운트 포인트와 마운트한다.
```
#cloud-config
package_upgrade: true
packages:
- nfs-utils
- httpd
runcmd:
- echo "$(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone).{EFS아이디}.efs.ap-northeast-2.amazonaws.com:/    /var/www/html/efs-mount-point   nfs4    defaults" >> /etc/fstab
- mkdir /var/www/html/efs-mount-point
- mount -a
- touch /var/www/html/efs-mount-point/test.html
- service httpd start
- chkconfig httpd on
- mkdir /var/www/html/efs-mount-point/sampledir
- chown ec2-user /var/www/html/efs-mount-point/sampledir
- chmod -R o+r /var/www/html/efs-mount-point/sampledir
```

