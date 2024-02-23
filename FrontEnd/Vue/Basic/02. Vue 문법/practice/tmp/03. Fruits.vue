<template>
    <div>
        <section v-if="hasFruit">
            <h1>Fruits</h1>
            <ul>
                <li 
                    v-for="fruit in fruits" 
                    :key="fruit">
                    {{ fruit }}
                </li>
            </ul>
        </section>
        <section>
            <h1>Reverse Fruits<h1/>
            <ul>
                <li 
                    v-for="fruit in reverseFruits" 
                    :key="fruit">
                    {{ fruit }}
                </li>
            </ul>
        </section>
    </div>
</template>

<script>
export default {
    data() {
        return {
            fruits: [
                'Apple', 'Banana', 'Cherry'
            ]
        }
    },
    computed: {
        // computed 안에서 계산된 데이터는 
        // data 옵션에 정의해둔 특정한 옵션에 데이터를 추가적으로 연산 후에
        // 반환해서 사용할 수 있는 추가적인 데이터로 볼 수 있다. 
        // 계산된 데이터
        hasFruit() {
            return this.fruits.length > 0
        },
        reverseFruits() {
            return this.fruits.map(fruit => {
                // 과일 이름을 split() 을 이용하여 단어 하나씩 쪼개고,
                // reverse()로 만들어진 배열의 순서를 변경하고,
                // join()으로 뒤집어진 배열을 빈문자열을 기준으로 합쳐준다.
                return fruit.split('').reverse().join('')
            })
        }
    }
}
</script>
