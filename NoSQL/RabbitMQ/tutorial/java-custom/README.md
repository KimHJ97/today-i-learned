# RabbitMQ Java Tutorial

## 환경 변수 등록

```bash
# Linux, Mac
set CP="amqp-client-5.21.0.jar:slf4j-api-2.0.13.jar:slf4j-simple-2.0.13.jar"

# Widnows
set CP="amqp-client-5.21.0.jar;slf4j-api-2.0.13.jar;slf4j-simple-2.0.13.jar"

# Windows 환경 변수 등록전, 후 실행 예시
java -cp "01. hello-world/;amqp-client-5.21.0.jar;slf4j-api-2.0.13.jar;slf4j-simple-2.0.13.jar" Send
java -cp "01. hello-world/";%CP% Send
```
<br/>

## 튜토리얼 1. Hello-World

```bash
javac -cp amqp-client-5.21.0.jar ./"01. hello-world"/*

java -cp "01. hello-world/";%CP% Recv
java -cp "01. hello-world/";%CP% Send
```
<br/>

## 튜토리얼 2. Work Queues

```bash
javac -cp %CP% ./"02. work-queues"/*

java -cp "02. work-queues/";%CP% Worker # Shell 1
java -cp "02. work-queues/";%CP% Worker # Shell 2
java -cp "02. work-queues/";%CP% NewTask message.
java -cp "02. work-queues/";%CP% NewTask message..............
java -cp "02. work-queues/";%CP% NewTask message.
java -cp "02. work-queues/";%CP% NewTask message..............
```
<br/>

## 튜토리얼 3. Publish&Subscribe(게시/구독)

```bash
javac -cp %CP% ./"03. publish-subscribe"/*

java -cp "03. publish-subscribe/";%CP% ReceiveLogs # Shell 1
java -cp "03. publish-subscribe/";%CP% ReceiveLogs # Shell 2
java -cp "03. publish-subscribe/";%CP% EmitLog
```
<br/>

## 튜토리얼 4. Routing(라우팅)

```bash
javac -cp %CP% ./"04. routing"/*

java -cp "04. routing/";%CP% ReceiveLogsDirect info warning error # Shell 1
java -cp "04. routing/";%CP% ReceiveLogsDirect error # Shell 2
java -cp "04. routing/";%CP% EmitLogDirect error "error 로그"
java -cp "04. routing/";%CP% EmitLogDirect error "error 로그"
java -cp "04. routing/";%CP% EmitLogDirect info "info 로그"
```
<br/>

## 튜토리얼 5. Topic(토픽)

```bash
javac -cp %CP% ./"05. topics"/*

# 모든 로그 바인딩
java -cp "05. topics/";%CP% ReceiveLogsTopic "#"

# kern으로 시작하는 로그 바인딩
java -cp "05. topics/";%CP% ReceiveLogsTopic "kern.*"

# critical로 끝나는 로그 바인딩
java -cp "05. topics/";%CP% ReceiveLogsTopic "*.critical"

# Multiple 바인딩
java -cp "05. topics/";%CP% ReceiveLogsTopic "kern.*" "*.critical"

# 메시지 전송
java -cp "05. topics/";%CP%  EmitLogTopic "kern.critical" "A critical kernel error"
```

