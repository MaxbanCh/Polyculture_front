<script setup lang="ts">
console.log("Hello from Defi !")
import Question from '../Question.vue';
// import ws from '../../../utils/websocket.ts'

function askQuestion() {
    console.log(document.getElementById("theme").value);
    const theme = (document.getElementById("theme") as HTMLInputElement)?.value ?? "";
    const url = new URL("http://83.195.188.17:3000/question");
    if (theme) {
        url.searchParams.append("theme", theme);
    }

    fetch(url.toString(), {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    })

    .then(async (response) => {
        if (response.ok) {
            console.log("Question asked successfully");
            const data = await response.json();
            console.log(data);

            const question = new Question(data);
            const questionDiv = document.getElementById("question");
            if (questionDiv) {
                questionDiv.innerHTML = "";
                questionDiv.appendChild(question);
            } else {
                console.error("Element not found");
            }
        }
        // throw new Error("Network response was not ok.");
        else {
            console.error("Error asking question");
        }
    })
    .then((data) => {
        console.log(data);
    })
    .catch((error) => {
        console.error("There has been a problem with your fetch operation:", error);
    });
}


function answerQuestion(event : any) {
    const question = JSON.parse(event.data);
    console.log("Question : ${question.question}");

    return;
}

</script>

<template>
    <h1>Defi</h1>
    <input type="text" id="theme" placeholder="Theme" />
    <button id="askQuestion" @click="askQuestion()">Ask Question</button>
    <div id="question">
    </div>
</template>