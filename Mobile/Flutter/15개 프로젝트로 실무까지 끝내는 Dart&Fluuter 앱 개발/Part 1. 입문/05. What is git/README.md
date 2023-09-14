# What is git

## Git

Git은 분산 버전 관리 시스템(Distributed Version Control System, DVCS) 중 하나로, 소스 코드와 프로젝트 파일의 변경 이력을 효과적으로 관리하는 도구입니다. Git은 개발자들이 협업하고 소프트웨어 프로젝트를 추적하면서 버전 관리, 브랜치 관리, 충돌 해결 등 다양한 기능을 제공하여 소프트웨어 개발 프로세스를 단순화하고 개선합니다.  
 - 분산형 버전 관리 시스템으로 형상 관리 도구라고도 한다.
 - 여러 사용자가 동시에 작업할 수 있으며, 각 사용자의 작업 내용을 병합해 하나의 버전을 만들 수 있다.
 - 필요시 이전 버전의 롤백도 가능하며, 변경 사항을 추적하여 이전에 코드의 문제 등을 확인할 수 있다.
 - 여러 브랜치를 만들어 다양한 작업들을 동시에 진행할 수 있다.
 - 현업에서는 gitflow 등의 정책을 조직에서 적용하여 개발자간의 코드 리뷰, 버전 관리, 배포 등에 상당히 많이 활용되고 있다.

<br/>

## Github과 Git

 - 홈페이지: https://git-scm.com/
 - Git 튜토리얼 사이트: https://nulab.com/ko/learn/software-development/git-tutorial/
 - Git 튜토리얼 사이트2: https://learngitbranching.js.org/?locale=ko
 - 주요 명령어
    - git add
    - git commit
    - git push
    - git pull
```Bash
# Git 버전 관리 활성화
$ git init
$ echo "테스트" >> readme.md
$ git add .
$ git commit -m "Add readme.md"

# 원격 저장소 연동: origin 이라는 별칭으로 연동한다.
$ git remote add origin https://github.com/..

# 원격 저장소에 로컬 저장소 버전 관리 내역을 보낸다. (origin 원격 저장소에 main 브랜치)
$ git push -u origin main

# 원격 저장소에 내용을 로컬 저장소에 반영한다.
#   origin의 main 브랜치 내용을 현재 브랜치(main)에 반영
$ git pull origin main

# 로컬 저장소 브랜치와 원격 저장소 브랜치 매칭시키기
$ git branch --set-upstream-to=origin/main main
```
