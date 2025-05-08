<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import ws from '../../../utils/websocket'

function pressBuzzer(){
    console.log((document.getElementById("pseudo") as HTMLInputElement).value);
    ws.send(JSON.stringify({
        type: "buzz",
        data: {
            name: (document.getElementById("pseudo") as HTMLInputElement).value
        }
    }));
    return;
}

function priority(event : any){
    console.log("Buzzer pressed");
    const buzz = JSON.parse(event.data);
    console.log("pressed by : ${buzz.owner}");
    const light = document.getElementById("light");
    if (light) {
        light.textContent = `La main est à : ${buzz.owner}`;
        if (buzz.owner === (document.getElementById("pseudo") as HTMLInputElement).value) {
            light.style.backgroundColor = "green";
        } else {
            light.style.backgroundColor = "red";
        }
        light.style.width = "400px";
        light.style.height = "100px";
    }

    return ;
}

onMounted(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.code === "Space") {
            pressBuzzer();
        }
    };

    document.addEventListener("keydown", handleKeyDown);

    onUnmounted(() => {
        document.removeEventListener("keydown", handleKeyDown);
    });
});

ws.onmessage = function(event) {
    const buzz = JSON.parse(event.data);
    if (buzz.type === "buzz") {
        priority(event);
    }
}
</script>

<template>
    <button id="Buzz" @click="pressBuzzer()">Bonjour je suis un buzzer</button>

    <input type="text" id="pseudo" placeholder="Pseudo" />

    <div id="light">

    </div>
</template>