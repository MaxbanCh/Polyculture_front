<script setup lang="ts">
console.log("Hello !")
import TextAns from './TextAns.vue';
import ChoiceAns from './ChoiceAns.vue';

defineProps<{ question : any }>()

function displayQuestion(question: any) {
    const questionDiv = document.getElementById("question");
    const answerDiv = document.getElementById("answer");
    const themeDiv = document.getElementById("theme");
    if (questionDiv && answerDiv && themeDiv) {
        questionDiv.innerHTML = question.question;
        themeDiv.innerHTML = question.theme;
        answerDiv.innerHTML = "";

        if (question.type === "text") {
            const textAns = new TextAns();
            answerDiv.appendChild(textAns);
        } else if (question.type === "choice") {
            const choiceAns = new ChoiceAns();
            answerDiv.appendChild(choiceAns);
        } else {
            console.error("Unknown question type: " + question.type);
        }
    } else {
        console.error("Element not found");
    }
}
</script>

<template>
    <h2 id="theme"> - Theme - </h2>
    <h1 id="question"> - Question - </h1>

    <div id="answer"></div>
</template>