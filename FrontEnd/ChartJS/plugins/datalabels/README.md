# chartjs-plugin-datalabels

chartjs-plugin-datalabels는 Chart.js 그래픽 차트에 데이터 레이블(데이터 포인트의 값 또는 레이블을 시각적으로 나타내는 텍스트)을 추가하기 위한 플러그인입니다.  
이 플러그인을 사용하면 차트에 데이터를 보다 명확하게 표시하고 사용자에게 데이터 포인트의 값을 직접 확인할 수 있는 기능을 제공할 수 있습니다.  
chartjs-plugin-datalabels를 사용하면 차트의 각 데이터 포인트에 레이블을 추가하고 스타일링할 수 있습니다.  

쉽게, 그래프 위에 값을 표시해준다. (기존에는 마우스가 가까이있어야 정보가 노출된다.)
 - 공식 홈페이지: https://chartjs-plugin-datalabels.netlify.app/

<br/>

## 사용 방법

datatables 플러그인은 3.x 버전 이상만 호환이 가능하다.  

 - CDN
```HTML
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.0.0/dist/chart.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0"></script>
```

 - Script
```JS
var chart = new Chart(ctx, {
  plugins: [ChartDataLabels],
  options: {
    // ...
  }
})
```

<br/>

## 다양한 옵션

 - 기본 옵션
```JS
options: {
    plugins: {
        datalabels: {
            color: 'white',             // 글자 색상
            align: 'center',            // 글자 정렬
            font: {                     // 글자 굵기 및 사이즈
                weight: 'bold',
                size: 12
            },
            display: function(context) { // 값 표시 여부
                return context.dataset.data[context.dataIndex] > 15;
            },
            formatter: function(value, context) { // 값 포매터
                return value;
            },
            anchor: 'end', // 기준점을 끝(오른쪽)으로 설정
            align: 'end', // 텍스트를 끝(오른쪽)으로 정렬
            color: '#fff' // 글자색 설정 (예: 흰색)
        }
    }
    scales: { // X, Y축 (bar 그래프 한 줄로 표시하기)
        x: {
            stacked: true
        },
        y: {
            stacked: true
        }
    }
}
```

 - 이벤트
    - Listener를 등록하여 사용자의 마우스 이벤트를 감지할 수 있다.
    - enter: 마우스가 라벨 위로 들어올 때 발생
    - leave: 마우스가 라벨 밖으로 이동할 때 발생
    - click: 마우스가 라벨에서 클릭했을 때 발생
```JS
// 값을 둥글게 표현하고, 호버시 배경색 변경 처리
options: {
    plugins: {
        datalabels: {
            backgroundColor: function(context) {
                return context.hovered ? context.dataset.backgroundColor : 'white';
            },
            borderColor: function(context) {
                return context.dataset.backgroundColor;
            },
            borderRadius: 16,
            borderWidth: 3,
            color: function(context) {
                return context.hovered ? 'white' : context.dataset.backgroundColor;
            },
            font: {
                weight: 'bold'
            },
            offset: 8,
            formatter: Math.round,
            listeners: {
                enter: function(context) {
                    context.hovered = true; // 호버시 hovered 상태값 true
                    return true;
                },
                leave: function(context) {
                    context.hovered = false; // 이탈시 hovered 상태값 false
                    return true;
                }
            }
        }
    },
}

// 값을 사각형으로 표현하고, 클릭시 배경색 변경
options: {
    plugins: {
        datalabels: {
            backgroundColor: function(context) {
                return isSelected(context)
                ? context.dataset.backgroundColor
                : 'white';
            },
            borderColor: function(context) {
                return context.dataset.backgroundColor;
            },
            borderWidth: 2,
            color: function(context) {
                return isSelected(context)
                ? 'white'
                : context.dataset.backgroundColor;
            },
            font: {
                weight: 'bold'
            },
            offset: 8,
            padding: 6,
            listeners: {
                click: function(context) {
                if (isSelected(context)) {
                    deselect(context);
                } else {
                    select(context);
                }

                return true;
                }
            }
        }
    },
}

function lookup(context) {
  var dataset = context.datasetIndex;
  var index = context.dataIndex;
  var i, ilen;

  for (i = 0, ilen = selection.length; i < ilen; ++i) {
    if (selection[i].dataset === dataset && selection[i].index === index) {
      return i;
    }
  }

  return -1;
}

function isSelected(context) {
  return lookup(context) !== -1;
}

```
