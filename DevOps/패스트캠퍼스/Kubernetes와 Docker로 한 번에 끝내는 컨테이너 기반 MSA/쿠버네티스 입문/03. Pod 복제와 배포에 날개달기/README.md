# Pod 복제와 배포에 날개달기

## ReplicaSet

ReplicaSet은 Pod 복제본을 생성하고 관리한다.  
 - ReplicaSet을 이용해 Pod 복제 및 복구 작업을 자동화
 - 클러스터 관리자는 ReplicaSet을 만들어 필요한 Pod의 개수를 쿠버네티스에게 선언한다.
 - 쿠버네티스가 ReplicaSet 요청서에 선언된 replicas를 읽고 그 수만큼 Pod 실행을 보장한다.

```yml
apiVersion: apps/v1 # Kubernetes API 버전
kind: ReplicaSet # 오브젝트 타입
metadata: # 오브젝트를 유일하게 식별하기 위한 정보
  name: blue-app-rs # 오브젝트 이름
  labels: # 오브젝트 집합을 구할 때 사용할 이름표
    app: blue-app
spec: # 사용자가 원하는 Pod의 바람직한 상태
  selector: # ReplicaSet이 관리해야하는 Pod을 선택하기 위한 label query
    matchLabels:
      app: # Pod label query 작성
  replicas: # 실행하고자 하는 Pod 복제본 개수 선언
  template: # Pod 실행 정보 - Pod Template과 동일 (metadata, spec, …)
    metadata:
      labels:
        app: # Pod label
```

<br/>

### ReplicaSet 예제

 - `ReplicaSet.yml`
```yml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: <ReplicaSet-Name>
spec:
  selector:
    matchLabels:
      app: <Container-Name>
  replicas: 3
  template:
    metadata:
      labels:
        app: <Container-Name>
    spec:
      containers:
      - name: <Container-Name>
        image: <Image>
        ports:
        - containerPort: 8080
```

<br/>

 - `Bash`
```sh
# ReplicaSet 생성
kubectl apply -f <yaml 파일 경로>

# ReplicaSet 조회
kubectl get rs <ReplicaSet-Name> -o wide
kubectl describe rs <ReplicaSet-Name>

# Pod 조회
kubectl get pod -o wide

# Pod 포트포워딩
kubectl port-forward rs/<ReplicaSet-Name> 8080:8080
```

<br/>

### ReplicaSet 삭제

Pod 삭제시 ReplicaSet의 Pod의 갯수가 선언된 replicas와 일치하지 않으면 새로운 Pod 생성하여 replicas를 맞춘다.  
ReplicaSet 삭제시 해당 ReplicaSet과 Pod가 모두 삭제된다.  
ReplicaSet만 삭제하고 싶은 경우 고아 객체로 만드는 옵션을 사용한다.  

 - `Bash`
```sh
# Pod 삭제 -> Pod기 재생성된다.
kubectl delete pod <Pod-Name>

# ReplicaSet와 Pod 삭제
kubectl delete rs <ReplicaSet-Name>

# ReplicaSet만 삭제 (Pod을 고아 객체로 만듬)
kubectl delete rs <ReplicaSet-Name> --cascade=orphan

# Gracefully하게 ReplicaSet과 Pod 삭제
kubectl scale rs/<ReplicaSet-Name> --replicas 0
kubectl delete rs/<ReplicaSet-Name>
```

<br/>

### ReplicaSet Pod 템플릿

배포한 ReplicaSet의 Pod Template을 변경해도 기존 Pod에는 영향을 주지 않는다.  
ReplicaSet에 선언한 replicas 값이 변경 되었을 경우에만 Pod을 새로 생성하거나 제거한다.  

 - `실습 과정`
    - 1. ReplicaSet 생성
    - 2. ReplicaSet의 Pod Template 레이블 업데이트
    - 3. 실행 중인 Pod에는 변화가 없음을 확인
    - 4. Pod 개수 상태 변경
    - 5. 변경한 Pod Template로 새로운 Pod이 생성되었는지 확인
