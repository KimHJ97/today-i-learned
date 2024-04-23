# 쿠폰 발급 관련 도메인 설계

## 쿠폰 발급 흐름 정리 및 엔티티 설계

 - 네고왕 선착순 쿠폰 이벤트 요구 사항
```
1. 이벤트 기간내에 발급
2. 선착순 이벤트는 유저당 1번의 쿠폰 발급만 가능
3. 선착순 쿠폰의 최대 쿠폰 발급 수량 설정
```
<br/>

 - 쿠폰 발급 기능
```
1. 쿠폰 발급 기능
1-1. 쿠폰 발급 기간 검증
1-2. 쿠폰 발급 수량 검증(쿠폰 전체 발급 수량, 중복 발급 요청 검증)
1-3. 쿠폰 발급 처리(DB 저장)
    - 쿠폰 발급 수량 증가
    - 쿠폰 발급 기록 저장(쿠폰 ID, 유저 ID)
```
<br/>

## 테이블 설계

```
coupons (쿠폰 정책)
 - id(일련 번호) BIGINT
 - title(쿠폰명) VARCHAR(255) 
 - coupon_type(쿠폰 타입) VARCHAR(255)
 - total_quantity(쿠폰 발급 최대 수량) INT
 - issued_quantity(발급된 쿠폰 수량) INT
 - discount_amount(할인 금액) INT
 - min_available_amount(최소 사용 금액) INT
 - date_issue_start(발급 시작 일시) DATETIME(6)
 - date_issue_end(발급 종료 일시) DATETIME(6)
 - date_created(생성 일시) DATETIME(6)
 - date_updated(수정 일시) DATETIME(6)

coupon_issues(쿠폰 발급 내역)
 - coupon_id(쿠폰 ID) BIGINT
 - user_id(유저 ID) BIGINT
 - date_issued(발급 일시) DATETIME(6)
 - date_used(사용 일시) DATETIME(6)
 - date_created(생성 일시) DATETIME(6)
 - date_updated(수정 일시) DATETIME(6)
```
<br/>

```sql
CREATE TABLE `coupon`.`coupons`
(
    `id`                   BIGINT(20) NOT NULL AUTO_INCREMENT,
    `title`                VARCHAR(255) NOT NULL COMMENT '쿠폰명',
    `coupon_type`          VARCHAR(255) NOT NULL COMMENT '쿠폰 타입 (선착순 쿠폰, ..)',
    `total_quantity`       INT NULL COMMENT '쿠폰 발급 최대 수량',
    `issued_quantity`      INT          NOT NULL COMMENT '발급된 쿠폰 수량',
    `discount_amount`      INT          NOT NULL COMMENT '할인 금액',
    `min_available_amount` INT          NOT NULL COMMENT '최소 사용 금액',
    `date_issue_start`     datetime(6) NOT NULL COMMENT '발급 시작 일시',
    `date_issue_end`       datetime(6) NOT NULL COMMENT '발급 종료 일시',
    `date_created`         datetime(6) NOT NULL COMMENT '생성 일시',
    `date_updated`         datetime(6) NOT NULL COMMENT '수정 일시',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
    COMMENT '쿠폰 정책';

CREATE TABLE `coupon`.`coupon_issues`
(
    `id`           BIGINT(20) NOT NULL AUTO_INCREMENT,
    `coupon_id`    BIGINT(20) NOT NULL COMMENT '쿠폰 ID',
    `user_id`      BIGINT(20) NOT NULL COMMENT '유저 ID',
    `date_issued`  datetime(6) NOT NULL COMMENT '발급 일시',
    `date_used`    datetime(6) NULL COMMENT '사용 일시',
    `date_created` datetime(6) NOT NULL COMMENT '생성 일시',
    `date_updated` datetime(6) NOT NULL COMMENT '수정 일시',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
    COMMENT '쿠폰 발급 내역';
```
<br/>

## 엔티티 설계

 - `CouponCoreConfiguration`
    - 공통 모듈에 @EnableJpaAuditing 어노테이션 활성화
```java
@EnableJpaAuditing
@ComponentScan
@EnableAutoConfiguration
public class CouponCoreConfiguration {
    // ..
}
```
<br/>

 - `엔티티`
    - BaseTimeEntity: dateCreated와 dateUpdated는 데이터 생성과 수정시에 자동으로 등록된다.
    - Coupon, CouponIssue 엔티티
```java
// 쿠폰 타입
public enum CouponType {
    FIRST_COME_FIRST_SERVED // 선착순 쿠폰
}

// BaseTimeEntity
@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseTimeEntity {

    @CreatedDate
    private LocalDateTime dateCreated;

    @LastModifiedDate
    private LocalDateTime dateUpdated;

}

// Coupon 엔티티
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Entity
@Table(name = "coupons")
public class Coupon extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    @Enumerated(value = EnumType.STRING)
    private CouponType couponType;

    private Integer totalQuantity;

    @Column(nullable = false)
    private int issuedQuantity;

    @Column(nullable = false)
    private int discountAmount;

    @Column(nullable = false)
    private int minAvailableAmount;

    @Column(nullable = false)
    private LocalDateTime dateIssueStart;

    @Column(nullable = false)
    private LocalDateTime dateIssueEnd;
}

// CouponIssue 엔티티
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Entity
@Table(name = "coupon_issues")
public class CouponIssue extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long couponId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    @CreatedDate
    private LocalDateTime dateIssued;

    private LocalDateTime dateUsed;
}
```