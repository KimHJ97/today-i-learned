# 스프링 데이터 JPA 분석

## SimpleJpaRepository

 - @Repository 적용: JPA 예외를 스프링이 추상화한 예외로 변환
 - @Transactional 트랜잭션 적용
    - JPA의 모든 변경은 트랜잭션 안에서 동작
    - 스프링 데이터 JPA는 변경(등록, 수정, 삭제) 메서드를 트랜잭션 처리
    - 서비스 계층에서 트랜잭션을 시작하지 않으면 리파지토리에서 트랜잭션 시작
    - 서비스 계층에서 트랜잭션을 시작하면 리파지토리는 해당 트랜잭션을 전파 받아서 사용
    - 그래서 스프링 데이터 JPA를 사용할 때 트랜잭션이 없어도 데이터 등록, 변경이 가능했음(사실은 트랜잭션이 리포지토리 계층에 걸려있는 것임)
```java
@Repository
@Transactional(readOnly = true)
public class SimpleJpaRepository<T, ID> implements JpaRepositoryImplementation<T, ID> {
    @Transactional
    public <S extends T> S save(S entity) {
        if (entityInformation.isNew(entity)) {
            em.persist(entity);
            return entity;
        } else {
            return em.merge(entity);
        }
    }
    ...
}
```
<br/>

## 새로운 엔티티를 구별하는 방법

 - __새로운 엔티티를 판단하는 기본 전략__
    - 식별자가 객체일 때 null 로 판단
    - 식별자가 자바 기본 타입일 때 0 으로 판단
    - Persistable 인터페이스를 구현해서 판단 로직 변경 가능
```java
package org.springframework.data.domain;

public interface Persistable<ID> {
    ID getId();
    boolean isNew();
}
```
<br/>

