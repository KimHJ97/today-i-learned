# Deployment

ReplicaSet의 Pod 복제 기능을 이용해 여러 개의 Pod을 한 번에 실행할 수 있다.  
또한, 선언한 replicas 수만큼 Pod 실행을 보장하며, Pod 실행 중에도 replicas 조정이 자유롭다.  
ReplicaSet은 Pod Template이 변경되더라도 새로운 Pod Template으로 배포하지 않고, replicas 숫자만을 확인하여 변경된 Pod을 만든다.  

 - Pod 배포를 위한 3가지 정보
 - selector: 어떤 Pod 집합을 대상으로 Replication 해야 하는지
 - replicas: 얼마나 Pod을 생성할지
 - Pod Template Image: Pod에서 어떤 컨테이너를 실행할지

<br/>

## Deployment 소개

Deployment는 Pod 배포 자동화를 위한 쿠버네티스 오브젝트이다.  
 -  새로운 Pod을 롤아웃/롤백할 때 ReplicaSet 생성을 대신해준다 (Pod 복제)
 - 다양한 배포 전략을 제공하고 이전 파드에서 새로운 파드로의 전환 속도를 제어할 수 있다.
 - Deployment는 ReplicaSet을 이용하여 자동으로 Pod을 배포해준다.
```yml
apiVersion: apps/v1 # Kubernetes API 버전
kind: Deployment # 오브젝트 타입
metadata: # 오브젝트를 유일하게 식별하기 위한 정보
  name: my-app # 오브젝트 이름
spec: # 사용자가 원하는 Pod의 바람직한 상태
  selector: # ReplicaSet을 통해 관리할 Pod을 선택하기 위한 label query
    matchLabels:
      app: my-app
  replicas: 3 # 실행하고자 하는 Pod 복제본 개수 선언
  template: # Pod 실행 정보 - Pod Template과 동일 (metadata, spec, …)
    metadata:
      labels:
        app: my-app # selector에 정의한 label을 포함해야한다
    spec:
      containers:
      - name: my-app
        image: my-app:1.0
```

<br/>

### Deployment 배포 전략

 - __Recreate(재생성)__

해당 방식은 이전 Pod을 모두 종료하고, 이후에 새로운 Pod을 replicas만큼 생성한다. 즉, __다운타임이 존재__ 한다.  

• 새로운 버전을 배포하기 전에 이전 버전이 즉시 종료됨  
• 컨테이너가 정상적으로 시작되기 전까지 서비스하지 못함  
• replicas 수만큼의 컴퓨팅 리소스 필요  
• 개발단계에서 유용  

<br/>

 - __RollingUpdate(롤링 업데이트)__

해당 방식은 새로운 Pod 생성과 이전 Pod 종료가 동시에 일어난다. 즉, 다운타임이 존재하지 않는다.  

• 새로운 버전을 배포하면서 이전 버전을 종료  
• 서비스 다운 타임 최소화  
• 동시에 실행되는 Pod의 개수가 replicas를 넘게 되므로 컴퓨팅 리소스 더 많이 필요  

<br/>

### Deployment 속도 제어 옵션

 - __maxUnavailable__
    - 롤링 업데이트를 수행하는 동안 유지하고자 하는 최소 Pod의 비율(수)을 지정할 수 있다
    - 최소 Pod 유지 비율 = 100 ‒ maxUnavailable 값
    - 예. replicas: 10, maxUnavailable: 30%
        - 이전 버전의 Pod을 replicas 수의 최대 30%까지 즉시 Scale Down 할 수 있다.
        - replicas를 10으로 선언했을 때, 이전 버전의 Pod을 3개까지 즉시 종료할 수 있다.
        - 새로운 버전의 Pod 생성과 이전 버전의 Pod 종료를 진행하면서 replicas 수의 70% 이상의 Pod을 항상 Running 상태로 유지해야 한다.
 - __maxSurge__
    - 롤링 업데이트를 수행하는 동안 허용할 수 있는 최대 Pod의 비율(수)을 지정할 수 있다
    - 최대 Pod 허용 비율 = maxSurge 값
    - 예. replicas: 10, maxSurge: 30%
        - 새로운 버전의 Pod을 replicas 수의 최대 30%까지 즉시 Scale Up 할 수 있다.
        - 새로운 버전의 Pod을 3개까지 즉시 생성할 수 있다.
        - 새로운 버전의 Pod 생성과 이전 버전의 Pod 종료를 진행하면서 총 Pod의 수가 replicas 수의 130%를 넘지 않도록 유지해야 한다.

<br/>

### Deployment 롤백

