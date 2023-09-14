# Dart 활용하여 가위바위보 만들기

 - 요구 사항
    - 유저에게 어떤 타입을 낼 것인지 물어보는 질의 창
    - 컴퓨터가 낼 타입이 어떤 것인지 결정하는 함수
    - 유저의 타입과 컴퓨터 타입에 대한 결과를 계산하는 함수

<br/>

## 프로젝트 만들기

 - File > 
 - Dart SDK 경로는 'fvm/versions/버전/bin/cache/dart-sdk' 가 존재한다.
 - Project name: dart-rps-game

```Dart
import 'dart:convert';
import 'dart:io';
import 'dart:math';

void main() {
  // 유저에게 어떤 타입을 낼 것인지 물어보는 질의 창
  print('가위, 바위, 보 중 하나를 정해서 입력해 주세요.');
  final String userInput = stdin.readLineSync(encoding: utf8) ?? 'Error';

  // 컴퓨터가 낼 타입이 어떤것인지 결정하는 함수
  const selectList = ['가위', '바위', '보'];
  final cpuInput = selectList[Random().nextInt(3)];

  // 유저의 타입과 컴퓨터 타입에 대한 결과를 계산할 함수
  final result = getResult(userInput, cpuInput);
  print('사용자 입력: $userInput');
  print('컴퓨터 입력: $cpuInput');
  print(result);
}

String getResult(String userInput, String cpuInput) {
  const winMessage = '승리';
  const loseMessage = '패배';
  const drawMessage = '무승부';

  String result = drawMessage;

  switch (userInput) {
    case '가위':
      if (cpuInput == '보') {
        result = winMessage;
      }
      if (cpuInput == '바위') {
        result = loseMessage;
      }
    case '바위':
      if (cpuInput == '가위') {
        result = winMessage;
      }
      if (cpuInput == '보') {
        result = loseMessage;
      }
    case '보':
      if (cpuInput == '바위') {
        result = winMessage;
      }
      if (cpuInput == '가위') {
        result = loseMessage;
      }
    default:
      result = '올바른 값을 입력 해 주세요. (가위, 바위, 보)';
  }

  return result;
}

```