```sh
# 1. ReplicaSet 생성 
kubectl apply -f replicaset.yaml

# 2. ReplicaSet 생성 후 Pod 확인
kubectl get pod --show-labels

# 3. YML 파일 변경 후 변경한 ReplicaSet 반영
kubectl apply -f replicaset.yaml

# 4. Pod 확인 (변경 없음)
kubectl get pod --show-labels

# 5. Pod replica 1개 삭제
kubectl delete pod <pod-name>

# 6. Pod과 레이블 확인
kubectl get pod —-show-labels
```

<br/>

### ReplicaSet Pod 스케일링

ReplicaSet을 이용하면 실행중인 Pod의 갯수를 쉽게 늘리고 줄일 수 있다.  
ReplicaSet이 현재 실행 중인 Pod 수와 클러스터 관리자가 선언한 replicas 수를 비교하여 Pod 수를 조정한다.  

```sh
# ReplicaSet 생성
kubectl apply -f <yaml 파일 경로>

# ReplicaSet과 Pod Template 확인
kubectl get rs <replicaset-name> -o wide

# ReplicaSet 이벤트 확인
 kubectl describe rs <replicaset-name>

# ReplicaSet의 replicas 조절
kubectl scale rs <ReplicaSet-Name> --replicas=값
```

<br/>

### ReplicaSet 롤백

실행 중인 Pod 장애 시 ReplicaSet을 새로 생성하지 않고 이전 버전의 Pod을 배포할 수 있다.  
ReplicaSet이 관리하는 Pod에 결함이 생겼을 때 unmanaged Pod으로 변경하고 안전하게
디버깅할 수 있다.  

 - `Label 변경을 통한 롤백`
```sh
# ReplicaSet 생성: my-app:2.0 버전으로 Pod 생성
kubectl apply -f replicaset.yaml

# ReplicaSet의 my-app 컨테이너 이미지를 my-app:1.0 으로 변경
# 실행 중인 Pod은 변경하지 않고 Pot Template의 이미지만 변경
kubectl set image rs/myapp-replicaset my-app=my-app:1.0

# 실행 중인 2.0 버전의 모든 Pod Label 변경
# 관리되는 Pod Label로 새로 1.0버전의 이미지로 Pod가 생성된다. (롤백)
kubectl label pod <pod-name> app=to-be-fixed --overwrite
kubectl label pod <pod-name> app=to-be-fixed --overwrite
kubectl label pod <pod-name> app=to-be-fixed --overwrite
```

<br/>

 - `replicas 조정을 통한 롤백`
```sh
# ReplicaSet의 replicas를 0으로 변경 -> Pod 모두 삭제
kubectl scale rs myapp-replicaset --replicas 0

# ReplicaSet의 Pod Template 변경 후 replicas를 재변경
$ kubectl scale rs myapp-replicaset --replicas <number-of-pods>
```

<br/>

### ReplicaSet 관련 명령어 정리

```sh
# ReplicaSet 생성
kubectl apply -f <yaml 파일 경로>

# ReplicaSet과 Pod Template 확인
kubectl get rs <replicaset-name> -o wide

# ReplicaSet 이벤트 확인
kubectl describe rs <replicaset-name>

# ReplicaSet 이미지 변경
kubectl set image rs/<replicaset-name> <container>=<image>

# ReplicaSet replicas 수 변경
kubectl scale rs/<replicaset-name> --replicas <number-of-pods>

# ReplicaSet이 생성한 Pod와의 통신
kubectl port-forward rs/<replicaset-name> <host-port>:<container-port>

# Pod 레이블 변경
kubectl label pod <pod-name> <label-key>=<label-value> --overwrite

# Pod의 Owner 오브젝트 확인
kubectl get pod <pod-name> -o jsonpath="{.metadata.ownerReferneces[0].name}"
```

