# MAC 환경 구축

 - https://velog.io/@oen/flutter-doctor-%EC%97%90%EB%9F%AC
 - https://velog.io/@gjwjdghk123/Flutter-MacOS-%EC%84%A4%EC%B9%98

## 1. Rosetta 설치

Rosetta 2를 사용하면 Intel 프로세서가 장착된 Mac용으로 제작된 앱을 Apple Silicon이 장착된 Mac에서 사용할 수 있습니다.  

Rosetta는 사용자가 열거나 상호 작용하는 앱이 아닙니다. Rosetta는 Intel 프로세서가 탑재된 Mac 컴퓨터 전용으로 빌드된 앱을 사용할 때마다 백그라운드에서 자동으로 작동하며, Apple Silicon에서 사용할 수 있도록 앱을 변환합니다. 앱을 열고 평소처럼 사용하기만 하면 됩니다.  

 - 공식 문서: https://support.apple.com/ko-kr/102527

```sh
# Apple Silicon(m1, m2, m3)
sudo softwareupdate --install-rosetta --agree-to-license
```
<br/>

## 2. Flutter SDk 설치

Flutter를 설치하려면 Flutter SDK 번들을 다운로드하고, 번들을 저장하려는 위치로 옮긴 다음 SDK를 추출합니다.  

Mac의 경우 다운로드를 받으면, 기본적으로 다운로드 폴더에 다운로드가 진행됩니다. 사용자 폴더 밑에 적당한 폴더(app)를 만들고, 다운로드 받은 zip 파일을 해당 경로로 이동시킵니다. 이후 더블클릭하여 압축을 해제할 수 있습니다.  

압축을 해제하고 전역적으로 플러터 명령어를 사용하기 위해서는 해당 경로를 환경 변수로 등록해주어야 합니다.  

```sh
# 사용자 디렉토리 하위에 app 폴더 생성
cd $HOME
mkdir app
unzip ~/Downloads/flutter_macos_arm64_3.xx.x-stable.zip

# 플러터 실행 파일 경로를 환경 변수로 등록
export PATH=$HOME/app/flutter/bin:$PATH
echo $PATH

# 플러터 버전 확인
flutter --version
```
<br/>

### 2-1. Flutter 정상 설치 확인

Flutter가 정상적으로 설치되었는지 확인하기 위해서는 flutter doctor 명령어를 이용할 수 있습니다.  

기본적으로 초기 설치시에는 Android toolchain, Xcode 미설치 에러와 Android Studio 미설치 경고가 발생하게 됩니다.  
 - [✗] Android toolchain - develop for Android devices
 - [✗] Xcode - develop for iOS and macOS
 - [!] Android Studio (not installed)
```sh
flutter doctor

[✗] Android toolchain - develop for Android devices
    ✗ Unable to locate Android SDK.
    ..
[✗] Xcode - develop for iOS and macOS
    ✗ Xcode installation is incomplete;
    ..
[✓] Chrome - develop for the web
[!] Android Studio (not installed)
[✓] VS Code (version 1.87.1)
[✓] Connected device (2 available)
[✓] Network resources
```
<br/>

## 3. Android Studio 설치

Flutter를 원활하게 개발하기 위한 통합 개발 환경(IDE)를 설치합니다.  

공식 홈페이지에 접속하여 Android Stuiod의 *.dmg 파일을 다운로드 받고, 해당 파일을 실행하여 Applications에 설치합니다. Applications에 설치한 파일은 Launch Pad에서 확인할 수 있습니다.  

이후, 처음으로 Android Studio를 실행하면 기본 설정 옵션과 정책 관련한 사항을 체크하고 기본적으로 설치되는 프로그램 설명이 나오게 됩니다.  
 - Android Emulator: 플러터로 앱 개발시 실제 디바이스가 아니라, 가상의 디바이스를 사용할 떄 사용됩니다.
 - Android SDK: 안드로이드 관련 소프트웨어 개발 키트입니다.
 - Google APIs: 가상 OS 등 관련 이미지입니다.

<br/>

### 3-1. Android Studio Plugins

Android Studio 설치가 완료된 뒤에는 추가적인 플러그인을 설치합니다.  
플러그인 설치가 완료되면, Restart IDE를 통해 재실행하여 플러그인을 적용합니다.  
 - Flutter

<br/>

### 3-2. Flutter 프로젝트 만들기

Flutter 플러그인이 적용되면, Android Studio IDE에서 플러터 프로젝트를 만들 수 있습니다.  
```
New Project -> Flutter

1. Flutter 설치 경로 등록
 - Flutter SDK path: 설치한 플러터 경로를 입력합니다. (/Users/사용자/app/flutter)

2. 프로젝트 기본 설정
 - Project name: test_flutter_project
 - Project location: ~/StudioProjects/test_flutter_project
 - Description: A new Flutter project.
 - Project type: Application
 - Organization: com.test (보통 도메인의 역순으로 입력한다.)
 - Android language: Kotlin
 - iOS language: Swift
 - Platforms: Android, iOS
```
<br/>

### 3-3. Android Studio 설치 확인

Android Studio를 설치하고, flutter doctor 명령어를 확인하면 cmdline-tools와 Android license 관련 에러를 확인할 수 있습니다.  

```sh
flutter doctor

[!] Android toolchain - develop for Android devices (Android SDK version 34.0.0)
    ✗ cmdline-tools component is missing
      Run `path/to/sdkmanager --install "cmdline-tools;latest"`
      See https://developer.android.com/studio/command-line for more details.
    ✗ Android license status unknown.
      Run `flutter doctor --android-licenses` to accept the SDK licenses.
      See https://flutter.dev/docs/get-started/install/macos#android-setup for
      more details.
```
<br/>

 - __cmdline-tools component is missing__

