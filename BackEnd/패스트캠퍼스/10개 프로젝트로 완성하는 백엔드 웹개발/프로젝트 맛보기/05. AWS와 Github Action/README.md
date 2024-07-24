# AWS와 Github Action

## Github Action

깃허브의 워크플로우 기능을 사용하기 위해서는 '.github/workflows/' 폴더를 만들어 YAML 파일을 작성한다.  

 - name: 워크플로우 이름
 - on-push-branches: 특정 브랜치가 PUSH 되었을 때 잡을 실행
 - jobs: 잡 정의
```yml
name: CI-CD

on:
  push:
    branches:
      - main

env:
  S3_BUCKET_NAME: s3-fastcampus
  RESOURCE_PATH: ./src/main/resources/application.yaml
  CODE_DEPLOY_APPLICATION_NAME: CODE-DEPLOY-FAST-CAMPUS
  CODE_DEPLOY_DEPLOYMENT_GROUP_NAME: CODE-DEPLOY-GROUP

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Set up JDK 11
        uses: actions/setup-java@v1
        with:
          java-version: 11

      - name: Set yaml file
        uses: microsoft/variable-substitution@v1
        with:
          files: ${{ env.RESOURCE_PATH }}
        env:
          override.value: ${{ secrets.DI_FROM_SECRET }}

      - name: Grant execute permission for gradlew
        run: chmod +x ./gradlew
        shell: bash

      - name: Build with Gradle
        run: ./gradlew build
        shell: bash

      - name: Make zip file
        run: zip -r ./$GITHUB_SHA .
        shell: bash

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Upload to S3
        run: aws s3 cp --region ap-northeast-2 ./$GITHUB_SHA.zip s3://$S3_BUCKET_NAME/$GITHUB_SHA.zip

      - name: Code Deploy
        run: |
          aws deploy create-deployment \
          --deployment-config-name CodeDeployDefault.AllAtOnce \
          --application-name ${{ env.CODE_DEPLOY_APPLICATION_NAME }} \
          --deployment-group-name ${{ env.CODE_DEPLOY_DEPLOYMENT_GROUP_NAME }} \
          --s3-location bucket=$S3_BUCKET_NAME,bundleType=zip,key=$GITHUB_SHA.zip
```

<br/>

## 추가 파일

 - `CodeDeploy LifeCycle`
    - Start
        - lifecycle의 첫 번째 이벤트로, CodeDeploy 에이전트를 자동으로 실행하고 인스턴스 배포가 시작된다.
    - ApplicationStop
        - 이전 프로그램을 중지하는 스크립트를 실행하는 단계이다.
        - 예를 들어 커머스 웹 어플리케이션을 운영하고 있는데 새 버전(v.1)을 배포할 경우 이 이벤트를 통해 구 버전(v.0)을 사용하지 않도록 설정하고 새 버전(v.1)을 수신하도록 인스턴스를 준비할 수 있다.
    - DownloadBundle
        - 이 이벤트 동안 CodeDeploy에이전트는 새 버전을 인스턴스로 가져온다.(ex CodeBuild에서 패키징된 zip 파일)
    - BeforeInstall
        - 이 이벤트를 통해 구버전의 설치 구성을 저장하고, 파일을 복호화하고, 현재 버전의 백업을 만들 수 있다.
    - Install
        - DownloadBundle을 통해 가져온 Bundle의 압축을 해제하고 appspec.yml에 정의된대로 파일을 지정한 경로로 복사한다.
    - AfterInstall
        - 이 이벤트를 통해 프로그램이 시작되기 전에 프로그램의 구성을 변경할 수 있다.
    - ApplicationStart
        - 이름에서 알 수 있듯이 어플리케이션을 구 버전(v.0) 대신 새 버전(v.1)로 설정한다.
    - ValidateService
        - 이 이벤트를 통해 배포가 성공했는지 확인할 수 있는 검증 로직을 실행할 수 있다.
    - End
        - lifecycle의 마지막 이벤트로, 인스턴스의 배포 성공유무를 중앙 서비스에 알린다.

 - `appspec.yml`
    - CodeDeploy AppSpec 파일 참조: https://docs.aws.amazon.com/ko_kr/codedeploy/latest/userguide/reference-appspec-file.html
    - files에 CodeDeploy에 업로드된 파일을 기준으로 source를 목적지 destination으로 전송한다.
    - 이후 ApplicationStart 훅으로 미리 정의한 스크립트를 실행한다.
```yml
version: 0.0
os: linux
files:
  - source: /
    destination: /home/ubuntu/github_action
    overwrite: yes

permissions:
  - object: /
    pattern: "**"
    owner: ubuntu
    group: ubuntu

hooks:
  ApplicationStart:
    - location: scripts/gh_deploy.sh
      timeout: 60
      runas: ubuntu
```

 - `scripts/gh_deploy.sh`
```sh
#!/bin/bash
PROJECT_NAME="github_action"
JAR_PATH="/home/ubuntu/github_action/build/libs/*.jar"
DEPLOY_PATH=/home/ubuntu/$PROJECT_NAME/
DEPLOY_LOG_PATH="/home/ubuntu/$PROJECT_NAME/deploy.log"
DEPLOY_ERR_LOG_PATH="/home/ubuntu/$PROJECT_NAME/deploy_err.log"
APPLICATION_LOG_PATH="/home/ubuntu/$PROJECT_NAME/application.log"
BUILD_JAR=$(ls $JAR_PATH)
JAR_NAME=$(basename $BUILD_JAR)

echo "===== 배포 시작 : $(date +%c) =====" >> $DEPLOY_LOG_PATH

echo "> build 파일명: $JAR_NAME" >> $DEPLOY_LOG_PATH
echo "> build 파일 복사" >> $DEPLOY_LOG_PATH
cp $BUILD_JAR $DEPLOY_PATH

echo "> 현재 동작중인 어플리케이션 pid 체크" >> $DEPLOY_LOG_PATH
CURRENT_PID=$(pgrep -f $JAR_NAME)

if [ -z $CURRENT_PID ]
then
  echo "> 현재 동작중인 어플리케이션 존재 X" >> $DEPLOY_LOG_PATH
else
  echo "> 현재 동작중인 어플리케이션 존재 O" >> $DEPLOY_LOG_PATH
  echo "> 현재 동작중인 어플리케이션 강제 종료 진행" >> $DEPLOY_LOG_PATH
  echo "> kill -9 $CURRENT_PID" >> $DEPLOY_LOG_PATH
  kill -9 $CURRENT_PID
fi

DEPLOY_JAR=$DEPLOY_PATH$JAR_NAME
echo "> DEPLOY_JAR 배포" >> $DEPLOY_LOG_PATH
nohup java -jar $DEPLOY_JAR >> $APPLICATION_LOG_PATH 2> $DEPLOY_ERR_LOG_PATH &

sleep 3

echo "> 배포 종료 : $(date +%c)" >> $DEPLOY_LOG_PATH
```

