# 리액티브 프로그래밍 구성 요소와 친해지기

## 리액티브 스트림즈(Reactive Streams)란?

Reactive Streams는 비동기적인 데이터 스트림 처리를 위한 표준을 정의하는 데 사용되는 프로토콜입니다. 이는 리액티브 프로그래밍의 기본 아이디어를 실제 코드로 구현하기 위한 표준화된 방법을 제공합니다.  

Reactive Streams는 Java 플랫폼을 위한 Reactive Streams API가 있으며, 다양한 언어와 플랫폼을 지원하기 위한 다양한 구현체도 있습니다. 이러한 구현체는 RxJava, Project Reactor, Akka Streams 등이 있습니다. Reactive Streams 프로토콜은 비동기 데이터 처리를 위한 표준화된 인터페이스를 제공하여 리액티브 시스템을 더 효과적으로 개발하고 구축할 수 있도록 도와줍니다.  

 - 공식 문서: https://github.com/reactive-streams/reactive-streams-jvm/
 - 리액티브 프로그래밍에 대한 인터페이스만 제공한다.
 - RxJava는 Reactive Streams의 인터페이스들을 구현한 구현체이다.
 - Reactive Streams는 Publisher, Subscriber, Subscription, Processor라는 4개의 인터페이스를 제공한다.
    - Publisher: 데이터를 생성하고 통지한다.
    - Subscriber: 통지된 데이터를 전달받아서 처리한다.
    - Subscription: 전달받을 데이터의 개수를 요청하고 구독을 해지한다.
    - Processor: Publisher와 Subscriber의 기능이 모두 있다.

<br/>

### Publisher와 Subscriber 간의 프로세스 흐름

```
1. 소비자가 데이터를 구독한다.(subscribe)
2. 생산자가 데이터를 통지할 준비가 되었음을 알린다.(onSubscribe)
3. 소비자가 전달받을 통지 데이터 갯수를 요청한다.(Subscription.request)
4. 생산자가 데이터를 생성하고, 요청받은 개수만큼 데이터를 통지한다.(onNext)
  - .. 데이터 생성
5. 소비자가 전달받을 통지 데이터 갯수를 요청한다.(Subscription.request)
6. 생산자가 요청받은 갯수만큼 데이터를 통지한다.(onNext)
..
7. 생산자가 데이터 통지가 완료되었음을 알린다.(onComplete)

```

<br/>

### Cold Publisher & Hot Publisher

 - __Cold Publisher(차가운 생산자)__
    - 생산자는 소비자가 구독할 때마다 데이터를 처음부터 새로 통지한다.
    - 데이터를 통지하는 새로운 타임 라인이 생성된다.
    - 소비자는 구독 시점과 상관없이 통지된 데이터를 처음부터 전달받을 수 있다.

```java
public class ColdPublisherExample {
    public static void main(String[] args){
        Flowable<Integer> flowable = Flowable.just(1, 3, 5, 7);

        // 1, 3, 5, 7
        flowable.subscribe(data -> System.out.println("구독자1: " + data));
        // 1, 3, 5, 7
        flowable.subscribe(data -> System.out.println("구독자2: " + data));
    }
}
```

<br/>

 - __Hot Publisher(뜨거운 생산자)__
    - 생산자는 소비자 수와 상관없이 한 번만 통지한다.
    - 즉, 데이터를 통지하는 타임 라인은 하나이다.
    - 소비자는 발행된 데이터를 처음부터 전달받는게 아니라 구독한 시점에 통지된 데이터들만 전달 받을 수 있다.

```java
public class HotPublisherExample {
    public static void main(String[] args){
        PublishProcessor<Integer> processor = PublishProcessor.create();
        // 구독자1: 1, 3, 5, 7
        processor.subscribe(data -> System.out.println("구독자1: " + data));
        processor.onNext(1);
        processor.onNext(3);

        // 구독자2: 5, 7
        processor.subscribe(data -> System.out.println("구독자2: " + data));
        processor.onNext(5);
        processor.onNext(7);

        processor.onComplete();
    }
}
```

