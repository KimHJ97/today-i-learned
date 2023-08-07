# Docker

도커(Docker)는 컨테이너화된 응용 프로그램을 만들고 배포하기 위한 오픈 소스 플랫폼입니다.  
컨테이너는 소프트웨어를 실행하는 환경을 포함하는 가볍고 표준화된 단위로, 이를 통해 응용 프로그램과 그에 필요한 모든 종속성(라이브러리, 설정 파일 등)을 격리된 환경에서 실행할 수 있습니다.

<br/>

## Docker 기본 명령어

 - latest 버전인 경우 버전 생략이 가능하다.
```Bash
# 도커 저장소에서 이미지를 다운로드
$ docker pull <이미지:버전>

# 설치된 이미지 목록 출력
$ docker images

# 설치된 이미지 삭제
$ docker rmi 이미지

# 컨테이너 실행
$ docker run <이미지:버전>
$ docker run --name 컨테이너명 <이미지:버전>
$ docker run -d --name 컨테이너명 <이미지:버전>
$ docker run -d --name 컨테이너명 --port 8080:80 <이미지:버전>
$ docker start 컨테이너

# 볼륨 마운트
$ docker run \
    --name "컨테이너명"
    -v "$(pwd)/폴더명:/폴더명" \
    -e "환경변수=값"\
    --network 네트워크명 \
    이미지명:버전

# 컨테이너 목록 출력
$ docker ps
$ docker ps -a # 정지된 컨테이너도 포함

# 컨테이너 정지
$ docker stop 컨테이너

# 컨테이너 삭제
$ docker rm 컨테이너
$ docker rm -f 컨테이너

# 실행중인 컨테이너에 명령어 수행
$ docker exec -it 컨테이너 /bin/bash

# 사용하지 않는 데이터 정리
$ docker image prune # 사용하지 않는 이미지 삭제
$ docker container prune # 모든 정지된 컨테이너 삭제
$ docker system prune
```

 - 도커 저장소 및 빌드 관련 명령어
    - 도커 허브에 저장시 보통 '계정명/이미지명:버전' 으로 태그를 정의한다. (ex: hj_kim97/my-image:latest)
```Bash
# 로그인 및 로그아웃
$ docker login
$ docker logout

# Dockerfile 빌드 (Dockerfile -> 도커 이미지)
$ docker build -t 이미지명 .
$ docker build --tag 이미지명 .
$ docker build -t 이미지명 -f /디렉토리/도커파일명 
$ docker build --tag 이미지명 --file /디렉토리/도커파일명 

# 설치된 이미지 태그 정의
$ docker image tag 이미지:태그 변경이미지:태그

# 도커 허브에 업로드
$ docker push 이미지명
```

 - 도커 네트워크
    - 도커 네트워크(Docker Networking)는 도커 컨테이너들 간의 통신을 관리하고, 컨테이너와 호스트 시스템 및 외부 네트워크 간의 연결을 설정하는 기능을 제공하는 도커의 네트워킹 기능입니다. 도커 네트워크를 사용하면 컨테이너들이 서로 통신하거나 외부와 통신하는 데 필요한 네트워크 설정을 쉽게 구성할 수 있습니다.
        - 컨테이너 간 통신, 컨테이너와 호스트 간 통신, 외부 네트워크와의 연결 등
    - 네트워크 드라이버 종류
        - 브리지 네트워크(Bridge Network): 기본 네트워크 모드로, 도커가 설치된 호스트 시스템에 가상 브리지를 생성하여 컨테이너를 연결합니다. 컨테이너는 브리지 네트워크 내에서 IP 주소를 할당 받고 서로 통신할 수 있습니다. (동일한 호스트 내에서 컨테이너 간의 통신을 도와준다.)
        - 호스트 네트워크(Host Network): 컨테이너를 호스트의 네트워크 스택에 직접 연결하는 모드입니다. 컨테이너는 호스트의 네트워크 인터페이스를 공유하며, 호스트와 동일한 IP 주소 범위를 사용합니다. (호스트의 네트워크를 직접 사용한다.)
        - 오버레이 네트워크(Overlay Network): 여러 호스트에 걸쳐 있는 컨테이너들 간의 네트워크 통신을 지원하는 모드로, 컨테이너들 간에 보안적인 격리를 유지하면서도 통신할 수 있게 해줍니다. (서로 다른 호스트의 컨테이너 간 통신을 도와준다.)
        - 맥빈 네트워크(Macvlan Network): 컨테이너에 실제 하드웨어 MAC 주소를 할당하여 호스트와 동일한 물리적 네트워크에 연결되도록 하는 모드입니다.
```Bash
# 네트워크 목록 출력
$ docker network ls

# 네트워크 자세히 확인
$ docker network inspect 네트워크아이디

# 네트워크 만들기
$ docker network create 네트워크명
```

<br/>

## 도커 파일

도커 파일(Dockerfile)은 도커 이미지를 생성하기 위한 설정 파일입니다.  
도커 이미지는 컨테이너화된 애플리케이션을 실행하는 데 필요한 파일 시스템과 실행 환경을 포함하고 있습니다.  
도커 파일은 이러한 이미지를 어떻게 구성하고 빌드할지를 정의하는데 사용됩니다.

 - 도커 파일 예제
    - FROM python:3.9-slim: Python 3.9 버전의 slim 베이스 이미지를 선택합니다.
    - WORKDIR /app: 작업 디렉토리를 /app로 설정합니다.
    - COPY . /app: 호스트 시스템의 현재 디렉토리의 파일을 컨테이너의 /app 디렉토리로 복사합니다.
    - RUN pip install --no-cache-dir -r requirements.txt: 필요한 Python 패키지를 설치합니다. (파일명이 requirements.txt인 경우)
    - CMD ["python", "app.py"]: 컨테이너 내에서 실행할 명령을 지정합니다. 여기서는 python app.py를 실행하여 애플리케이션을 시작합니다.
