## Windows 개발 환경 구축

### Flutter SDK 설치하기

 - 홈페이지: https://flutter-ko.dev/get-started/install
   - 디렉토리는 경로로는 한글 문자와 공백 문자를 포함하지 않는 것이 좋다.
   - 'C:\Program Files\' 경로에 설치하지 않는 것이 좋다.
 - 환경 변수 설정
   - 다운로드받은 Fluuter의 bin 디렉토리 경로를 추가한다.
   - ex) Path: 'C:\app\flutter\bin'

<br/>

### FVM을 활용하여 Flutter 설치하기

 - 홈페이지: https://fvm.app/
   - Windows에서는 chocolatey 라이브러리를 이용하여 설치가 가능하다.
 - chocolatey
   - Chocolatey는 윈도우에서 사용할 수 있는 커맨드라인 패키지 매니저
   - Linux의 apt(apt-get), yum, Mac의 Homebrew 처럼 패키지 설치 / 업데이트 / 삭제 등 에 사용하는 Windows용 패키지 매니저
 - chocolatey 라이브러리 설치
   - 홈페이지: https://chocolatey.org/
   - 설치 문서: https://docs.chocolatey.org/en-us/choco/setup
   - PowerShell 관리자 권한으로 실행
```Bash
# 실행 규칙 정책 확인: Restricted인 경우 아래 명령어 실행
Get-ExecutionPolicy
Set-ExecutionPolicy Bypass -Scope Process

# CMD로 설치
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "[System.Net.ServicePointManager]::SecurityProtocol = 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"

# Power Shell로 설치
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 설치 확인
C:\Users\PC>choco
Chocolatey v2.1.0
Please run 'choco -?' or 'choco <command> -?' for help menu.
```
 - FVM 라이브러리 설치
   - 만약, Flutter 환경 변수가 등록되어있는 상태라면 'throw FailThroughError()'가 발생할 수 있다. 이러한 경우 Flutter 환경 변수를 지워주고, chocolatey에서 fvm을 uninstall 해주고 다시 설치한다.
```Bash
# fvm 라이브러리 설치
$ choco install fvm
Chocolatey v2.1.0
Installing the following packages:
fvm
By installing, you accept licenses for the packages.

..

# fvm 설치 확인
$ fvm --version

# FailThroughError 오류 발생시
$ choco list
$ choco uninstall fvm
```
 - FVM 라이브러리 사용
   - fvm releases: Flutter 릴리즈 버전 확인
   - fvm install <Version>: Fluuter 해당 버전 설치
   - fvm global <Version>: 전역적으로 사용할 Flutter 버전 설정
```Bash
$ fvm releases
$ fvm install 3.10.6
$ fvm global 3.10.6
```

<br/>

### Android Studio 설치

 - 홈페이지: https://developer.android.com/studio
   - Hedgehog
      - 2023.1.1
      - 필요한 AGP 버전: 3.2-8.2
   - Giraffe
      - 2022.3.1
      - 필요한 AGP 버전: 3.2~8.1
 - 플러그인 설치
   - 안드로이드 스튜디오는 기본적으로 안드로이드를 개발하기 위한 개발도구이다. Flutter를 통한 개발을 하기 위해서는 Flutter 플러그인을 설치하여야 한다.
   - Flutter 플러그인을 설치하면 Dart와 Flutter가 설치된다.
 - 프로젝트 만들기
   - New Flutter Project
      - Flutter SDK path: fvm을 통한 버전 디렉토리 경로 클릭
```
Project name: 프로젝트명
Project location: 프로젝트가 저장될 폴더 경로 지정
Description: 프로젝트 설명
Project type: Application
Organization: com.example(패키지 이름같은 프로젝트 식별자)
Android language: Kotlin
iOS language: Swift
Platforms: Android, iOS
```

<br/>

### Java 설치하기

 - Java
   - Android의 경우 Native 언어로 Java와 Kotlin을 통해 개발이 가능하다.
   - Java는 JVM이라는 가상 머신을 활용하여 컴파일 된 프로그램을 실행하는 것이 특징이다.
   - JVM을 통해 여러 플랫폼에서도 하나의 언어로 동작할 수 있따.
   - Kotlin을 활용하여 Android 앱을 비롯 소프트웨어 개발 시에도 JVM을 활용하여 실행한다.
 - Fluitter에 Java가 필요한 이유
   - Flutter에서는 Java 언어가 아닌, JVM을 사용하기 위한 Java SDK가 필요하다.
   - Flutter로 개발을 진행하더라도 Java나 Kotlin을 기반으로 Android 앱을 구성한다.
   - 현재 안드로이드에서 권장하는 Java 버전은 11, 17이고 Java의 경우 Oracle Java 와 Open JDK 두 가지 종류로 나뉘게 된다.
   - Oracle Java는 상용 라이센스를 필요로 하는 대신, 여러 가지 지원과 더 긴 기간의 버전 지원을 제공한다.
   - Open JDK는 오픈 소스로 제공되어 별도의 라이센스가 필요없지만, 커뮤니티 내에서의 지원 등의 약점이 있다.
 - Open JDK 설치
   - 홈페이지: https://jdk.java.net
   - 다운로드: https://jdk.java.net/archive/
   - 다운로드를 받고, 해당 bin 폴더를 환경 변수로 등록해주어야 한다.
