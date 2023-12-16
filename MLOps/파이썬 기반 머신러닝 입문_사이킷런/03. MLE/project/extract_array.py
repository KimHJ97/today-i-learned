def extract(a):
    arr = []
    while(1):
        q = a // 10    # 몫
        temp = a % 10  # 나머지
        arr.append(temp)
        a = q

        if q == 0:
            break

    arr.reverse()
    print(arr)  

def extract2(number):
    arr = []
    while(1):
        quotient = number // 10    # 몫
        remain = number % 10  # 나머지
        arr.append(remain)
        number = quotient

        if quotient == 0:
            break

    arr.reverse()
    print(arr)


## __name__은 내장변수로 해당 변수는 직접 실행된 모듈의 경우 __main__ 이라는 값을 가지게 된다.
## 직접 실행되지 않고 import 된 모듈은 모듈의 이름(파일명)을 가지게 된다.

if __name__ == "__main__": # 실행문: 파일명과 실행문이 같은지 비교
    # 현재 파일과 실행 파일명이 같으면 실행
    print(__name__)
    number = 12345678
    extract2(number)
    
