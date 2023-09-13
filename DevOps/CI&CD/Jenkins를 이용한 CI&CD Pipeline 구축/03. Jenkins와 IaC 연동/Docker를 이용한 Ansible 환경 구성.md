# Docker를 이용한 Ansible 환경 구축하기

 - 참고
    - https://try-it.tistory.com/49
    - https://kibbomi.tistory.com/258

<br/>

## Worker Container 만들기

 - Ubuntu OS가 설치된 Worker Container를 만든다.
```Bash
# 컨테이너 1
$docker run -it -d --name vm1 -p 8080:80 ubuntu

# 컨테이너 2
$docker run -it -d --name vm2 -p 8081:80 ubuntu
```

 - SSH 설치
    - Ansible을 사용하기 위한 SSH를 설치한다.
    - 2개 워커 컨테이너 모두 진행해야 한다.
```Bash
# 컨테이너 1 접속
$ docker exec -it vm1 /bin/bash

# SSH와 Vim 에디터 라이브러리 설치
$ apt-get update
$ apt-get install -y openssh-server
$ apt-get install -y vim

# root 계정으로 사용시 SSH 설정 변경
$ passwd
$ vim /etc/ssh/sshd_config
Port 22
..
PermitRootLogin yes

# SSH 서비스 실행
$ service ssh status
$ service ssh restart
```

<br/>

## Ansible Server 만들기

 - Ubuntu OS가 설치된 Ansible Server Container를 만든다.
```Bash
$ docker run -it -d --name ansible-server ubuntu
```

 - Ansible 설치
```Bash
# Ansible Server 컨테이너 접속
$ docker exec -it ansible-server /bin/bash

# Ansible 설치
$ apt-get update
$ apt-get install -y vim
$ apt-get install ansible
$ ansible --version
```

 - Worker Container IP 주소 얻기
```Bash
# 컨테이너 IP 조회
$ docker inspect vm1
$ docker inspect -f "{{ .NetworkSettings.IPAddress }}" vm1
```


 - Ansible 설정을 진행한다.
    - 어느 서버에 명령을 수행할 것인지
    - 어떤 명령을 보낼지 playbook을 지정한다.
```Bash
# Ansible 서버에 Worker Container 정보 등록
$ vi /etc/ansible/hosts
[webserver] 
172.17.0.2
172.17.0.3

# playbook 정의
$vim playbook-test.yaml
---
- hosts: webserver

  tasks:
  - name: Install nginx latest version
    apt:
     name: nginx
     state: latest
```


 - SSH Key 만들기
    - 서버가 SSH를 통하여 Worker 들에게 해당 Playbook을 전달해 Worker 들이 수행한다.
    - 이떄, Key를 사용하여 SSH에 접속할 수 있도록 Worker Container에 서버의 공개키를 적용해놓는다.
```Bash
$ ssh-keygen
$ ssh-copy-id .ssh/id_rsa_pub [worker's Ip addr]
```

 - 테스트
    - Ping이 되지 않는다면 Worker 계정의 패스워드 설정 또는 Worker SSH 서비스 상태를 확인한다.
```Bash
$ ansible -m ping all
```

 - 배포
```Bash
# 문법 체크
$ ansible-playbook playbook-test --syntax-check

# 실행
$ ansible-playbook playbook-test.yaml
```