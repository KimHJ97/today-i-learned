# Jenkins + Infrastructure as Code 와의 연동

## IaC 개요와 Ansible 이해

 - DevOps Tools 순위
    - DevOps 닷컴: https://devops.com/11-open-source-devops-tools-we-love-for-2021
    - 1. 쿠버네티스(Kubernetes)
    - 2. 도커(Docker)
    - 3. Istio
    - 4. 깃헙 액션(Github Actions)
    - 5. 젠킨스(Jenkins)
    - 6. 프로메테우스(Prometheus)
    - 7. 앤서블(Ansible)
    - 8. 쉐프(Chef)
    - 9. 테라폼(Terraform)
    - 10. 잼스택(JAMStack)
    - 11. ELK Stack

<br/>

### IaC

IaC 또는 "Infrastructure as Code(인프라스트럭처 애즈 코드)"는 IT 인프라스트럭처를 코드로 정의하고 프로그래밍 방식으로 관리하는 개념을 나타냅니다. IaC는 기존의 수동 또는 관리자 중심의 방식에서 벗어나, 인프라를 소프트웨어로 관리하고 구성할 수 있도록 도와주는 접근 방식을 제공합니다.  

IaC는 다양한 도구와 플랫폼을 통해 구현할 수 있으며, 이러한 도구에는 Terraform, Ansible, Puppet, Chef, AWS CloudFormation, Azure Resource Manager 등이 포함됩니다. 이러한 도구는 다양한 클라우드 제공 업체 및 온프레미스 환경에서 사용할 수 있으며, 각각의 도구는 특정한 용도나 요구 사항을 충족시키기 위해 설계되었습니다.  

 - 시스템, 하드웨어 또는 인터페이스의 구성 정보를 파일(스크립트)을 통해 관리 및 프로비저닝
 - IT 인프라 스트럭처, 베어 메탈 서버 등의 물리 장비 및 가상 머신과 관련된 구성 리소스를 관리
 - 버전 관리를 통한 리소스 관리

```
 - Puppet
    - 개발사: Puppet Labs
    - 등장: 2005.08
    - 개발언어: Ruby
    - Base: Puppet Forge
    - Web UI: Puppet Enterprise
    - Definition File: 자체 DSL, 내장 Ruby
    - Agent: 필요
 - Chef
    - 개발사: Opscode
    - 등장: 2009.01
    - 개발언어: Ruby, Erlang
    - Base: Chef Supermarket
    - Web UI: Chef Manage
    - Definition File: 자체 DSL (Ruby 베이스)
    - Agent: 필요
 - Salt
    - 개발사: SaltStack
    - 등장: 2011.03
    - 개발언어: Python
    - Base: Slag-Formula
    - Web UI: SaltStack Enterprise
    - Definition File: YAML, 자체 DSL (Python 베이스)
    - Agent: 필요 or 불필요
 - Ansible
    - 개발사: Redhat
    - 등장: 2012.03
    - 개발언어: Python
    - Base: Ansible Galaxy
    - Web UI: Ansible Tower
    - Definition File: YAML
    - Agent: 불필요 (Python 언어의 네트워크 모듈 이용)
```

<br/>

### Ansible

Ansible은 오픈 소스 자동화 도구로, 시스템 관리, 설정 관리, 애플리케이션 배포 및 작업 자동화를 위해 사용됩니다. Ansible은 YAML 문법을 사용하여 인프라스트럭처와 애플리케이션 구성을 정의하고, SSH를 통해 원격 시스템에 명령을 전송하여 필요한 작업을 수행합니다. Ansible은 간편한 사용법과 강력한 확장성을 제공하며, 서버 관리 및 인프라스트럭처 관리를 자동화하는 데 널리 사용됩니다.  
 - 여러 개의 서버를 효율적으로 관리할 수 있게 해주는 환경 구성 자동화 도구
    - Configuration Management, Deployment & Orchestration tool
    - IT infrastructure 자동화
 - Push 기반 서비스
 - Simple, Agentless(호스트에 에이전트 설치가 필요하지 않다.)
 - Ansible을 통해 할 수 있는 일
    - 설치: apt-get, yum, homebrew 등
    - 파일 및 스크립트 배포: copy
    - 다운로드: get_url, git
    - 실행: shell, task
    - 기타: Version Control(Git, Mercurial), Secrets Management(Vault), Infrastructure(AWS, Azure, GCP), Feddback(Slack, Rocket Chat), Containers(OpenShift, Docker, Kubernetes), Build & Test(JUnit, Maven), Operating Systems(Redhat, Windows, Linux)

