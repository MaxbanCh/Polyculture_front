<script setup lang="ts">
console.log("Hello from Defi !")
import TextAns from '../TextAns.vue';
import ChoiceAns from '../ChoiceAns.vue';
import ws from '../../../utils/websocket.ts'


</script>

<template>
    <h2 id="Theme"> - Theme - </h2>
    <h1 id="Question"> - Question - </h1>

    <div id="answer"></div>
</template>