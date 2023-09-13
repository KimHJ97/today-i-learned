# Jenkins + Ansible 연동하기

 - 준비사항
    - Docker로 jenkins-server, ansible-server, docker-server 3개의 컨테이너가 띄워져있다.
    - jenkins-server: 172.17.0.2
    - ansible-server: 172.17.0.3
    - docker-server: 172.17.0.4
 - 스크립트
    - 예제에서 사용될 YML 파일에 대한 스크립트는 'scripts' 디렉토리 내용을 참고한다.
    - Dockerfile
        - 현재 디렉토리 내의 'hello-world.war' 파일을 tomcat 베이스 이미지의 '/usr/local/tomcat/webapps' 경로로 복사하여 이미지를 만든다.
    - first-devops-playbook.yml
        - 현재 디렉토리 내의 Dockerfile을 읽어서 이미지를 만든다.
    - first-devops-playbook2.yml
        - 현재 디렉토리 내의 Dockerfile을 읽어서 이미지를 만들고, 해당 이미지를 컨테이너화한다. (포트 주의, 컨테이너가 삭제되어야만 정상 동작)
    - first-devops-playbook3.yml
        - 먼저, 동작중인 컨테이너를 중단시킨다. (docker stop)
        - 이후, 해당 컨테이너를 삭제한다. (docker rm)
        - 해당 이미지를 삭제한다. (docker rmi)
        - 새로 이미지를 빌드한다. (docker build)
        - 빌드된 이미지로 컨테이너를 만든다. (docker run)
    - create-cicd-project-image-playbook.yml
        - 새로 이미지를 빌드한다. (docker build)
        - 빌드된 이미지를 도커 허브에 업로드한다. (docker push)
        - 도커 허브에 정상적으로 업로드되면 남아있는 이미지를 삭제한다. (docker rmi)
    - create-cicd-devops-container-playbook.yml
        - 동작중인 컨테이너 중단 (docker stop)
        - 해당 컨테이너 삭제 (docker rm)
        - 해당 이미지 삭제 (docker rmi)
        - 도커 허브에서 새로운 이미지를 다운로드 (docker pull)
        - 다운로드한 이미지로 컨테이너 실행 (docker run)

<br/>

 - Jenkins SSH 플러그인에 Ansible 서버 정보 추가
```
 - Jenkins 관리
    - Configure System
        - Publish over SSH
            - Add SSH Servers
                - Name: ansible-host
                - Hostname: 172.17.0.3
                - Username: root
                - Passphrase/Password: P@ssw0rd
                - Port: 22
```

<br/>

 - 새로운 Item 만들기
```
 - name: My-Ansible-Project
 - Copy form: My-Docker-Project

 - 소스 코드 관리
    - Repository URL: https://github.com/KimHJ97/cicd-test
    - Branch Specifier: */main

 - 빌드 유발
    - Poll SCM
        - Schedule: * * * * * 

 - 빌드 후 조치
    - Send build artifacts over SSH
        - Name: ansible-server
        - Transfer Set
            - Source files: target/*.war
            - Remove prefix: target
            - Remote directory: .
            - Exec command:
                ansible-playbook -i hosts first-devops-playbook.yml

```

 - ansible-server 테스트
    - Playbook 실행 명령어를 테스트한다.
```Bash
# 홈 디렉토리 이동
$ cd ~

# 호스트 파일 생성
$ vi hosts
172.17.0.3

# Playbook 실행: 호스트 파일을 지정한다.
$ ansible-playbook -i hosts first-devops-playbook.yml
```

<br/>

## Ansible + Docker + Docker Hub

 - Ansible 서버 테스트
    - Jenkins 자동화 이전에 Ansible 서버에 직접 도커 허브에 이미지 빌드와 컨테이너화를 테스트한다.
```Bash
# 이미지 확인 및 태그 변경
$ docker images
$ docker tag cicd-project-ansible doran1534/cicd-project-ansible

# 도커 허브에 이미지 업로드
$ docker login
..
Username: doran1534
Password: 비밀번호 입력

$ docker push doran1534/cicd-project-ansible

# Palybook 정의
# create-cicd-devops-image: 이미지 빌드 후 도커 허브에 업로드 (1개의 서버에서만 진행)
# create-cicd-devops-container: 컨테이너 종료 후 도커 허브에 이미지로 재배포
$ cd ~
$ vi create-cicd-devops-image.yml
..

$ vi create-cicd-devops-container.yml
..

# 호스트 파일 변경 (ansible-server, docker-server에서 동작하도록 등록)
$ vi hosts
172.17.0.3
172.17.0.4

# Playbook 수행
# 이미지 빌드 후 도커 허브 업로드는 ansible-server에서만 진행
# 빌드된 이미지를 도커 허브에서 다운로드받아 docker-server에서 컨테이너로 실행
$ ansible-playbook -i hosts create-cicd-devops-image.yml --limit 172.17.0.3
$ ansible-playbook -i hosts create-cicd-devops-container.yml --limit 172.17.0.4
```

<br/>

### Jenkins Item 적용

 - 새로운 Item 만들기
    - My-Ansible-Project와 내용이 동일하며, 빌드 후 조치만 변경한다.
```
 - name: My-Playbook-Project
 - Copy from: My-Ansible-Project

 - 빌드 후 조치
    - Send build artifacts over SSH
        - Name: ansible-server
        - Transfer Set
            - Source files: target/*.war
            - Remove prefix: target
            - Remote directory: .
            - Exec command:
ansible-playbook -i hosts create-cicd-devops-image.yml --limit 172.17.0.3
ansible-playbook -i hosts create-cicd-devops-container.yml --limit 172.17.0.4
```
