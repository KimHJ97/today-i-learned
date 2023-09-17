# Kubernetes와 Ansible 연동

## Ansible Server 작업

 - Ansible 서버에서 k8s 서버 요청 테스트
```Bash
# Ansible Server 접속
$ docker exec -it ansible-server bash

# k8s/hosts 파일 작성
$ mkdir k8s
$ cd k8s
$ vi hosts
[ansible-server]
localhost

[kubernetes]
192.168.32.10

# SSH 키를 만들고, Kubernetes 서버에 전달
$ ssh-keygen
$ ssh-copy-id root@192.168.32.10

# 명령어 테스트
$ ansible -i ./k8s/hosts kubernetes -m ping
$ ansible -i ./k8s/hosts kubernetes -m ping -u 계정
```

 - Ansible playbook으로 k8s Script 실행하기
```Bash
$ vi k8s-cicd-deployment-playbook.yml
$ vi k8s-cicd-service-playbook.yml

# Playbook 실행
$ ansible-playbook -i ./k8s/hosts k8s-cicd-deployment-playbook.yml -u 계정명

$ ansible-playbook -i ./k8s/hosts k8s-cicd-service-playbook.yml -u 계정명

```

 - cicd-devops-deployment.yml
    - K8S Master 서버에 위치한다.
    - 쿠버네티스에서 deployment, service, pod를 실행할 수 있는 스크립트 파일
    - kind: 리소스 종류(Deployment)
    - metadata: 메타 데이터(Deployment 이름)
    - spec: 해당 리소스의 특징
        - 레플리카 2개
        - 도커 허브의 이미지, 컨테이너명, 포트번호
```YML
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cicd-deployment
spec:
  selector:
    matchLabels:
      app: cicd-devops-project
  replicas: 2

  template:
    metadata:
      labels:
        app: cicd-devops-project
    spec:
      containers:
      - name: cicd-devops-project
        image: doran1534/cicd-project-ansible
        imagePullPolicy: Always
        ports:
        - containerPort: 8080

```

 - cicd-devops-service.yml
    - K8S Master 서버에 위치한다.
    - k8s에서 doran1534/cicd-project-ansible 이미지가 실행되었을 때 외부에서 접속 가능하도록 서비스를 설정한다.
    - metadata: 메타 데이터(Service의 이름)
    - spec: Service의 특징을 정의한다.
        - 컨테이너의 8080 포트를 targetPort로 공유한다.
```YML
apiVersion: v1
kind: Service
metadata:
  name: cicd-service
  labels:
    app: cicd-devops-project
spec:
  selector:
    app: cicd-devops-project
  type: NodePort
  ports:
    - port: 8080
      targetPort: 8080
      nodePort: 32000

```

 - k8s-cicd-deployment-playbook.yml
    - Ansible 서버에 위치한다.
    - 앤서블에서 쿠버네티스 서버에 명령어를 실행하는 스크립트 파일
        - kubernetes 호스트를 대상으로한다.
        - kubernetes 서버에 cicd-devops-deployment.yml 스크립트 파일로 생성된 기존 deployment를 삭제하고, 스크립트 파일을 통해 다시 생성한다.
    - 만약, playbook 실행시 kubectl 명령에서 오류가 나는 경우 '/usr/local/bin/kubectl' 처럼 kubectl의 풀경로로 실행하도록한다. (Path 등록이 안되어있을 수 있음)
```YML
- name: Create pods using deployment 
  hosts: kubernetes 
  # become: true
  # user: ubuntu
 
  tasks: 
  - name: delete the previous deployment
    command: kubectl delete deployment.apps/cicd-deployment

  - name: create a deployment
    command: kubectl apply -f cicd-devops-deployment.yml
```

 - k8s-cicd-service-playbook.yml
    - Ansible 서버에 위치한다.
    - 앤서블에서 쿠버네티스 서버에 명령어를 실행하는 스크립트 파일
        - kubernetes 호스트를 대상으로한다.
        - kubernetes 서버에 cicd-devops-service.yml 스크립트 파일로 service를 생성한다.
    - 만약, playbook 실행시 kubectl 명령에서 오류가 나는 경우 '/usr/local/bin/kubectl' 처럼 kubectl의 풀경로로 실행하도록한다. (Path 등록이 안되어있을 수 있음)
```YML
- name: create service for deployment
  hosts: kubernetes
  # become: true
  # user: ubuntu

  tasks:
  - name: create a service
    command: kubectl apply -f cicd-devops-service.yml
```

<br/>

## Jenkins + Ansible + Kubernetes 연동

 - Jenkins SSH Plugin에 k8s 서버 정보 등록
```
Manage Jenkins -> Configure System -> Publish over SSH

 - Add SSH Servers
    - Name: k8s-master
    - Hostname: [k8s-master's IP]
    - Username: root
    - Remote Directory: .
    - Passphrase/Password: 비밀번호
    - Port: 22
```

 - 프로젝트(Item) 만들기
    - 기존에 My-Ansble-Project의 내용을 복사하여 설정한다.
    - Jenkins에서 kubectl 명령어를 통해 호스트 PC의 쿠버네티스의 제어가 가능한지를 테스트한다.
```
 - Item name: My-K8s-Project
 - Copy from: My-Ansible-Project

 - Build Triggers(빌드 유발)
    - SSH Server: k8s-master

    - Source files: target/*.war
    - Remote directory: .
    - Exec command
kubectl apply -f cicd-devops-deployment.yml
```

 - 프로젝트(Item) 만들기
    - 기존에 My-K8s-Project의 내용을 복사하여 설정한다.
    - Jenkins에서 Ansible 서버의 Playbook 파일을 실행하여 k8s 서버에 pod가 실행되도록한다.
```
 - Item name: My-K8s-Project-using-Ansible
 - Copy from: My-K8s-Project

 - Build Triggers
    - SSH Server: ansible-host

    - Source files: target/*.war
    - Remote directory: .
    - Exec command
ansible-playbook -i ./k8s/hosts k8s-cicd-deployment-playbook.yml -u 계정
ansible-playbook -i ./k8s/hosts k8s-cicd-service-playbook.yml -u 계정
```

