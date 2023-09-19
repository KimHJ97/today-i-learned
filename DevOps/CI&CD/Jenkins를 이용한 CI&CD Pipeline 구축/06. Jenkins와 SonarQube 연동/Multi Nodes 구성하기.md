# Jenkins Master + Slaves

 - Remote에서 실행되는 Jenkins 실행 Node
 - Jenkins Master의 요청 처리
 - Master로부터 전달된 Job 실행
 - 다양한 운영 체제에서 실행 가능
 - Jenkins 프로젝트 생성 시 특정 Slave를 선택하여 실행 가능

<br/>

## Jenkins Node 추가하기

 - Jenkins Slave 서버 만들기
```Bash
$ docker run --privileged --name jenkins-node1 -itd -p 30022:22 -e container=docker -v /sys/fs/cgroup:/sys/fs/cgroup --cgroupns=host edowon0623/docker:latest /usr/sbin/init

# Jenkins 서버에 JDK 설치
$ ssh root@localhost -p 30022
$ yum install -y ncurses git
$ yum list java*jdk-devel
$ yum install -y java-11-openjdk-devel.aarch64

$ cd /root
$ mkdir slave1
$ exit

# Jenkins Master 서버에서 SSH 키 전달
$ ssh-keygen
$ ssh-copy-id root@[Slave IP]
```

 - Add a Slave Node
```
 - Jenkins 관리 > Manage Nodes > New Node
    - Node Name: slave1
    - Description: Add a server as a slave machine
    - Number of executors: 5
    - Remote root directory: /root/slave1
    - Labels: slave1
    - Usage: Use this node as much as possible
    - Launch method: Launch agents via SSH
        - Host: [Slave IP]
        - Port: 22
        - Credentials: root/P@ssw0rd
```

 - Item 수정
    - My-First-Project를 이용한다.
```
 - Restrict where this project can be run 선택
    - Label Expression: slave1
```

<br/>

## Jenkins Slave Node에서 빌드하기

 - 새로운 Slave 서버 추가 (Slave2)
```Bash
$ docker run --privileged --name jenkins-node2 -itd -p 40022:22 -e container=docker -v /sys/fs/cgroup:/sys/fs/cgroup --cgroupns=host edowon0623/docker:latest /usr/sbin/init

# Jenkins 서버에 JDK 설치
$ ssh root@localhost -p 30022
$ yum install -y ncurses git
$ yum list java*jdk-devel
$ yum install -y java-11-openjdk-devel.aarch64

$ cd /root
$ mkdir slave2
$ exit

# Jenkins Master 서버에서 SSH 키 전달
$ ssh-keygen
$ ssh-copy-id root@[Slave IP]
```
 - Jenkins에 정보 추가
```
 - Jenkins 관리 > Manage Nodes > New Node
    - Node Name: slave2
    - Description: Add a server as a slave machine
    - Number of executors: 2
    - Remote root directory: /root/slave2
    - Labels: slave2
    - Usage: Use this node as much as possible
    - Launch method: Launch agents via SSH
        - Host: [Slave IP]
        - Port: 22
        - Credentials: root/P@ssw0rd
```

<br/>

 - Slave1으로 빌드하기
    - Slave1 서버의 워크디렉토리가 만들어진다.
```gradle
pipeline {
    agent {
        label 'slave1'
    }
    tools { 
      maven 'Maven 3.8.5'
    }
    stages {
        stage('github clone') {
            steps {
                git branch: 'main', url: 'https://github.com/KimHJ97/cicd-test.git'; 
            }
        }
        
        stage('build') {
            steps {
                sh '''
                    echo build start
                    mvn clean compile package -DskipTests=true
                '''
            }
        }

    }
}
```
