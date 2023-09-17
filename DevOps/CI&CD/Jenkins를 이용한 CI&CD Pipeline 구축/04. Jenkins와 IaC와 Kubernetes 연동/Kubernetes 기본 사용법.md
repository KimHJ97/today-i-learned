# Kubernetes 기본 사용법

## 기본 명령어

쿠버네티스를 사용하기 위해서는 kubectl이라는 쿠버네티스 커맨드 라인 도구를 사용할 수 있다.  

 - kubectl get
    - 쿠버네티스 리소스를 나열합니다.
    - 다양한 리소스 유형(파드, 서비스, 디플로이먼트 등)을 조회할 수 있습니다
```Bash
# 실행 중인 파드 출력
$ kubectl get pods

# 사용 중인 서비스 출력
$ kubectl get services
```

 - kubectl describe
    - 쿠버네티스 리소스의 자세한 정보를 출력합니다.
    - 이 명령을 사용하여 특정 리소스의 세부 정보를 확인할 수 있습니다.
```Bash
# 파드의 상세 정보 출력
$ kubectl describe pod <pod-name>
```

 - kubectl create
    - 새로운 쿠버네티스 리소스를 생성합니다.
    - YAML 또는 JSON 파일을 사용하여 리소스를 정의하고 생성할 수 있습니다.
```Bash
$ kubectl create -f deployment.yaml
```

 - kubectl apply
    - 새로운 쿠버네티스 리소스를 생성 또는 업데이트합니다.
    - 리소스 정의를 YAML 또는 JSON 파일로 제공하고, 이미 존재하는 리소스를 업데이트하거나 새로운 리소스를 생성합니다.
```Bash
$ kubectl apply -f deployment.yaml
```

 - kubectl delete
    - 쿠버네티스 리소스를 삭제합니다.
    - 파드, 서비스, 디플로이먼트 등의 리소스를 삭제할 수 있습니다.
```Bash
$ kubectl delete pod <pod-name>
```

 - kubectl exec
    - 실행 중인 파드 내부로 진입하여 컨테이너에서 명령을 실행합니다.
    - 이를 통해 디버깅 및 로그 확인 등을 수행할 수 있습니다.
```Bash
$ kubectl exec -it <pod-name> -- /bin/bash
```

 - kubectl logs
    - 파드의 로그를 확인합니다.
    - 특정 컨테이너의 로그를 출력하고 싶을 때 유용합니다.
```Bash
$ kubectl logs <pod-name> -c <container-name>
```

<br/>

## Nginx 예시

```Bash
$ kubectl run sample-nginx --image=nginx --port 80
pod/sample-nginx created

# pod 확인
$ kubectl get pods
NAME           READY   STATUS    RESTARTS   AGE
sample-nginx   1/1     Running   0          49s

# pod 정보 확인
$ kubectl describe pod/sample-nginx
Name:             sample-nginx
Namespace:        default
Priority:         0
Service Account:  default
..

# pod 삭제
$ kubectl delete pod/sample-nginx

# deployment 생성
# deployment는 쿠버네티스에서 애플리케이션을 배포하고 관리하는 데 사용된다.
$ kubectl create deployment sample-nginx --image=nginx
$ kubectl get deployments
$ kubectl get pods

$ kubectl scale deployment sample-nginx --replicas=2
$ kubectl get pods
$ kubectl scale deployment sample-nginx --replicas=1
$ kubectl get pods

# deployment 삭제
$ kubectl delete deployment.apps/sample-nginx
$ kubectl get pods
$ kubectl get deployments
```

 - apply 테스트
    - sample.yml 파일을 이용한다.
    - apply는 YAML 또는 JOSN 파일을 통해, 리소스를 생성 또는 업데이트할 수 있다.
```Bash
$ kubectl apply -f sample.yml

$ kubectl get deployments
$ kubectl get pods

# pod 접속
$ kubectl exec -it <pod-name> -- /bin/bash

# curl 라이브러리 설치 및 curl 요청
$ apt-get update
$ apt-get install -y curl wget
$ homstname -i
$ curl -X GET http://<IP Address>

# pod를 외부에서 사용할 수 있도록 설정
# 80 포트로 외부에 노출
$ kubectl get pods -o wide
$ kubectl get services
$ kubectl expose deployment nginx-deployment --port=80 --type=NodePort
$ kubectl get services

```
