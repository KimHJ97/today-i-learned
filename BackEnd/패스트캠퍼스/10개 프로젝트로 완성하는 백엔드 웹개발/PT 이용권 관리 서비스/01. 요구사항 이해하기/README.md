# 요구사항 이해하기

## 배치(Batch)

데이터를 실시간으로 처리하는 게 아닌 일괄적으로 모아서 처리하는 작업을 말한다.  
 - 예약 시간에 광고성 메시지 발송
 - 결제 정산 작업
 - 운영을 위한 필요한 통계 데이터 구축
 - 대량 데이터를 필요로 하는 모델 학습 작업

<br/>

## 이용권 서비스 요구사항 이해하기

 - __이용권__
    - 사용자는 N개의 이용권을 가질 수 있다.
    - 이용권은 횟수가 모두 소진되거나 이용기간이 지나면 만료된다.
    - 이용권 만료 전 사용자에게 알림을 준다.
    - 업체에서 원하는 시간을 설정하여 일괄로 사용자에게 이용권을 지급할 수 있다.
 - __수업__
    - 예약된 수업 10분 전 출석 안내 알람을 준다.
    - 수업 종료 시간 시점 수업을 예약한 학생의 이용권 횟수를 일괄로 차감한다.
 - __통계__
    - 사용자의 수업 예약, 출석, 이용권 횟수 등의 데이터로 유의미한 통계 데이터를 만든다.

<br/>

### Features

 - __Batch__
    - 이용권 만료
    - 이용권 일괄 지급
    - 수업 전 알림
    - 수업 후 이용권 차감
    - 통계 데이터 구축
 - __View__
    - 사용자 이용권 조회 페이지
    - 관리자 이용권 등록 페이지
    - 관리자 통계 조회 페이지
 - __API__
    - 사용자 이용권 조회 API
    - 관리자 이용권 등록 API
    - 관리자 통계 조회 API

<br/>

## Batch 구조 설계

 - __이용권 만료 JOB__
   - ExpirePassesReader
   - ExpirePassesWriter
 - __이용권 일괄 지급 JOB__
   - AddPassesTasklet
 - __수업 전 알림 JOB__
   - 다중 쓰레드 Chunk 이용
   - AlarmReader
   - AlarmWriter
 - __이용권 차감 JOB__
   - UsePassesReader
   - AsyncItemProcessor
   - AsyncItemWriter
 - __시간당 통계 데이터__
   - StatisticsReader, StatisticsWriter
   - DayStatisticsTasklet
   - WeakStatisticsTasklet

