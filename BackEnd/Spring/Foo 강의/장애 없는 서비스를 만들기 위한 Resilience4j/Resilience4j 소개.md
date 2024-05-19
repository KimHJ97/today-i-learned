# Resilience4j 소개

 - Github: https://github.com/resilience4j/resilience4j
 - Docs(Eng): https://resilience4j.readme.io/docs
 - Docs(한글): https://godekdls.github.io/Resilience4j/contents/

## Resilience4j

Resilience4j는 자바 어플리케이션을 위한 장애 내성(Resilience) 라이브러리입니다. 이 라이브러리는 분산 시스템에서 발생할 수 있는 장애에 대응하기 위한 여러 가지 도구와 기능을 제공합니다.

 - Circuit Breaker(서킷 브레이커): 서킷 브레이커는 외부 서비스와의 통신에서 장애가 발생할 때 해당 서비스 호출을 끊고, 재시도하는 대신 빠르게 실패를 반환하여 시스템의 다른 부분에 영향을 미치지 않도록 합니다. 이는 전체 시스템의 과부하를 방지하고 복구 시간을 단축하는 데 도움이 됩니다.
 - Rate Limiter(요청 제한기): Rate Limiter는 특정 서비스 또는 리소스에 대한 요청을 제한하는 기능을 제공합니다. 이는 네트워크 리소스를 효율적으로 관리하고, 과도한 요청으로 인한 서비스 과부하를 방지하는 데 도움이 됩니다.
 - Retry(재시도): Retry는 외부 서비스 호출이 실패할 때 지정된 횟수나 시간 간격 내에 호출을 재시도하는 기능을 제공합니다. 이는 일시적인 네트워크 문제나 서비스 장애로 인해 발생할 수 있는 임시적인 오류를 처리하는 데 유용합니다.
 - Bulkhead(벌크헤드): Bulkhead 패턴은 시스템의 다양한 부분 간의 격리를 통해 전체 시스템의 안정성을 높이는 데 사용됩니다. Resilience4j는 스레드 풀을 사용하여 서비스 호출을 격리하고, 고장이 발생한 부분에 대해 다른 부분의 영향을 최소화합니다.
 - TimeLimiter(시간 제한기): TimeLimiter는 외부 호출에 대한 응답 시간을 제한하는 기능을 제공합니다. 이는 장기간의 응답 대기로 인한 시스템 지연을 방지하고, 네트워크 리소스를 효율적으로 활용하는 데 도움이 됩니다.

