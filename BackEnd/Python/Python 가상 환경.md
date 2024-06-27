# Python 가상 환경

## Venv

venv는 Python의 표준 라이브러리 중 하나로, 별도의 패키지나 모듈 환경을 제공하는 가상 환경을 만들기 위해 사용할 수 있다. 즉, 프로젝트마다 다른 버전의 패키지를 사용하고 싶을 때, 이를 격리된 환경에서 관리할 수 있게 도와준다.  

파이썬 2에서는 virtualenv라는 외부 패키지를 사용해서 가상 환경을 구성하였지만, 파이썬 3.3부터는 venv 모듈이 기본적으로 포함되어 있어 별도의 외부 패키지 설치없이 파이썬만 설치되어 잇으면 바로 가상환경 환경 구성이 가능하게 되었다.
 - 격리된 환경: 다양한 프로젝트에서 서로 다른 패키지나  Python 버전의 충돌 없이 작업할 수 있다.
 - 버전 관리: 프로젝트별로 필요한 패키지와 그 버전을 쉽게 관리할 수 있다.
 - 의존성 문제 해결: 각 프로젝트의 의존성을 명확하게 알 수 있으므로 배포나 협업 시 문제를 최소화 할 수 있다.

<br/>

### 주요 명령어

```bash
# 가상환경 생성
python -m venv {가상환경이름}

# 가상환경 활성화
source {가상환경이름}/Scripts/activate

# 가상환경 비활성화
deactivate

# 패키지 설치
pip install {패키지명}

# 설치된 패키지 확인
pip freeze

# 설치된 패키지 리스트 추출
pip freeze > requirements.txt

# 추출된 패키지 목록 설치
pip install -r requirements.txt
```
<br/>

## Pipenv

pipenv는 파이썬에서도 패키지를 프로젝트 단위로 관리를 할 수 있도록 도와주는 고급 패키지 관리 도구입니다. 기본적으로 pip를 기반으로 동작하지만, 프로젝트 별로 격리된 가상 환경(virtual environment)과 프로젝트 단위의 패키지 관리 매커니즘을 제공합니다.  
 - 가상 환경 관리: Pipenv는 각 프로젝트별로 독립적인 가상 환경을 생성하고 관리합니다. 이를 통해 프로젝트 간의 종속성 충돌을 방지할 수 있습니다.
 - 의존성 관리: Pipfile과 Pipfile.lock 파일을 사용하여 프로젝트의 종속성을 명시적으로 관리합니다. Pipfile은 프로젝트의 패키지 목록을, Pipfile.lock은 설치된 패키지와 그 버전을 고정하여 재현 가능한 환경을 만듭니다.
 - 일관성 있는 설치: Pipfile.lock을 사용하여 다른 개발자나 배포 환경에서도 동일한 종속성 트리를 재현할 수 있습니다.

<br/>

### pipenv 설치

```bash
# Mac
brew install pipenv

# Window
pip install pipenv
```
<br/>

### 주요 명령어

```bash
# 가상환경 생성: 원하는 Python 버전을 지정하여 가상 환경 생성
pipenv --python 3.x

# 가상환경 활성화
pipenv shell

# 가상환경 비활성화
exit

# 패키지 설치
pipenv install {패키지명}

# 패키지 제거
pipenv uninstall {패키지명}

# 종속성 목록 확인
cat Pipfile
```
<br/>

### Pipfile 설명

Pipfile은 Pipenv가 종속성을 관리하기 위해 사용하는 설정 파일입니다. 이 파일은 프로젝트에서 필요한 Python 패키지와 해당 패키지의 버전 요구사항을 명시적으로 정의합니다. Pipfile은 기존의 requirements.txt 파일을 대체하며, 더 많은 기능과 유연성을 제공합니다.  
 - source: 패키지를 다운로드할 저장소(URL)를 정의합니다.
 - packages: 프로젝트에서 사용되는 일반 종속성을 정의합니다.
 - dev-packages: 개발 중에만 필요한 종속성을 정의합니다.
 - requires: Python 버전 요구사항을 정의합니다.
```
[[source]]
name = "pypi"
url = "https://pypi.org/simple"
verify_ssl = true

[requires]
python_version = "3.8"

[packages]
requests = "*"
flask = "==1.1.2"
numpy = {version = "*", index = "pypi"}

[dev-packages]
pytest = "*"
black = "*"
```
