# FE1 Holiday

커맨드 라인에서 각 국가의 공휴일을 확인할 수 있는 Node.js 애플리케이션

## 사용법

```bash
node holiday.js 국가코드 연도_또는_next
```

- `국가코드`와 `연도`는 반드시 전달되어야 합니다.
- 충분한 인수가 전달되지 않으면 에러 메시지 또는 도움말이 출력되어야 합니다.
- 올바르지 않은 `국가코드`가 전달되면 `Wrong country code` 에러 메시지를 출력합니다.

### 특정년도의 휴일 조회

```console
# 예시
node holiday.js KR 2024

# 결과
2024-01-01 New Year's Day 새해
2024-02-09 Lunar New Year 설날
...
2024-12-25 Christmas Day 크리스마스
```

### 오늘 이후 예정된 휴일 조회

```console
# 예시
node holiday.js KR next

# 결과
2024-10-09 Hangul Day 한글날
2024-12-25 Christmas Day 크리스마스
...

```

## API

https://date.nager.at/Api 에서 제공하는 API 사용
