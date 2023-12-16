# 245 => 2진수로 변경 후 Array에 담기

# 10진수를 2진수 배열로 변환
def decimalNumberToBinaryArray(number):
    arr = []
    while(1):
        quotient = number // 2    # 몫
        remain = number % 2  # 나머지
        arr.append(remain)
        number = quotient

        if quotient == 0:
            break

    # 원본값 유지 (불변)
    rev_arr = arr[::-1]
    print(f"이진수 원본값 유지: {rev_arr}")

    # 원본값을 변경
    arr.reverse()
    print(f"이진수 원본값 변경: {arr}")
    
    return rev_arr


# 2진수 배열을 10진수로 변환
## 1 * 2^0 + 1 * 2^1 + .. + 1 * 2^n = 10진수
def binaryArrayToDecimalNumber(binaryArray):
    reverseBinaryArray = binaryArray[::-1]

    decimalNumber = 0
    for idx, val in enumerate(reverseBinaryArray):
        decimalNumber += val * (2 ** idx)

    print(f"십진수: {decimalNumber}")

    return decimalNumber


def binaryNumberToDecimalNumber():
    binary = 11110101
    count = 0
    total = 0
    while(1):
        q = binary // 10 # 몫
        r = binary % 10 # 나머지
        total += r * (2 ** count)
        count = count + 1

        binary = q

        if q < 10:
            total = total + q * (2 ** count)
            break

    print(f"십진수: {total}")


def binary_to_digit(x, n):
    count = 0
    total = 0
    while(1):
        q = x // 10 # 몫
        r = x % 10 # 나머지
        total += r * (n ** count)
        count = count + 1

        x = q

        if q < 10:
            total = total + q * (n ** count)
            break

    print(f"십진수: {total}")
    return total

def digit_to_binary(x, n):
    arr = []
    while(1):
        q = x // n
        r = x % n
        arr.append(r)
        x = q
        if q < n:
            arr.append(q)
            break

    rev_arr = arr[::-1]
    print(f"{n}진수: {rev_arr}")
    return rev_arr

def digit_to_binary2(x, n):
    arr = []
    while(1):
        q = x // n
        r = x % n
        arr.append(str(r))
        x = q
        if q < n:
            arr.append(str(q))
            break

    arr = ''.join(arr[::-1])
    print(int(arr))


# 메인 함수
if __name__ == '__main__':
    print('Binary Running..')

    # 변환할 값 설정
    targetNumber = 245

    # 10진수를 2진수 배열로 변경
    binaryArray = decimalNumberToBinaryArray(targetNumber)

    # 2진수 배열을 10진수로 변경
    decimalNumber = binaryArrayToDecimalNumber(binaryArray)


    binaryNumberToDecimalNumber()
    a = binary_to_digit(11110101, 2)
    digit_to_binary(a, 2)
    digit_to_binary2(a, 2)
    
    print('Binary Complete..')




    
