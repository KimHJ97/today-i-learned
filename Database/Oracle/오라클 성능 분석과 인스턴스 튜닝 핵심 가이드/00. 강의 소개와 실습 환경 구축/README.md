# 강의 소개와 실습 환경 구축

## 실습 환경 구축

 - Oracle Cloud에서 서버 구축
    - 30일 무료 크레딧, 2 Core CPU, 250GB의 Usable NVMe SSD 제공
    - Oracle Enterprise Edition 사용 가능
 - Oracle 18c XE 버전을 Local PC 또는 Cloud에 구축
    - Admin, 초기화 파일 설정 등의 실습 가능
    - Load 테스트를 강의와 동일하게 구현할 수는 없음
    - 18c XE는 AWR이 지원되지 않음
 - Oracle 19c Enterprise 버전을 Google Cloud에 구축
    - Google Cloud는 최초 가입 시 300$ 무료 크레딧을 1년간 제공
    - VM을 생성하고 60GB 정도의 SSD Block Storage를 구성하여 DB 구축
    - 60GB SSD Block Storage의 비용 유의

<br/>

### 오라클 무료 클라우드

 - https://www.oracle.com/kr/cloud/free/

```
★ 네트워킹 > 가상 클라우드 네트워크
 - VCN 마법사 > 인터넷 접속을 통한 VCN
    - 기본 정보
        - VCN 이름: oracle_vcn_01
    - 생성


★ 베어메탈, VM, 및 Exadata > DB 시스템 생성
 - 구성 유형: 가상 머신
 - 구성 선택: VM.Standard 2.2
 - DB 시스템 구성
    - 총 노드 수: 1
    - Oracle Database 소프트웨어 에디션: Enterprise Edition
 - 스토리지 관리 소프트웨어: Logical Volume Manager
 - 스토리지 구성
    - 스토리지: 256 GB
 - 공용 SSH 키 추가
    - PuTTY gen으로 SSH키를 generate 한다. (private key는 저장해준다.)
    - 만들어진 Public 키를 넣어준다.
 - 라이센스 유형: 라이센스 포함됨
 - 네트워크 정보 지정: 만들어둔 VCN, 공용 서브넷
 - 데이터베이스 이름: OTCL
 - 데이터베이스 이미지: Oracle Database 18c
 - 관리자 인증서 생성
    - 사용자 이름: sys
    - 비밀번호: VERYWelcome123_# -> 추후 welcome1로 변경
```
<br/>

### 오라클 클라우드 DB 서비스 확인하기

```bash
# ora 서비스 확인
ps -ef|grep ora

# oracle 계정으로 이동
sudo -i
su - oracle

# DB 상태 확인
sqlplus "/as sysdba"
SELECT * FROM TAB;
SELECT INSTANCE_NAME FROM V$INSTANCE;

# 1521 포트 확인
# 클라우드 VCN > 보안 목록에서 수신 규칙을 추가한다. (0.0.0.0/0, 대상 포트 1521)
lsnrctl status
```
