<script setup lang="ts">
import ws from '../../../utils/websocket.ts'

function pressBuzzer(){
    console.log((document.getElementById("pseudo") as HTMLInputElement).value);
    if ((document.getElementById("pseudo") as HTMLInputElement).value === "Ketien") {
        alert("Bouh ! Je t'ai eu hihi !");
    }
    ws.send(JSON.stringify({
        type: "buzz",
        data: {
            name: (document.getElementById("pseudo") as HTMLInputElement).value
        }
    }));
    return;
}

function priority(event){
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