<script setup lang="ts">
import TextAns from './TextAns.vue';
import ChoiceAns from './ChoiceAns.vue';

defineProps<{ question: any }>();
</script>

<template>
    <h3 id="theme">{{ question.theme }}</h3>
    <h2 id="question">{{ question.question }}</h2>
    <div id="answer">
        <!-- Render answer input dynamically based on question type -->
        <TextAns v-if="question.type === 'text'" />
        <ChoiceAns v-else-if="question.type === 'choice'" />
        <p v-else>Unknown question type: {{ question.type }}</p>
    </div>
</template>