```
# Ansible 설치 예시

 - Ansible Server 설치 (Linux)
$ yum install ansible
$ ansible --version

 - 환경 설정 파일: /etc/ansible/ansible.cfg

 - Ansible 에서 접속하는 호스트 목록: /etc/ansible/hosts
[nginx]
172.20.10.11
172.20.10.12
172.20.10.13
```

<br/>

### Ansible 설치 및 실습

 - Docker를 이용한 Ansible 설치
    - 도커 허브: https://hub.docker.com/u/edowon0623
    - 도커 파일 내용: https://github.com/joneconsulting/docker-files
```Bash
# Windows
$ docker pull edown0623/ansible

# Apple M1
$ docker pull edowon0623/ansible-server:m1

# 실행: DooD 방식
$ docker run -itd --name ansible-server -p 20022:22 -e container=docker --tmpfs /run --tmpfs /tmp -v /sys/fs/cgroup:/sys/fs/cgroup:ro -v /var/run/docker.sock:/var/run/docker.sock edowon0623/ansible:latest /usr/sbin/init

$ ssh root@localhost -p 20022
$ ssh-keygen -R [localhost]:20022 # 호스트 키 에러시

# Ansible 버전 확인
$ ansible --version
```

 - Ansible 서버 설정
    - Worker Container를 이전에 설치한 docker-server와 ansible-server로 한다.
    - $ docker inspect docker-server
    - $ docker inspect ansible-server
```Bash
# Worker 컨테이너 정보 등록
$ mkdir /etc/ansible
$ vi /etc/ansible/hosts
[devops]
172.17.0.3
172.17.0.4

# SSH 키 생성 및 전달
$ ssh-keygen
$ ssh-copy-id root@172.17.0.3
$ ssh-copy-id root@172.17.0.4
yes
P@ssw0rd
```

<br/>

### Ansible 모듈 및 기본 명령어

 - 실행 옵션
    - '-i'(--inventory-file): 적용될 호스트들에 대한 파일 정보
        - 해당 옵션이 없는 경우 '/etc/ansible/hosts' 파일을 참조한다.
    - '-m'(--module-name): 모듈 선택
    - '-k'(--ask-pass): 관리자 암호 요청
    - '-K'(--ask-become-pass): 관리자 권한 상승
    - '--list-hosts': 적용되는 호스트 목록
 - 멱등성
    - 같은 설정을 여러 번 적용하더라도 결과가 달라지지 않는 성질
 - Ansible Module
    - 공식 문서: https://docs.ansible.com/ansible/2.9/modules/list_of_all_modules.html
```Bash
# Ansible 응답 테스트
$ ansible all -m ping
$ ansible devops -m ping

# Ansible로 디스크 용량 확인: free -h
$ ansible all -m shell -a "free -h"

# Ansible로 파일 전송 테스트
$ touch test.txt
$ echo "Hello World" >> test.txt
$ ansible all -m copy -a "src=./test.txt dest=/tmp"

# Ansible로 패키지 설치
$ ansible devops -m yum -a "name=httpd state=present"
$ yum list installed | grep httpd
```

<br/>

### Ansible Playbook