```Dockerfile
# 베이스 이미지 선택
FROM python:3.9-slim

# 작업 디렉토리 설정
WORKDIR /app

# 호스트의 현재 디렉토리의 파일을 컨테이너의 /app 디렉토리로 복사
COPY . /app

# 필요한 패키지 설치
RUN pip install --no-cache-dir -r requirements.txt

# 컨테이너 내에서 실행할 명령 정의
CMD ["python", "app.py"]
```

<br/>

## 도커 컴포즈

도커 컴포즈(Docker Compose)는 여러 개의 도커 컨테이너를 정의하고 실행하는 데 사용되는 도구입니다.  
컨테이너화된 응용 프로그램을 구성하고 실행하기 위한 설정을 YAML 파일에 정의하여, 복잡한 다중 컨테이너 애플리케이션의 관리를 단순화합니다.  
도커 컴포즈를 사용하면 단일 호스트에서 여러 컨테이너들을 조합하여 애플리케이션을 실행하고, 개발, 테스트 및 배포 환경을 쉽게 구성할 수 있습니다.
 - 단순한 구성: YAML 파일을 사용하여 컨테이너, 네트워크, 볼륨 등을 정의하고 구성할 수 있습니다.
 - 다중 컨테이너 애플리케이션: 여러 개의 컨테이너로 구성된 복잡한 애플리케이션을 정의하고 실행할 수 있습니다.
 - 환경 분리: 서로 다른 환경(개발, 테스트, 운영 등)에 따라 설정을 구성하고 관리할 수 있습니다.
 - 컨테이너 간 통신: 도커 컴포즈는 네트워크 설정을 제공하여 컨테이너 간 통신을 지원합니다
 - 볼륨 및 데이터 관리: 데이터를 컨테이너 내부에서 관리하는 것 외에도, 볼륨을 사용하여 데이터를 영구적으로 저장하고 공유할 수 있습니다.
 - 스케일링 및 관리: 애플리케이션의 컨테이너 수를 조정하거나 업데이트할 수 있습니다.
 - 간단한 실행 및 중지: 애플리케이션을 실행하거나 중지할 때 단순한 명령어를 사용할 수 있습니다.

 - 도커 컴포즈 예제
    - services
        - 실행하려는 컨테이너들을 정의하는 역할
        - 이름, 이미지, 포트 매핑, 환경 변수, 볼륨 등을 포함
        - 해당 정보를 가지고 컨테이너를 생성하고 관리
        - image: 컨테이너를 생성할 때 쓰일 이미지 지정
        - build: 정의된 도커 파일에서 이미지를 빌드해 서비스의 컨테이너를 생성하도록 설정
        - environment: 환경 변수 설정, docker run 명령어의 --env, -e 옵션과 동일
        - command: 컨테이너가 실행될 때 수행할 명령어, docker run 명령어의 마지막에 붙는 커맨드와 동일
        - depends_on: 컨테이너 간의 의존성 주입, 명시된 컨테이너가 먼저 생성되고 실행
        - ports: 개방할 포트 지정, docker run 명령어의 -p와 동일
        - expose: 링크로 연계된 컨테이너에게만 공개할 포트 설정
        - volumes: 컨테이너에 볼륨을 마운트함
        - restart: 컨테이너가 종료될 때 재시작 정책
            - no: 재시작 되지 않음
            - always: 외부에 영향에 의해 종료 되었을 때 항상 재시작 (수동으로 끄기 전까지)
            - on-failure: 오류가 있을 시에 재시작
```YML
version: '3.0'

services:
  mariadb10:
    image: mariadb:10
    ports:
     - "3310:3306/tcp"
    environment:
      - MYSQL_ROOT_PASSWORD=my_db_passward
      - MYSQL_USER=docker_pro
      - MYSQL_PASSWORD=docker_pro_pass
      - MYSQL_DATABASE=docker_pro
  redis:
    image: redis
    command: redis-server --port 6379
    restart: always
    ports:
      - 6379:6379
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: 'rabbitmq'
    ports:
        - 5672:5672
        - 15672:15672
    volumes:
        - ~/.docker-conf/rabbitmq/data/:/var/lib/rabbitmq/
        - ~/.docker-conf/rabbitmq/log/:/var/log/rabbitmq
    networks:
        - rabbitmq_go_net

networks:
  rabbitmq_go_net:
    driver: bridge
```

 - 도커 컴포즈 명령어(CLI)
    - 이전 도커 버전에서는 'docker-compose' 명령어를 별도로 설치하여야만 했지만, 1.13 버전 이후 Docker CLI에 'docker compose'가 포함되어 나옴
```Bash
# 컴포즈 파일의 정의된 서비스 시작: 컨테이너 생성 + 실행
$ docker compose -f 컴포즈파일명 up
$ docker compose -f 컴포즈파일명 up -d

# 컴포즈 파일 빌드 및 실행: 이미지가 존재하더라도 새로 빌드하고 컨테이너 실행
$ docker compose -f 컴포즈파일명 up --build

# 컨테이너 정지
$ docker compose stop
$ docker compose stop redis # redis 컨테이너만 정지

# 정지한 컨테이너 재시작
$ docker compose start
$ docker compose start reids # redis 컨테이너만 재시작

# 컨테이너 상태 확인
$ docker compose ps
```