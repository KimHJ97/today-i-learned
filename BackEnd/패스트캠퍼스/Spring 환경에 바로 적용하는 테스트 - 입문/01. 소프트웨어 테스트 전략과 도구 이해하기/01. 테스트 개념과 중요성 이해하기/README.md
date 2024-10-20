# 테스트 개념과 중요성 이해하기

## 테스트 정의 및 필요성

테스트 코드란 소프트웨어 기능과 동작을 테스트하는데 사용되는 코드를 말한다. 개발자가 요구사항에 맞게 개발한 기능이 의도대로 정확히 동작하는지 검증하는 절차를 코드화 해놓은 것이 테스트 코드이다.  

### 테스트 코드를 작성해야 하는 이유

 - 기능 개발 관점
    - 신규 기능 개발 과정 중 예상하지 못했던 문제를 미리 발견할 수 있다.
    - 작성한 코드가 의도한 대로 동작하는지 검증할 수 있다.
 - 리팩토링 관점
    - 단순 구조적 변경(중복 제거, 캡슐화)을 적용 했을 때, 이전과 동일하게 기능이 정상 동작 여부를 확인할 수 있다. 
    - 코드 수정이 필요한 상황에서 유연하고 안정적인 대응을 할 수 있다. 

### 테스트 종류

TEST의 종류는 테스트 대상 범위나 성격에 따라 크게 3가지로 구분 된다. UI, Service(Intergration), Unit Test 등으로 구분한다. 
아래 피라미드 구조를 보면 밑으로 내려 갈 수록 테스트의 속도와 비용은 줄어들고 테스트의 크기(또는 범위)는 점점 커지는 것을 볼 수 있다.  

 - 단위 테스트(Unit Test)
    - 가장 작은 단위로 기능을 나누어 기능을 테스트하는 기법
    - 하나의 모듈을 기준으로 독립적으로 진행되는 가장 작은 단위의 테스트
    - 장점
        - 단위 테스트는 회귀성을 보장하기 때문에 코드 수정에 따른 불안감을 해소 할 수 있다. 
        - 언제든지 빠르고 쉽게 테스트 할 수 있기 때문에 신규 기능 또는 리팩토링에 대한 불안감을 낮출 수 있다. 
        - 코드 자체가 API의 기능을 설명하는 문서의 기능을 제공할 수 있다.
 - 통합 테스트(Intergration Test)
    - 통합 테스트는 모듈을 통합하여 독립적으로 하나의 기능을 수행할 수 있는 단위를 만드는 과정에서 서로 다른 모듈 혹은 객체 간 상호작용의 유효성을 검증하는 테스트를 말한다.
 - 인수 테스트(UI Test)
    - 대형 테스트로 분류되는 UI 테스트는 실제 사용자들이 사용하는 화면에 대한 테스트를 하여 서비스의 기능이 정상적으로 작동하는지 검증하는 테스트를 말한다.

## 테스트 개발 방법론과 TDD 개발 장점

테스트 주도 개발TDD(Test-Driven-Development)란 전통적인 개발 방식과 다르게 실패하는 테스트 코드로 시작해서 리팩토링으로 종료되는 일련의 스프린트 방식을 여러 번 거쳐서 요구사항 충족하는 코드를 점진적으로 완성 시켜가는 개발 방법론을 말한다.  

 - 1. 디버깅 시간을 단축 할 수 있다.
        - 모듈 별로 테스트를 자동화 할 수 있는 코드가 없다면 오류가 발생하는 기능의 오류를 찾기 위해서 모든 레벨의 코드를 확인 해야 한다. 하지만, TDD의 경우, 모든 모듈의 유닛 테스트 코드가 있기 때문에 손 쉽게 오류를 찾을 수 있다. 
 - 2. 작성한 코드가 가지는 불안정성을 개선하여 생산성을 높일 수 있다.
        - TDD를 사용하면, 코드가 내 손을 떠나 사용자에게 도달하기 전에 문제가 없는지 먼저 진단 받을 수 있다. 그렇기 때문에 코드가 지닌 불안정성과 불확실성을 지속적으로 해소 해준다. 
 - 3. 재설계 시간을 단축 할 수 있다.
    - 개발자는 요구사항을 제대로 이해하지 않고는 구현을 시작할 수 없다. 테스트 시나리오를 작성하려면 먼저 기능에 대한 포괄적인 이해가 필요하기 때문에 개발자가 지금 무엇을 해야하는지 분명히 이해하고 개발을 시작하게 된다. 또한 테스트 시나리오를 작성하면서 다양한 예외상황에 대해서도 생각해 볼 수 있기 때문에 이는 완성도 높은 설계로 이어질 수 있다. 그렇게 되면 Clean 스러운 코드가 탄생할 수 있다. 
 - 4. 추가 구현이 용이하다.
    - 비즈니스의 변화(Change)는 항상 존재한다. 새롭게 추가되는 요구사항을 적용하기 위해서 기존 코드의 변경이 발생하고 이로 인해 이전에 진행했던 모든 테스트 케이스와 새롭게 추가된 테스트 케이스 모두를 확인해야하는데, TDD의 경우 자동화된 유닛 테스팅을 전제하므로 테스트 기간을 획기적으로 단축 시킬 수 있다.
 - 5. 각 테스트가 요구사항을 직접 식별하므로 코드와 요구사항이 긴밀하게 연결된다.
    - 복잡한 기능 정의서와 같은 문서를 볼 필요 없이 테스트 코드와 함께 있는 Test Case를 통해서 Method에 대한 기능 정의를 이해 할 수 있다

