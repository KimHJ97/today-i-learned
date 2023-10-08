# 상용 클라우드 환경에 배포하기

## Jenkins 서버 설치

 - Maven & Git 설치
```Bash
# 확장 패키지 설치
$ sudo amazon-linux-extra install epel -y

# Maven 설치
$ cd /opt
$ ls -ltr
$ sudo wget https://mirror.navercorp.com/apache/maven/maven-3/3.8.6/binaries/apache-maven-3.8.6-bin.tar.gz
$ sudo tar -xvf apache-maven-3.8.6-bin.tar.gz
$ sudo mv apache-maven-3.8.6 maven
$ cd maven/

# 환경 설정 정보 추가 (Maven 명령어)
$ vi ~/.bash_profile
..
M2_HOME=/opt/maven
PATH=$PATH:$M2_HOME:$M2_HOME/bin

$ source ~/.bash_profile
$ mvn --version

# Git 설치
$ sudo yum install -y git
```

 - Jenkins 설치
    - 공식 문서: https://pkg.jenkins.io/redhat-stable/
```Bash
# Jenkins를 설치할 수 있는 Repository 정보 등록
$ sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
$ sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

# JDK 설치
$ yum install fontconfig java-11-openjdk
$ sudo amazon-linux-extras install java-openjdk11

# JDK 버전 변경시
$ sudo /usr/sbin/alternatives --config java
$ java -version

# Jenkins 설치
$ yum install jenkins

# Jenkins 초기 비밀번호 확인
$ cat /var/lib/jenkins/secrets/initialAdminPassword
```

 - SSH 키 생성 및 전달
    - Jenkins 서버에서 Docker, Ansible 서버에 접속할 수 있도록 SSH 키를 만들고 전달한다.
    - 접속할려는 서버의 ~/.ssh/authorized_keys 파일에 추가한다.
```Bash
$ ssh-keygen -t rsa
$ cd ~/.ssh
$ ls -al
$ cat id_rsa.pub

# 명령어로 복사 후 접속 테스트
$ ssh-copy-id ec2-user@[ec2_ip_address] 
$ ssh ec2-user@[ec2_ip_address] 
```

<br/>

## Docker 서버 설치

 - Docker 설치
```Bash
# 확장 패키지 및 도커 설치
$ sudo amazon-linux-extras install epel -y
$ sudo yum install –y docker
$ docker --version

# Docker 데몬 실행
$ sudo systemctl enable docker
$ sudo systemctl start docker

# ec2-user 계정이 Docker 관련 커맨드 명령어를 사용하는데 문제가 없도록 설정 (그룹 설정)
# $ sudo chmod 666 /var/run/docker.sock
$ sudo usermod –aG docker ec2-user (인스턴스 재 접속)
$ sudo service docker start
$ docker run hello-world
```

<br/>

## Tomcat 서버 설치

 - Tomcat 설치
    - 공식 사이트: https://tomcat.apache.org/download-90.cgi
```Bash
# 확장 패키지 설치
$ sudo amazon-linux-extras install epel -y

# Tomcat 설치
$ cd /opt
$ wget https://mirror.navercorp.com/apache/tomcat/tomcat-9/v9.0.68/bin/apache-tomcat-9.0.68.tar.gz
$ tar –xvzf apache-tomcat-9.0.68.tar.gz

# 실행 권한 추가
# $ sudo chmod +x /opt/apache-tomcat-9.0.68/bin/startup.sh
# $ sudo chmod +x /opt/apache-tomcat-9.0.68/bin/shutdown.sh
$ chmod +x /opt/apache-tomcat-9.0.68
$ ln –s /opt/apache-tomcat-9.0.68/bin/startup.sh /usr/local/bin/tomcat_startup
$ ln –s /opt/apache-tomcat-9.0.68/bin/shutdown.sh /usr/local/bin/tomcat_shutdown

# Manager 디렉토리 권한 변경 (Valve 주석 처리)
$ sudo vi /opt/apache-tomcat-9.0.68/webapps/manager/META-INF/context.xml
$ sudo vi /opt/apache-tomcat-9.0.68/webapps/host-manager/META-INF/context.xml

# Tomcat 계정 추가 (하단 주석 해제[role, user])
$ sudo vi /opt/apache-tomcat-9.0.68/conf/tomcat-users.xml
<role rolename="manager-gui" />
<role rolename="manager-script" />
<role rolename="manager-jmx" />
<role rolename="manager-status" />
<user username="admin" password="admin" roles="manager-gui, manager-script, manager-jms, amanager-status"/>
<user username="deployer" password="deployer" roles="manager-script"/>
<user username="tomcat" password="tomcat" roles="manager-gui"/>
```

