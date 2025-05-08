<script setup lang="ts">
import { ref } from 'vue';
import { defineEmits } from 'vue';

const emit = defineEmits(["submit-answer"]);

const userAnswer = ref("");

function submitAnswer() {
    // Émettre un événement avec la réponse
    emit("submit-answer", userAnswer.value);
}
</script>

<template>
    <input type="text" id="answer" v-model="userAnswer" placeholder="Réponse" />
    <button id="submit" @click="submitAnswer">Valider</button>
</template>