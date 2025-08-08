<script setup lang="ts">
import { ref } from 'vue';
import { defineEmits } from 'vue';
defineProps<{ disabled?: boolean }>();

const emit = defineEmits(["submit-answer"]);

const userAnswer = ref("");

function submitAnswer() {
    emit("submit-answer", userAnswer.value);
}
</script>

<template>
<input type="text" id="answer" v-model="userAnswer" :disabled="disabled" placeholder="Réponse" />
<button id="submit" @click="submitAnswer" :disabled="disabled">Valider</button></template>