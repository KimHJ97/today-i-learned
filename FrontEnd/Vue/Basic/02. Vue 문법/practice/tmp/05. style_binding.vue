<template>
    <div>
        <h1
            :style="{
                color: color,
                fontSize: fontSize
            }"
            @click="changeStyle">
            Hello World!
        </h1>
        <h1 :style="fontStyle">Hello World!</h1>
        <h1 :style="[fontStyle, backgroundStyle]">Hello World!</h1>
    </div>
</template>

<script>
export default {
    data() {
        return {
            color: 'orange',
            fontSize: '30px',
            fontStyle: {
                color: 'orange',
                fontSize: '30px'
            },
            backgroundStyle: {
                backgroundColor: 'black'
            }
        }
    },
    methods: {
        changeStyle() {
            this.color = 'red'
            this.fontSize = '50px'
        }
    }
}
</script>