<script setup lang="ts">
import ws from '../../../utils/websocket.ts'

function pressBuzzer(){
    console.log("Buzz");
    ws.send(JSON.stringify({
        type: "buzz",
        data: {
            id: 1,
            name: "Buzzer"
        }
    }));
    return;
}

</script>

<template>
    <button id="Buzz" @click="pressBuzzer()">Bonjour je suis un buzzer</button>
</template>