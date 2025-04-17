<script setup lang="ts">
console.log("Hello !")
import TextAns from './TextAns.vue';
import ChoiceAns from './ChoiceAns.vue';
import ws from '../../utils/websocket.ts'


</script>

<template>
    <h2> - Theme - </h2>
    <h1> - Question - </h1>

    <div id="answer"></div>
</template>