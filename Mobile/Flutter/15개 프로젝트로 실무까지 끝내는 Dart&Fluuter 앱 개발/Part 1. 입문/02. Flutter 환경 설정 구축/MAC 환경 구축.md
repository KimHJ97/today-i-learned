## MAC 개발 환경 구축

### Flutter SDK 설치하기

 - 홈페이지: https://docs.flutter.dev/get-started/install/macos
    - Intel 칩, Apple Silicon 칩에 맞는 파일을 다운로드받는다.
    - Xcode와 Git이 설치되어 있어야 한다.
```Bash
# Apple 자체 칩인 경우(M1, M2, M3)
$ sudo softwareupdate --install-rosetta --agree-to-license

# 다운로드받은 알집을 풀어주고, 경로를 지정한다.
$ cd ~
$ mkdir app
$ cd app
$ unzip ~/Downloads/flutter_macos_3.13.4-stable.zip

$ export PATH="$PATH:`pwd`/flutter/bin"

# 설치 확인
$ flutter --version
```

<br/>

### Android Studio 설치

 - 홈페이지: https://developer.android.com/?hl=ko
    - Intel 칩, Apple Silicon 칩에 맞는 파일을 다운로드받는다.
 - 플러그인 설치
   - 안드로이드 스튜디오는 기본적으로 안드로이드를 개발하기 위한 개발도구이다. Flutter를 통한 개발을 하기 위해서는 Flutter 플러그인을 설치하여야 한다.
   - Flutter 플러그인을 설치하면 Dart와 Flutter가 설치된다.
 - 프로젝트 만들기
   - New Flutter Project
      - Flutter SDK path: 플러터 설치 경로 지정
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

 - Android SDK Command-line Tools 설치
    - Android Studio IDE를 설치하였다면, 해당 툴을 쉽게 설치할 수 있다.
    - $ flutter doctor
    - $ flutter doctor --android-licenses
```
 - Androide Studio 실행
    - Settings
        - Android SDK
            - SDK Tools
                - Android SDK Command-line Tools 설치
```

<br/>

### Xcode 설치

Xcode(엑스코드)는 애플(Apple)의 개발 환경 및 통합 개발 환경(IDE)입니다. 주로 macOS와 iOS 운영 체제용 애플리케이션 및 소프트웨어 개발을 위해 사용됩니다. Xcode는 macOS 운영 체제에서 실행되며, macOS, iOS, watchOS 및 tvOS 애플리케이션을 개발하기 위한 다양한 도구와 리소스를 제공합니다.  

쉽게, iOS, Mac OS 앱 등 애플 디바이스에 어플리케이션을 만들기 위한 통합 개발 환경입니다.  

 - App Sotre
    - 개발
        - Xcode 설치
 - Xcode를 설치 후에 CocoaPods 관련 에러 문구가 나올 수가 있다. 
    - CocoaPods는 Ruby 기반으로 동작하므로 Ruby를 설치하고 rbenv를 사용하여 관리하는 것이 좋다.
 - 과정
    - Xcode 설치 후 build
    - Homebrew 설치
    - Homebrew로 Ruby 버전 관리 도구인 rbenv 설치
    - rbenv로 Ruby와 CocoaPods 설치
```Bash
$ sudo xcodebuild -license
agree

# Homebrew 설치
$ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# Homebrew 환경 변수 등록
$ echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> /Users/[your-user-name]/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
$ brew

# rbenv 설치: Ruby 버전 관리 도구
$ brew install rbenv
$ which gem
$ rbenv versions

# Ruby 버전 확인 및 설치
$ rbenv install -l
$ rbenv install <Version>
$ rbenv global <Version>

# rbenv 초기화 및 쉘 환경 연동
$ rbenv init
$ vi ~/.zshrc
eval "$(rbenv init - zsh)"

# cocoapods 설치
$ sudo gem install cocoapods

# Flutter 확인
$ flutter doctor
```

<br/>

### FVM을 활용하여 Flutter 설치하기

 - 홈페이지: https://fvm.app/
   - fvm releases: Flutter 릴리즈 버전 확인
   - fvm install <Version>: Fluuter 해당 버전 설치
   - fvm global <Version>: 전역적으로 사용할 Flutter 버전 설정
```Bash
# FVM 설치
brew tap leoafarias/fvm
brew install fvm

# FVM 설치 확인
$ fvm --version
$ fvm list

# FVM으로 Flutter 설치
$ fvm releases
$ fvm install 3.10.6
$ fvm global 3.10.6
```

 - IDE에 해당 버전 적용하기
    - Settings > Languages & Frameworks > Flutter
        - Flutter SDK path: FVM 버전 경로로 설정

<br/>

### Java 설치하기

```Bash
# OpenJDK 설치
$ brew install openjdk@11
$ java --version

# Java 버전 변경: 여러 JDK가 설치된 경우
$ vi ~/.zshrc
..
export JAVA_HOME=$(/usr/libexec/java_home -v11)
```