Deployment는 롤아웃 히스토리를 Revision # 으로 관리한다.  

```sh
# Revision #를 이용한 손쉬운 롤백
kubectl rollout undo deployment <deployment-name> --to-revision=1
```

### Deployment 이름 방식

Pod Template이 변경되면 pod-template-hash도 변경된다.  
즉, Pod Template이 변경되면 새로운 ReplicaSet이 생성된다.  

```sh
# Deployment가 생성하는 ReplicaSet 이름
<deployment-name>-<pod-template-hash>

# RepliaSet이 생성하는 Pod 이름
<deployment-name>-<pod-template-hash>-<임의의 문자열>

# pod-template-hash
Pod Template을 해싱한 값
```

<br/>

### Deployment 관련 명령어 정리

Deployment의 replicas를 변경하면, 새로운 ReplicaSet를 생성하지 않고 이미 생성한 ReplicaSet이 새로운 Pod을 desired - current replicas만큼 추가 생성한다.  

Deployment의 Pod Templcate 이미지를 변경하면, Deployment가 새로운 ReplicaSet를 생성하며, 이전 ReplicaSet은 자신이 관리하는 Pod을 모두 제거한다. 새로운 ReplicaSet은 새로운 Pod을 replicas 수만큼 생성한다.  

Deployment의 Pod Template 레이블을 ㅂ녀경하면, Deployment가 새로운 ReplicaSet를 생성하며, 이전 ReplicaSet은 자신이 관리하는 Pod을 모두 제거한다. 새로운 ReplicaSet은 새로운 Pod을 replicas 수만큼 생성한다.  

```sh
# Deployment 생성
kubectl apply -f <yaml 파일 경로>

# Deployment 이벤트 확인
kubectl describe deployment <deployment-name>

# Deployment를 통해 생성한 Pod 상태 변화 확인
kubectl get deployment -w

# Deployment 배포 진행중/완료 상태 확인
kubectl rollout status deployment <deployment-name>

# Deployment의 Pod replicas 변경
kubectl scale deployment <deployment-name> --replicas=<number-of-pod>

# Deployment의 컨테이너 Image 변경
kubectl set image deployment/<deployment-name> \
<container-name>=<image-name>

# ReplicaSet 이벤트 확인
kubectl describe rs <replicaset-name>

# ReplicaSet이 생성하는 Pod 상태 변화 확인
kubectl get rs -w

# 레이블 셀렉터로 리소스 삭제
kubectl delete all -l <label-key>=<label-value>
```

<br/>

### maxUnavailable, maxSurge

RollingUpdate 방식으로 배포할 때 속도 제어 옵션을 사용할 수 있다.  
 - __maxUnavailable__: Old Pod을 New Pod으로 전환하는 과정에서 Pod 제거와 생성을 반복할 때 최소로 유지해야 할 Pod의 개수 (desired replicas ‒ maxUnavailable)
 - __maxSurge__: Old Pod을 New Pod으로 전환하는 과정에서 Pod 제거와 생성을 반복할 때 동시에 존재할 수 있는 최대 Pod의 개수 (desired replicas + maxSurge)

<br/>

#### maxUnavailable, maxSurge가 필요한 이유

 - 기존에 실행 중인 Pod을 일시에 제거하면 새로운 Pod이 생성되기까지 서비스 중단이 발생할 수 있다
 - 모든 Old Pod을 New Pod으로 전환하는데 시간을 최소화할 수 있다
 - 새로운 Pod을 replicas 수만큼 미리 배포한다면 리소스가 부족할 수 있다 (약 2배 리소스 확보 필요)
 - 그래서 maxUnavailable을 이용해서 최소 서비스 운영에 영향을 주지 않을 만큼 유지해야 하는 Pod 수를 선언할 수 있다
 - maxSurge로 어떤 시점에 동시에 존재할 수 있는 최대 Pod 수를 선언하여 배포 속도를 조절함과 동시에 리소스를 제어할 수 있다
 - 유지해야할 Pod 수의 상한선과 하한선을 쿠버네티스에게 알리기 위한 옵션이다.

<br/>

### Deployment Rollback

Revision을 이용해 Deployment 롤백을 시도한다.  
Annotation을 이용해 Deployment 배포 시 사유를 남길 수 있다.  

```sh
# Revision 조회
kubectl rollout history
kubectl rollout history deployment/my-app --revision=2

# Revision으로 롤백
kubectl rollout undo deployment/<deployment-name>
kubectl rollout undo deployment/<deployment-name> --to-revision=1

# 배포 변경 사유 기록
kubectl annotate deployment/<deployment-name> \
kubernetes.io/change-cause=“some cause”
```

