# Numpy, Pandas

## Numpy

 - 1차원 배열
    - axis 0: 행
    - shape: (4,)  -> 1차원 배열이 1개이고, 데이터가 4개다.
 - 2차원 배열
    - axis 0: 열
    - axis 1: 행
    - shape: (2, 3)  -> 1차원 배열이 2개이고, 1차원 배열 내부 데이터가 3개다.
 - 2차원 배열
    - axis 0: 면
    - axis 1: 열
    - axis 2: 행
    - shape: (4, 3, 2)  -> 2차원 배열이 4개이고, 1차원 배열이 3개이다. 1차원 배열 내부 데이터가 2개이다.

<br/>

### 명령어

 - indexing
    - matrix[row, column]
    - matrix[start:end, start:end]
    - matrix[:end, start:]
    - fancy indexing
        - matrix[[2, 4, 5]] -> 1차 행렬에서 2, 4, 5 인덱스
        - matrix[[0, 2], 3] -> 2차 행렬에서 0, 2 행의 3번쨰 열
    - boolean indexing
        - matrix[matrix > 5] -> 행렬 값을 검사하여 true, false 배열을 반환
```python
# 0행의 1열 값 얻기
arr[0][1]  # pyhton indexsing
matrix[0, 1] # numpy indexsing
```

 - sort
```python
# 원본값 유지, 복사하여 반환
matrix = np.sort(matrix, axis=0)
matrix = np.sort(matrix, axis=1)[::-1]

# 원본값 변경, 반환값 X
matrix.sort()
matrix.sort()[::-1]

# 값에 대한 정렬을 하고, 기존 값에 정렬된 인덱스 순번을 제공한다.
matrix_indices = np.argsort(matrix, axis=0)
matrix_indices = np.argsort(matrix, axis=1)[::-1]

```

<br/>

## Pandas

```python
df.head(갯수)
df.tail(갯수)
df.shape
df.keys()
df.info()
df.info()
df.describe()
df.fillna(0, inplace=True) # inplace가 True이면 원본 데이터가 변경된다.
df['Age'].values
```

 - ndarray로 변환
```python
# DataFrame -> Numpy ndarray
array = df.values
array = np.array(df)
array = df.to_numpy()

# DataFrame -> Python list
list = df.values.tolist()
dict = df.to_dict("list")
```

 - Column 추가
```python
df["colName"] = 0

# 컬럼명 변경
df.rename(columns = {})
```

 - Column 접근
    - loc: 컬럼명으로 접근
    - iloc: 인덱스 순번으로 접근
```python
df["colName"]
```