<br/>

## Ansible 서버

 - Ansible 설치
    - Ansible 서버에서 Tomcat, Docker 서버에 접속할 수 있도록 RSA 키를 생성하고, 해당 키를 Tomcat, Docker 서버에 전달한다.
```Bash
# 확장 패키지 설치
$ sudo amazon-linux-extras install epel -y

# Ansible 설치
$ sudo yum install –y ansible

# Ansible 서버 SSH Key 생성 및 전달
# 수동으로 전달시 id_rsa.pub 내용을 읽어서 복사하고, 해당 서버의 .ssh/authorized_keys에 내용을 추가한다.
$ ssh-keygen -t rsa
$ cd ~/.ssh
$ ls -al

$ ssh-copy-id ec2-user@[ec2_ip_address] 

# 접속 확인
$ SSH ec2-user@[ec2_ip_address]
```

 - Ansible hosts 설정
    - /etc/ansible/hosts
    - sudo vi /etc/ansible/hosts
```
[localhost]
localhost

[docker]
{ec2_docker_server_ip}

[tomcat]
{ec2_tomcat_server_ip}
```

 - Ansible 서버 접속 테스트
```Bash
# Docker 서버 접속 테스트
$ ansible docker -m ping

# Tomcat 서버 접속 테스트
$ ansible tomcat -m ping

# Localhost 테스트
$ ansible localhost -m ping
```

<br/>

## SonarQube 서버

 - SonarQube 설치
```Bash
$ sudo amazon-linux-extras install epel -y
$ sudo mkdir /opt/sonarqube
$ cd /opt/sonarqube
$ sudo wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-7.6.zip
$ sudo unzip sonarqube-7.6.zip
$ sudo chown -R ec2-user:ec2-user /opt/sonarqube/
```

 - SonarQube 포트 변경
    - EC2 보안 그룹에 9000번 포트 허용을 해주어야 한다.
    - 인바운드 규칙(사용자 지정 TCP, 9000, 0.0.0.0/0)
```Bash
$ cd /opt/sonarqube/soanrqube-7.6
$ vi ./conf/sonar-properties
sonar.web.port=9000
```

 - SonarQube 실행
```Bash
$ cd /opt/sonarqube/soanrqube-7.6/bin
$ cd linux-x86-64
$ ./sonar.sh start
$ ./sonar.sh status
```

<br/>

## Jenkins를 이용하여 Tomcat 서버에 배포하기

 - 플러그인 설치
    - Maven Integration plugin
    - Deploy to container Plugin

<br/>

 - 전역 도구 설정
    - Maven 설치 경로 지정
```
1. Maven (Add Maven)
 - Name: Maven 3.8.6
 - MAVEN_HOME: /opt/maven
```

<br/>

 - Item 생성
```
Name: My-Tomcat-Project
Project: Maven Project

소스 코드 관리 (Git)
 - Repository URL: Github 주소
 - Branch Specifier: */main

Build
 - Root POM: pom.xml
 - Goals and options: clean compile package

빌드 후 조치 (Deploy war/ear to container)
 - WAR/EAR files: **/*.war
 - Containers (Tomcat 9.x Remote)
    - Username: deployer
    - Password: deployer
    - ID: deployer_user1
    - Tomcat URL: Tomcat 서버(EC2) IP 입력
```

<br/>

 - Jenkins 서버 확인
    - 만들어진 Item을 빌드하고, 빌드 결과물이 정상적으로 존재하는지 확인
```Bash
$ cd /var/lib/jenkins/
$ cd workspace/
$ cd My-Tomcat-Project
```

