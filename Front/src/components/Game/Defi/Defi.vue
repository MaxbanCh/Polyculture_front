<script setup lang="ts">
import { ref, onMounted } from 'vue';

console.log("Hello from Defi !")
import Question from '../Question.vue';
// import ws from '../../../utils/websocket.ts'

const questionData = ref(null);
const themes = ref<string[]>([]); // Liste des thèmes
const selectedTheme = ref<string>(""); 

async function fetchThemes() {
    try {
        const response = await fetch("http://83.195.188.17:3000/themes", {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const data = await response.json();
            themes.value = data.themes; // Stocker les thèmes
        } else {
            console.error("Failed to fetch themes");
        }
    } catch (error) {
        console.error("Error fetching themes:", error);
    }
}


function askQuestion() {
    // console.log(document.getElementById("theme").value);
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
            questionId: questionData.value.id,
            answer: answer,
        }),
    })
        .then(async (response) => {
            if (response.ok) {
                console.log("Answer submitted successfully");
            } else {
                console.error("Error submitting answer");
            }
        })
        .catch((error) => {
            console.error("There has been a problem with your fetch operation:", error);
        });
}
onMounted(() => {
    fetchThemes();
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