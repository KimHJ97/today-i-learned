# Jenkins를 이용한 CI/CD

## EC2에 Jenkins 설치

 - EC2에 Docker + Jenkins 설치
```bash
sudo yum update -y
sudo yum install docker -y
docker -v

# 도커 실행
sudo service docker start

# docker 그룹에 ec-user 추가 
sudo usermod -aG docker ec2-user

# Docker에 Jenkins 컨테이너 실행
docker run -d \
  -p 8080:8080 \
  -p 50000:50000 \
  -v /home/ec2-user/jenkins:/var/jenkins_home \
  --name jenkins \
  jenkins/jenkins:lts

# 상세 정보 확인
docker inspect jenkins

# 초기 비밀번호 확인
docker exec -it jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

 - EC2 끼리 SSH 접속 설정
```bash
# 인스턴스 1: 키 생성
ssh-keygen -t rsa
ls -al .ssh/

# 인스턴스 1: 공개키 내용 확인
sudo cat .ssh/id_rsa.pub

# 인스턴스 2: 접속을 허용할 인스턴스에 authorized_keys에 가장 아랫부분에 복사
sudo vi .ssh/authorized_keys

# 인스턴스 1: 접속 테스트
ssh -i id_rsa ec2-user@ServerIP
```

 - Jenkins를 이용한 배포
    - 선행 작업
        - Jenkins 서버에서 RSA 키를 생성하고, 배포할 서버의 RSA의 공개키를 등록한다.
        - 배포할 서버에서 Jenkins 서버의 인바운드를 허용해준다.
    - 프로세스
        - 소스 코드 클론
        - 소스 코드 빌드
        - 빌드 결과물(*.jar) 파일을 배포 서버에 전송
        - 전송된 *.jar 파일을 이용하여 배포(Docker 컨테이너 방식, JRE 설치 방식)
```
pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = '서비스명'
        DOCKER_TAG = 'latest'

        TARGET_EC2 = '배포할 EC 서버 IP'
    }
    
    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'develop', url: '깃허브 URL'; 
            }
        }
        
        stage('Gradle Build') {
            steps {
                sh 'chmod +x ./gradlew'
                sh './gradlew clean build -x test'
            }
        }
        
        stage('Deploy') {
            steps {
                sshagent(['ec2-jenkins-ssh']) {
                    sh '''
                        scp -o StrictHostKeyChecking=no -r $(ls ./build/libs/*.jar | grep -v 'plain') ec2-user@${TARGET_EC2}:/home/ec2-user/
                        ssh -o StrictHostKeyChecking=no ec2-user@${TARGET_EC2} '
                            DOCKER_IMAGE=o2o-service
                            DOCKER_TAG=latest
                            
                            docker ps -q --filter "name=$DOCKER_IMAGE" | xargs -r docker stop
                            docker ps -a -q --filter "name=$DOCKER_IMAGE" | xargs -r docker rm
                            docker images -q $DOCKER_IMAGE | xargs -r docker rmi
                            docker build -t $DOCKER_IMAGE:$DOCKER_TAG /home/ec2-user/
                            docker run -d --name $DOCKER_IMAGE -p 8080:8080 $DOCKER_IMAGE:$DOCKER_TAG
                        '
                    '''
                }
            }
        }
    }
}
```
