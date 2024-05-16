# 운영 배포 방법

## 배포 파일 원격 서버로 전송

 - `SCP 명령어`
```bash
## 로컬의 file.txt를 원격 폴더로 전송
scp file.txt remote_username@1.1.1.1:/remote/directory

## 로컬의 file.txt를 원격 폴더의 NEW_FILE_NAME.txt로 전송
scp file.txt remote_username@1.1.1.1:/remote/directory/NEW_FILE_NAME.txt

## 특정 포트로전송
scp -P 1234 file.txt remote_username@1.1.1.1:/remote/directory

## 폴더 복사 및 전송
scp -r /local/directory remote_username@1.1.1.1:/remote/directory
```
<br/>

## 필수 리눅스 명령어

 - ``
    - man: CLI 명령어에 대한 상세한 정보 제공
    - lsof: 특정 포트에 정보 조회
    - nslookup: DNS 값으로 IP 조회
    - telnet: IP와 PORT 조합으로 현재 네트워크 환경에서 통신이 가능한지 체크
    - netstat: 네트워크 상태 확인
        - 
```bash
# man
man telnet
man grep

# lsof
lsof -i:8080
lsof -i:8000-8080

# nslookup
nslookup naver.com
nslookup google.com

# telnet
telnet IP PORT

# netstat
netstat -anlt
netstat -nltp
```
