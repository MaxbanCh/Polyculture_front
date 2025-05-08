<script setup lang="ts">
//import Question from './Game/Question.vue'
// import ws from '../utils/websocket.ts'
import Buzzer from './Game/Buzzer/Buzzer.vue'

// ws.onopen = function(event) {
//     console.log('WebSocket connection established.');
// }
</script>

<template>
  <h1>PolyCulture</h1>
  
  <buzzer />
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
