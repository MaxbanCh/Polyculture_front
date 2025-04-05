<script setup lang="ts">
console.log("Hello !")

defineProps<{ ques : JSON }>()

function pressBuzzer(){
    console.log("oui");
    return;
}

</script>

<template>
    <button id="Buzz" @click="pressBuzzer()">Bonjour je suis un buzzer</button>
</template>