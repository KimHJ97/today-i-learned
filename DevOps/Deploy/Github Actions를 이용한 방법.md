# Github Actions를 이용한 CI/CD

## Github Actions + S3 + CodeDeploy + EC2 배포

CI 툴(Travis CI, Github Actions)를 통해 코드가 빌드되고, 빌드 결과물이 S3에 업로드, Code Deploy에서 S3의 파일을 다운로드 후 배포 실행한다. 배포 실행은 appspec.yml에 정의된 내용이 실행된다. (files로 S3 파일을 전송하고, hooks로 전송 후 실행할 명령을 정의한다.)  

### 소스 코드 작업

 - `.github/workflows/deploy.yml`
```yml
name: Deploy to AWS ECS

on:
  pull_request:
    branches: [ main ]

env:
  BUCKET_NAME: 버킷이름
  BUCKET_DIR_NAME: 버킷디렉토리
  APPLICATION_NAME: 애플리케이션이름
  DEPLOYMENT_GROUP_NAME: 배포그룹이름

jobs:
  build:

    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew

      - name: Build with Gradle
        run: ./gradlew clean build -x test

      - name: 📦 Zip project files
        run: zip -r ./$GITHUB_SHA.zip .

      - name: 🌎 Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: 🚛 Upload to S3
        run: aws s3 cp --region ap-northeast-2 ./$GITHUB_SHA.zip s3://${{ env.BUCKET_NAME }}/${{ env.BUCKET_DIR_NAME }}/$GITHUB_SHA.zip

      - name: 🚀 Deploy to EC2 with CodeDeploy
        run: aws deploy create-deployment
          --application-name ${{ env.APPLICATION_NAME }}
          --deployment-config-name CodeDeployDefault.AllAtOnce
          --deployment-group-name ${{ env.DEPLOYMENT_GROUP_NAME }}
          --s3-location bucket=${{ env.BUCKET_NAME }},bundleType=zip,key=${{ env.BUCKET_DIR_NAME }}/$GITHUB_SHA.zip
```

 - `appspec.yml`
    - Code Deploy 배포 그룹 작업이 실행되면 소스 코드 루트 경로의 appspec.yml에 정의된 내용이 실행된다.
    - '/home/ec-user/backend' 경로에 모든 코드가 복사된다. 이후에 코드 루트 경로의 'scripts/after-deploy.sh'가 실행된다. 'scripts/after-deploy.sh'에서 배포 스크립트를 작성하면 된다.
    - '/home/ec2-user/backend' 경로에 코드의 '/docker/Dockerfile.yml'이 전송된다. 
```yml
version: 0.0
os: linux

files:
  - source: /
    destination: /home/ec2-user/backend
  - source: /docker/Dockerfile.yml
    destination: /home/ec2-user/backend
file_exists_behavior: OVERWRITE

permissions:
  - object: /home/ec2-user
    pattern: '**'
    owner: ec2-user
    group: ec2-user

hooks:
  AfterInstall:
    - location: scripts/after-deploy.sh
      timeout: 100000
      runas: root
```

 - `scripts/after-deploy.sh`
    - 전송받은 코드와 Dockerfile을 기반으로 이미지를 만들고, 컨테이너화한다.
```sh
DOCKER_IMAGE=서비스명
DOCKER_TAG=latest

docker ps -q --filter "name=$DOCKER_IMAGE" | xargs -r docker stop
docker ps -a -q --filter "name=$DOCKER_IMAGE" | xargs -r docker rm
docker images -q $DOCKER_IMAGE | xargs -r docker rmi
docker build -t $DOCKER_IMAGE:$DOCKER_TAG /home/ec2-user/backend
docker run -d --name $DOCKER_IMAGE -p 8080:8080 $DOCKER_IMAGE:$DOCKER_TAG
```

### AWS 작업

#### Github Actions에서 AWS에 접근하기 위한 키 발급

 - 보안 자격 증명 > 액세스 키 만들기
 - EC2에 적용할 역할 생성
    - AWSCodeDeployFullAccess, AmazonS3FullAccess, AmazonEC2RoleforAWSCodeDeploy
 - Code Deploy에 적용할 역할 생성
    - AmazonS3FullAccess
 - S3 버킷 생성

#### EC2에 Code Deploy Agent 설치

 - EC를 생성할 때 태그를 만든다. (Code Deploy에서 해당 태그를 지정하여 배포 실행할 때 해당 EC2 서버가 배포가 된다.)
 - Code Deploy Agent, Docker 등 설치
```bash
# Code Deploy Agent 설치
sudo yum update
sudo yum install ruby
sudo yum install wget

cd /home/ec2-user
wget https://bucket-name.s3.region-identifier.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto

systemctl status codedeploy-agent
systemctl start codedeploy-agent

# 인스턴스가 부팅될 때마다 Code Deploy Agent가 자동 실행되도록 스크립트 작성
sudo vim /etc/init.d/codedeploy-startup.sh
  #!/bin
  sudo service codedeploy-agent restart
sudo chmod +x /etc/init.d/codedeploy-startup.sh

# Docker 설치
sudo yum install docker -y
docker -v
```

#### Code Deploy

 - 애플리케이션 생성 (EC2/온프레미스)
 - 배포 그룹 생성 -> 태그 이름 입력, 서비스 역할(AWSCodeDeployRole)