해당 에러는 Android SDK Command-line Tools를 설치하지 않아서 발생하는 에러입니다.  
Android Studio IDE 에서 쉽게 해당 툴을 설치할 수 있습니다.

```
1. Android Studio IDE 실행
2. 상단 메뉴 -> Android Studio -> Settings..
3. Android SDK 검색 -> SDK Tools
4. Android SDK Command-line Tools 체크 후 OK
```
<br/>

 - __Android license status unknown.__
```sh
flutter doctor --android-licenses
```

## 4. XCode 설치

XCode는 iOS, Mac OS 등 애플 제품군의 애플리케이션을 만들기 위한 대표적인 IDE 입니다.  
Apple에서 개발되는 디바이스에 사용되는 애플리케이션을 만들기 위해서는 XCode를 설치해야 합니다.  

플러터를 통해서 iOS 앱을 만들 때, iOS에 제출하기 위한 옵션과 설정 파일을 조작해야 합니다. Android Studio로도 가능하지만, XCode를 이용하는 것이 더 다루기 편하다는 장점이 있습니다.  

```
App Store -> 개발 - > XCode 설치
```
<br/>

### 4-1. Flutter 설치 확인

XCode를 설치한 후 flutter doctor 명령어를 통해 Flutter 설치를 확인합니다.  

```sh
flutter doctor

[✗] Xcode - develop for iOS and macOS
    ✗ Xcode installation is incomplete; a full installation is necessary for iOS and macOS development.
      Download at: https://developer.apple.com/xcode/
      Or install Xcode via the App Store.
      Once installed, run:
        sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
        sudo xcodebuild -runFirstLaunch
    ✗ CocoaPods not installed.
        CocoaPods is used to retrieve the iOS and macOS platform side's plugin code that responds to your plugin usage on the
        Dart side.
        Without CocoaPods, plugins will not work on iOS or macOS.
        For more info, see https://flutter.dev/platform-plugins
      To install see https://guides.cocoapods.org/using/getting-started.html#installation for instructions.
```
<br/>

 - __Xcode installation is incomplete; a full installation is necessary for iOS development.__

XCode를 앱스토어에서 이미 설치했지만, 미설치 에러가 나오는 경우 아래 명령어를 입력합니다.  

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch

# flutter doctor 확인
flutter doctor

[!] Xcode - develop for iOS and macOS (Xcode 15.3)
    ✗ Unable to get list of installed Simulator runtimes.
    ✗ CocoaPods not installed.
        CocoaPods is used to retrieve the iOS and macOS platform side's plugin code that responds to your plugin usage on the
        Dart side.
        Without CocoaPods, plugins will not work on iOS or macOS.
        For more info, see https://flutter.dev/platform-plugins
      To install see https://guides.cocoapods.org/using/getting-started.html#installation for instructions.
```
<br/>

 - __CocoaPods not installed.__

CocoaPods는 XCode에서 사용하는 외부 라이브러리 주입 도구입니다.  
CocoaPods을 brew를 통해 설치할 수도 있지만, Virtual Ruby를 통해 설치할 수도 있습니다.

```sh
# Virtual Ruby
brew install rbenv
rbenv init
# Load rbenv automatically by appending the following to ~/.zshrc:
    # zshrc에 아래 명령어를 추가한다.
    # eval "$(rbenv init - zsh)"
    # source ~/.zrhrc

# gem 위치 확인: /usr/bin/gem -> /Users/유저/.rbenv/shims/gem
which gem

# ruby 설치
rbenv install -l
rbenv install 3.3.0
rbenv global 3.3.0

# Virtual Ruby의 gem을 이용하여 CocoaPods을 설치
sudo gem install cocoapods

# CocoaPods 설치 확인
pod --version
```

 - __Unable to get list of installed Simulator runtimes.__

만약, XCode를 처음 설치하고 실행했을 떄 iOS 관련 런타임 시뮬레이터를 설치하지 않은 경우 아래와 같은 경고가 발생합니다.  
 - https://stackoverflow.com/questions/77160074/unable-to-get-list-of-installed-simulator-runtimes

```sh
flutter doctor

[!] Xcode - develop for iOS and macOS (Xcode 15.3)
    ✗ Unable to get list of installed Simulator runtimes.


# iOS Simulator runtimes 설치
xcodebuild -downloadPlatform iOS
```
<br/>

## 5. FVM 설치

FVM은 플러터 버전을 쉽게 관리할 수 있는 써드파티 도구입니다.  
 - https://fvm.app/
```sh
# brew에 fvm 저장소 등록
brew tap leoafarias/fvm

# fvm 설치
brew install fvm
```
<br/>

### 5-1. FVM 사용 및 적용

```sh
# 플러터 설치 버전 목록 확인
fvm list

# 플러터 릴리즈 버전 목록 확인
fvm releases

# 플러터 설치
fvm install 버전

# 특정 버전을 글로벌로 사용하기
fvm global 버전

# Android Studio 프로젝트에 FVM 플러터 버전 적용하기
    # 아래 명령어를 수행한 후
    # IDE -> Settings.. -> Languages&Frameworks -> Flutter
    # cmd + shift + . 을 눌러야 숨김 폴더롤 볼 수 있다.
    # path 설정: 프로젝트 경로/.fvm/flutter_sdk
cd ~/StudioProjects/프로젝트명
fvm use 버전
```


