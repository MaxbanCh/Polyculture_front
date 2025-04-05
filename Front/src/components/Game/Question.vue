<script setup lang="ts">
console.log("Hello !")
import TextAns from './TextAns.vue';

defineProps<{ ques : JSON }>()

</script>

<template>
    <h2> - Theme - </h2>
    <h1> - Question - </h1>
    <TextAns />
</template>