Playbook은 Ansible에서 사용되는 자동화 작업을 정의하고 실행하기 위한 YAML 파일입니다. Playbook은 Ansible의 핵심 구성 요소 중 하나로, 여러 호스트에 대한 작업과 설정을 포함하는 스크립트와 같은 개념입니다. Playbook을 사용하면 복잡한 작업을 단순하게 정의하고, 다중 호스트에 대한 작업을 반복 가능한 방식으로 수행할 수 있습니다.  
 - 사용자가 원하는 내용을 미리 작성해 놓은 파일
    - ex) 설치, 파일 전송, 서비스 재시작 등
    - ex) 다수의 서버에 반복 작업을 처리하는 경우
 - Playbook 구성 요소
    - 호스트 그룹: 다른 호스트 그룹에 대한 작업을 정의할 수 있다. 호스트 그룹은 다중 호스트 또는 호스트 패턴을 정의하여 실행할 호스트를 선택한다.
    - 태스크: 태스크는 수행할 작업을 설명하며, Ansible 모듈을 사용하여 실행한다. 태스크는 명령 실행, 파일 복사, 패키지 설치, 서비스 재시작 등 다양한 작업을 수행할 수 있다.
    - 조건부 실행: Playbook은 조건부 실행을 지원한다. 특정 조건이 충족될 때만 태스크 또는 롤을 실행하도록 설정할 수 있따.
    - 롤: 롤은 Ansible Playbook을 구조화하고 재사용성을 높이는 데 사용되는 개념이다. 롤은 특정 작업 또는 서비스에 필요한 구성 요소와 작업을 모듈화하고 재사용 가능한 형태로 정의한다.
    - 핸들러: 핸들러는 특정 이벤트가 발생할 때 실행될 태스크를 정의한다. 예를 들어, 웹 서비스 재시작이 필요한 경우 핸들러를 사용하여 해당 작업을 처리할 수 있다.
```YML
# webservers 호스트 그룹에 대한 작업을 정의한다.
# 해당 Playbook은 Apache 웹 서버를 설치하고 구성 파일을 복사한 다음, Apache 서비스를 다시 시작한다.
---
- name: Configure Web Servers
  hosts: webservers
  become: yes
  vars:
    http_port: 80

  tasks:
    - name: Ensure Apache is installed
      apt:
        name: apache2
        state: present

    - name: Copy configuration file
      template:
        src: templates/httpd.conf.j2
        dest: /etc/httpd.conf
      notify: Restart Apache

  handlers:
    - name: Restart Apache
      service:
        name: apache2
        state: restarted
```

 - Playbook 실습
    - Script 파일 내용: https://github.com/joneconsulting/jenkins_cicd_script
```Bash
$ cd ~
$ vi first-playbook.yml
..

# first-playbook.yml 플레이북의 태스크를 실행
$ ansible-playbook first-playbook.yml

# first-playbook.yml 결과 확인
$ cat /etc/ansible/hosts

```

 - first-playbook.yml
    - '/etc/ansible/hosts' 파일에 mygroup 이라는 그룹 정보를 추가
```YML
---
- name: Add an ansible hosts
  hosts: localhost
  tasks:
    - name: Add an ansible hosts
      blockinfile:
        path: /etc/ansible/hosts
        block: |
          [mygroup]
          172.17.0.5
```

 - playbook-sample1.yml
    - 파일 복사 예제
    - 'sample.txt' 파일을 hosts의 '/tmp' 목적지로 복사한다.
```YML
- name: Ansible Copy Example Local to Remtoe 
  hosts: devops
  tasks:
    - name: copying file with playbook
      copy:
        src: ~/sample.txt
        dest: /tmp
        owner: root
        mode: 0644
```

 - playbook-sample2.yml
    - https://github.com/joneconsulting/jenkins_cicd_script/tree/master/playbook_script
    - 파일 다운로드 예제
```YML
---
- name: Download Tomcat9 from tomcat.apache.org
  hosts: all
  #become: yes
  # become_user: root
  tasks:
   - name: Create a Directory /opt/tomcat9
     file:
       path: /opt/tomcat9
       state: directory
       mode: 0755
   - name: Download the Tomcat checksum
     get_url:
       url: https://dlcdn.apache.org/tomcat/tomcat-9/v9.0.75/bin/apache-tomcat-9.0.75.tar.gz.sha512
       dest: /opt/tomcat9/apache-tomcat-9.0.75.tar.gz.sha512
   - name: Register the checksum value
     shell: cat /opt/tomcat9/apache-tomcat-9.0.75.tar.gz.sha512 | grep apache-tomcat-9.0.75.tar.gz | awk '{ print $1 }'
     register: tomcat_checksum_value
   - name: Download Tomcat using get_url
     get_url:
       url: https://dlcdn.apache.org/tomcat/tomcat-9/v9.0.75/bin/apache-tomcat-9.0.75.tar.gz
       dest: /opt/tomcat9
       mode: 0755
       checksum: sha512:{{ tomcat_checksum_value.stdout }}"
```
