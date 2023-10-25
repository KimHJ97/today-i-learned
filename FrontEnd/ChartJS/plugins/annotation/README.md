# chartjs-plugin-annotation

chartjs-plugin-annotation은 Chart.js 그래픽 차트에 주석(Annotation)을 추가하는 데 사용되는 플러그인입니다.  
이 플러그인을 사용하면 차트에 특정 데이터 포인트, 영역 또는 라인에 대한 주석을 추가하여 데이터 시각화를 더욱 명확하게 할 수 있습니다.  
주석은 차트의 특정 지점에 관련 정보를 표시하는 데 사용됩니다.  
 - 공식 홈페이지: https://www.chartjs.org/chartjs-plugin-annotation/latest/

<br/>

## 사용 방법

 - 버전별 호환성
    - annotation 0.5.7 문서: https://github.com/chartjs/chartjs-plugin-annotation/blob/1ab782afce943456f958cac33f67edc5d6eab278/README.md
```
annotation 2.2.1 호환: Chart.js 3.7.0 ~ 3.9.1
annotation 1.4.0 호환: Chart.js 3.0.0 ~ 3.6.2
annotation 0.5.7 호환: Chart.js 2.4.0 ~ 2.9.x
```

 - CDN
```HTML
<script src="path/to/chartjs/dist/chart.min.js"></script>
<script src="path/to/chartjs-plugin-annotation/dist/chartjs-plugin-annotation.min.js"></script>
<script>
    var myChart = new Chart(ctx, {...});
</script>
```

<br/>

## 다양한 옵션

 - 기본 옵션
```JS
// 박스 넣기
options: {
    plugins: {
        annotation: {
        annotations: {
            box1: {
                type: 'box',
                xMin: 1,
                xMax: 2,
                yMin: 50,
                yMax: 70,
                backgroundColor: 'rgba(255, 99, 132, 0.25)'
            }
        }
        }
    }
}

// 글자 넣기
options: {
    plugins: {
        annotation: {
            annotations: {
                label1: {
                    type: 'label',
                    xValue: 2.5,
                    yValue: 60,
                    backgroundColor: 'rgba(245,245,245)',
                    content: ['This is my text', 'This is my text, second line'],
                    font: {
                        size: 18
                    }
                }
            }
        }
    }
};

// 라인 넣기
options: {
    plugins: {
        annotation: {
            annotations: {
                line1: {
                    type: 'line',
                    yMin: 60,
                    yMax: 60,
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 2,
                }
            }
        }
    }
};
```
