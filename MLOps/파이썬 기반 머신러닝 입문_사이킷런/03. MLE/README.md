## Preprocessing(전처리)

### label, one-hot encoding

 - 라벨링을 적용하면 A, B, C 같은 문자열 값이 0, 1, 2 같은 숫자 형태로 변환된다. 하지만, 숫자 값으로 인한 가중치가 생길 수 있어 원-핫 인코딩을 적용할 수 있다.
 - 원-핫 인코딩은 범주형 데이터를 수치형 데이터로 변환한다. One-Hot Encoding의 주요 아이디어는 각 범주를 이진(0 또는 1)의 값을 가지는 새로운 이진 변수로 변환하는 것입니다. 각 이진 변수는 원래 범주 중 하나를 나타내며, 해당 범주에 속하면 1로 표시되고 속하지 않으면 0으로 표시됩니다.

```python
# 라벨링
from sklearn.preprocessing import LabelEncoder

lab = LabelEncoder()
df['my_column'] = lab.fit_transform(df['my_column'])

# 원-핫 인코딩
from sklearn.preprocessing import OneHotEncoder

encoder = OneHotEncoder(handle_unknown='ignore')

encoder_df = pd.DataFrame(encoder.fit_transform(df[['team']]).toarray())

final_df = df.join(encoder_df)
```

<br/>

### 정규화(데이터 스케일링)

정규화 또는 데이터 스케일링은 데이터의 값을 특정 범위로 조정하는 과정을 말합니다. 이는 다양한 머신러닝 알고리즘에서 중요한 전처리 단계 중 하나이며, 데이터의 특성 간에 크기 차이가 클 때 모델의 성능을 향상시키는 데 도움이 됩니다.  

 - StandarScaler
    - 데이터를 평균이 0이고 표준편차가 1인 분포로 변환합니다.
 - MinMaxScaler
    - 데이터를 특정 범위 [0, 1] 또는 [-1, 1] 등으로 변환합니다.
 - RobustScaler
    - RobustScaler는 중앙값(median)과 IQR(Interquartile Range)를 사용하여 데이터를 스케일링합니다. 중앙값은 데이터의 중심 위치를 나타내며, IQR은 데이터의 중앙 50% 범위를 나타냅니다.
    - RobustScaler를 사용하면 이상치가 있는 데이터셋에서도 안정적인 스케일링을 얻을 수 있습니다. 특히 중앙값과 IQR은 이상치에 민감하지 않으므로, 이를 고려하여 데이터를 스케일링하는 데 유용합니다.
