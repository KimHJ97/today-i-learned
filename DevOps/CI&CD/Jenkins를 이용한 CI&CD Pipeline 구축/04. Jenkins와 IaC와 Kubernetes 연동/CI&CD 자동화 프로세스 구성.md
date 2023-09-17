# 전체 CI/CD 자동화 프로세스 구성

 - CI Jobs
    - git pull
    - create a docker image
    - push the image to the registry (Docker Hub)
    - remove the image from the local
 - CD Jobs
    - create a deployment (replicaset: 2)
    - create a service

<br/>

## CI 작업

### Script 파일

 - create-cicd-devops-image.yml
   - Jenkins에서 원격 저장소의 소스 코드를 가져오고, 해당 소스 코드를 빌드하여 WAR 파일을 만든다.
   - 해당 WAR 파일을 통해 도커 이미지를 만든다.
   - 만들어진 이미지를 도커 허브에 업로드한다.
   - 기존 로컬에 만들어진 이미지는 삭제한다.
```YML
- hosts: all
#   become: true

  tasks:
  - name: create a docker image with deployed waf file
    command: docker build -t doran1534/cicd-project-ansible .
    args: 
        chdir: /root
    
  - name: push the image on Docker Hub
    command: docker push doran1534/cicd-project-ansible

  - name: remove the docker image from the ansible server
    command: docker rmi doran1534/cicd-project-ansible  
    ignore_errors: yes

```

### Jenkins Item

 - Ansible Playbook을 이용한 Docker Iamge 생성 (CI Job)
   - 도커 허브에 Tomcat(WAR) 이미지가 업로드된다.
```
 - Item name: My-K8s-Project-for-CI
 - Copy from: My-K8s-Project-using-Ansible

 - Build Triggers(빌드 유발)
    - Poll SCM: * * * * *

 - Post-build Actions
   - SSH Server: ansible-host
   - Exec command
ansible-playbook -i ./k8s/hosts create-cicd-devops-image-playbook.yml --limit ansible-server
```

<br/>

## CD 작업

 - My-K8s-Project-for-CI Item 내용을 수정한다.
   - CI 빌드가 성공(stable)했을 때 다른 Item 빌드를 실행하도록 한다.
   - My-K8s-Project-using-Ansible 프로젝트는 Ansible 서버에 Playbook을 통해 CI 작업을 통해 만든 이미지에 대한 Deployment를 만들고, Service를 만들어 해당 포트를 열어준다.
```
 - Post-build Actions (빌드 후 조치)
   - Build other projects
      - My-K8s-Project-using-Ansible
      - Trigger only if build is stable
```
