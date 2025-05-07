<script setup lang="ts">
import { ref, onMounted } from 'vue';

console.log("Hello from Defi !")
import Question from '../Question.vue';
import {themes} from '../themes';

const questionData = ref(null);
const selectedTheme = ref<string>(""); 
const score = ref(0);

function askQuestion() {
    // console.log(document.getElementById("theme").value);
    const theme = selectedTheme.value; // Récupérer le thème sélectionné
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
            questionData.value = await response.json(); // Store the question data
        } else {
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


function submitAnswer(answer: string) {
    console.log("Answer submitted:", answer);

    fetch("http://83.195.188.17:3000/answer", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            questionId: questionData.value?.id ?? null,
            answer: answer,
        }),
    })
    .then(async (response) => {
        if (response.ok) {
            console.log("Answer submitted successfully");
            const data = await response.json();
            if (data.correct) {
                score.value += 1; // Increment score if the answer is correct
                console.log("Correct answer!");
            } else {
                console.log("Incorrect answer.");
            }
        } else {
            console.error("Error submitting answer");
        }
    })
    .catch((error) => {
        console.error("There has been a problem with your fetch operation:", error);
    });
}
onMounted(() => {
});

</script>

<template>
    <h1>Defi</h1>
    <label for="theme-select">Choisissez un thème :</label>
    <select id="theme-select" v-model="selectedTheme">
        <option value="" disabled>-- Sélectionnez un thème --</option>
        <option v-for="theme in themes" :key="theme" :value="theme">
            {{ theme }}
        </option>
    </select>
    <button id="askQuestion" @click="askQuestion()">Ask Question</button>
    
    <div id="question">
        <Question v-if="questionData" :question="questionData" @answer-submitted="submitAnswer" />
    </div>
</template>