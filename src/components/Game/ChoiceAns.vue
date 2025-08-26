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
    <div>
        <input type="radio" id="answer1" name="answer" value="answer1" v-model="userAnswer">
        <label for="answer1">Réponse 1</label><br>
        <input type="radio" id="answer2" name="answer" value="answer2" v-model="userAnswer">
        <label for="answer2">Réponse 2</label><br>
        <input type="radio" id="answer3" name="answer" value="answer3" v-model="userAnswer">
        <label for="answer3">Réponse 3</label><br>
        <input type="radio" id="answer4" name="answer" value="answer4" v-model="userAnswer">
        <label for="answer4">Réponse 4</label><br>
        <button id="submit" @click="submitAnswer">Valider</button>
    </div>
</template>