<br/>

## Jenkins를 이용하여 Docker 서버에 배포하기

 - 플러그인 설치
    - Publish Over SSH

<br/>

 - 시스템 설정
    - Docker 서버의 SSH Server 정보를 등록한다.
    - 이때, Jenkins 서버의 RSA Private Key 값을 등록해주어야 한다. (id_rsa)
    - ~/.ssh/id_rsa
```
SSH Servers
 - Name: docker-server
 - Hostname: Docker 서버 IP
 - Username: ec2-user
 - Remote Directory: .
 - Use password authentication, or use a different key (체크)
    - Key: RSA 개인키 입력
```

<br/>

 - Item 생성
```
Name: My-Docker-Project
Project: Maven Project

소스 코드 관리 (Git)
 - Repository URL: Github 주소
 - Branch Specifier: */main

Build
 - Root POM: pom.xml
 - Goals and options: clean compile package

빌드 후 조치 (Send build artifacts over SSH)
 - Name: docker-server
 - Transfers
    - Source files: target/*.war
    - Remove prefix: target
    - Remote directory: .
    - Exec command
docker build --tag=cicd-project -f Dockerfile .;
docker run -d -p 8080:8080 --name mytomcat cicd-project:latest;
```

 - Docker 서버 설정
    - Jenkins 빌드를 하게 되면, hello-world.war 파일이 홈 디렉토리에 생성된다.
    - 해당 파일을 통해 Tomcat 이미지로 빌드하여 Docker를 통해 배포한다.
    - 이미지 빌드: docker build --tag=cicd-project -f Dockerfile .
    - Tomcat 실행: docker run -d -p 8080:8080 --name mytomcat cicd-project:latest
```Dockerfile
FROM tomcat:9.0

COPY ./hello-world.war /usr/local/tomcat/webapps
```

<br/>

## Jenkins를 이용하여 Ansible 서버에 배포하기

 - 시스템 설정
    - Ansible 서버의 SSH Server 정보를 등록한다.
    - 이때, Jenkins 서버의 RSA Private Key 값을 등록해주어야 한다. (id_rsa)
    - ~/.ssh/id_rsa
```
SSH Servers
 - Name: ansible-server
 - Hostname: Ansible 서버 IP
 - Username: ec2-user
 - Remote Directory: .
 - Use password authentication, or use a different key (체크)
    - Key: RSA 개인키 입력
```

<br/>

 - Item 생성
    - Docker 서버로 도커 이미지를 빌드한다.
    - Ansible 서버에서 빌드된 이미지를 컨테이너로 생성한다.
```
Name: My-Ansible-Project
Project: Maven Project

소스 코드 관리 (Git)
 - Repository URL: Github 주소
 - Branch Specifier: */main

Build
 - Root POM: pom.xml
 - Goals and options: clean compile package

빌드 후 조치 (Send build artifacts over SSH)
 - Name: docker-server
 - Transfers
    - Source files: target/*.war
    - Remove prefix: target
    - Remote directory: .
    - Exec command:
docker build --tag=doran1534/cicd-project-final -f Dockerfile .;

 - Name: ansible-server
 - Transfers
    - Source files:
    - Remove prefix:
    - Remote directory: .
    - Exec command:
ansible-playbook -i hosts create-cicd-devops-container.yml;
```

<br/>

 - Ansible 서버 설정
    - Playbook 파일을 생성해준다.
    - vi create-cicd-devops-container.yml
    - 현재 실행중인 컨테이너가 있으면 정지하고, 삭제한다.
    - 이후, cicd-project-final 이미지를 컨테이너화한다.
```YML
- hosts: all
#   become: true  

  tasks:
  - name: stop current running container
    command: docker stop my_cicd_project
    ignore_errors: yes

  - name: remove stopped cotainer
    command: docker rm my_cicd_project
    ignore_errors: yes

  - name: create a container using cicd-project-final image
    command: docker run -d --name my_cicd_project -p 8080:8080 doran1534/cicd-project-final
```
 - Ansible 서버 hosts 파일 설정
    - vi /home/ec2-user/hosts
```
[docker]
{ec2_docker_server_ip}
```
