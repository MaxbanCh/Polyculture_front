<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  question: {
    id: string;
    question: string;
    question_type?: string;
    options?: Array<{
      id: number;
      texte: string;
      est_correcte: boolean;
    }>;
    [key: string]: any;
  };
  disabled?: boolean;
}>();

const emit = defineEmits(['answer-submitted']);

const userAnswer = ref('');
const selectedOptionId = ref<number | null>(null);

// Réinitialiser la réponse quand la question change
watch(() => props.question, () => {
  userAnswer.value = '';
  selectedOptionId.value = null;
});

function submitAnswer() {
  if (props.question.question_type === 'choice') {
    if (selectedOptionId.value !== null) {
      emit('answer-submitted', selectedOptionId.value);
    }
  } else {
    if (userAnswer.value.trim()) {
      emit('answer-submitted', userAnswer.value.trim());
    }
  }
}

function selectOption(optionId: number) {
  if (!props.disabled) {
    selectedOptionId.value = optionId;
    submitAnswer();
  }
}
</script>

<template>
  <div class="question-container">
    <h2 class="question-text">{{ question.question }}</h2>
    
    <!-- Questions de type texte -->
    <div v-if="!question.question_type || question.question_type === 'text'" class="text-question">
      <input 
        type="text" 
        v-model="userAnswer" 
        placeholder="Votre réponse..." 
        :disabled="disabled"
        @keyup.enter="submitAnswer"
      />
      <button @click="submitAnswer" :disabled="disabled || !userAnswer.trim()">
        Répondre
      </button>
    </div>
    
    <!-- Questions à choix multiple -->
    <div v-else-if="question.question_type === 'choice'" class="choice-question">
      <div class="options-list">
        <div 
          v-for="option in question.options" 
          :key="option.id" 
          class="option-item"
          :class="{ 
            'option-selected': selectedOptionId === option.id,
            'disabled': disabled 
          }"
          @click="selectOption(option.id)"
        >
          {{ option.texte }}
        </div>
      </div>
    </div>
    
    <!-- Type de question inconnu -->
    <div v-else class="unknown-type">
      Type de question non pris en charge.
    </div>
  </div>
</template>

<style scoped>
.question-container {
  margin-bottom: 20px;
}

.question-text {
  font-size: 1.4rem;
  margin-bottom: 20px;
}

.text-question {
  display: flex;
  gap: 10px;
}

.text-question input {
  flex-grow: 1;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #1a1a1a;
  color: white;
}

.text-question button {
  padding: 10px 20px;
  font-size: 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.text-question button:disabled {
  background-color: #777;
  cursor: not-allowed;
}

.choice-question {
  margin-top: 15px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  padding: 15px;
  background-color: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-item:hover:not(.disabled) {
  background-color: #222;
  transform: translateY(-2px);
}

.option-selected {
  background-color: #2980b9;
  border-color: #3498db;
}

.option-item.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.unknown-type {
  padding: 20px;
  background-color: #f39c12;
  color: #fff;
  border-radius: 4px;
  text-align: center;
  font-weight: bold;
}
</style>