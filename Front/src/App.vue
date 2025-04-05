<script setup lang="ts">
import Header from './components/Header.vue'
import Question from './components/Game/Question.vue'

const ws = new WebSocket(`ws://localhost:3000`);

ws.onopen = function(event) {
    console.log('WebSocket connection established.');
}

</script>

<template>
  <Header />
  <Question />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
