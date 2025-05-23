<script setup lang="ts">
import { ref, onMounted } from 'vue';

console.log("Hello from Defi !")
import Question from '../Question.vue';
import {fetchThemes} from '../themes';

const questionData = ref(null);
const selectedTheme = ref<string>(""); 
const score = ref(0);
const themes = ref<string[]>([]); // Liste des thèmes
const showAnswer = ref(false);
const userAnswer = ref("");
const isCorrect = ref(false);
const correctAnswer = ref("");
const hasAnswered = ref(false); // Nouvelle variable pour suivre si l'utilisateur a déjà répondu

// Variables pour le suivi du temps et des échecs
const startTime = ref(0);
const questionTimes = ref<Record<string, number>>({});
const wrongAnswersCount = ref(0);
const MAX_WRONG_ANSWERS = 3;
const gameOver = ref(false);

function askQuestion() {
    // Reset answer display
    showAnswer.value = false;
    userAnswer.value = "";
    gameOver.value = false;
    hasAnswered.value = false; // Réinitialiser l'état de réponse
    
    // Enregistrer le temps de début pour cette question
    startTime.value = Date.now();
    
    const theme = selectedTheme.value; // Récupérer le thème sélectionné
    const url = new URL("http://83.195.188.17:3000/randomquestion");
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
            console.log("Question data:", questionData.value);
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
    // Empêcher les soumissions multiples pour la même question
    if (hasAnswered.value) {
        console.log("Une réponse a déjà été soumise pour cette question");
        return;
    }
    
    console.log("Answer submitted:", answer);
    userAnswer.value = answer; // Store the user's answer
    hasAnswered.value = true; // Marquer que l'utilisateur a répondu

    // Calculer le temps passé sur cette question
    const endTime = Date.now();
    const timeSpent = endTime - startTime.value;
    
    // Stocker le temps passé pour cette question
    if (questionData.value?.id) {
        questionTimes.value[questionData.value.id] = timeSpent;
    }

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
            isCorrect.value = data.correct;
            correctAnswer.value = questionData.value?.answer || "";
            showAnswer.value = true;
            
            if (data.correct) {
                score.value += 1; // Increment score if the answer is correct
                wrongAnswersCount.value = 0; // Réinitialiser le compteur en cas de bonne réponse
                console.log("Correct answer!");
            } else {
                console.log("Incorrect answer.");
                wrongAnswersCount.value += 1;
                
                // Vérifier si l'utilisateur a échoué (3 erreurs consécutives)
                if (wrongAnswersCount.value >= MAX_WRONG_ANSWERS) {
                    gameOver.value = true;
                    sendScoreToServer();
                }
            }
        } else {
            console.error("Error submitting answer");
        }
    })
    .catch((error) => {
        console.error("There has been a problem with your fetch operation:", error);
    });
}

// Fonction pour envoyer le score au serveur
function sendScoreToServer() {
    fetch("http://83.195.188.17:3000/savescore", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            score: score.value,
            questionTimes: questionTimes.value
        }),
    })
    .then(async (response) => {
        if (response.ok) {
            console.log("Score saved successfully");
        } else {
            console.error("Error saving score");
        }
    })
    .catch((error) => {
        console.error("There has been a problem with your fetch operation:", error);
    });
}

// Fonction pour abandonner le jeu
function abandonGame() {
    gameOver.value = true;
    sendScoreToServer();
}

onMounted(() => {
    fetchThemes()
        .then((data) => {
            themes.value = data; // Store the themes in the ref
        })
        .catch((error) => {
            console.error("Error fetching themes:", error);
        });
});
</script>

<template>
    <div class="defi-container">
        <h1>Défi</h1>
        
        <!-- Score display -->
        <div class="score-display">
            <h2>Score actuel: {{ score }}</h2>
        </div>

        <div class="theme-selection">
            <label for="theme-select">Choisissez un thème :</label>
            <select id="theme-select" v-model="selectedTheme">
                <option value="" disabled>-- Sélectionnez un thème --</option>
                <option v-for="theme in themes" :key="theme" :value="theme">
                    {{ theme }}
                </option>
            </select>
            <button id="askQuestion" @click="askQuestion()">Nouvelle question</button>
            <button class="abandon-button" @click="abandonGame()">Abandonner</button>
        </div>
        
        <div id="question">
            <!-- Passe l'état de réponse au composant Question -->
            <Question v-if="questionData && !gameOver" :question="questionData" :disabled="hasAnswered" @answer-submitted="submitAnswer" />
        </div>

        <!-- Answer feedback section -->
        <div v-if="showAnswer" class="answer-feedback">
            <div class="user-answer">
                <h3>Votre réponse :</h3> 
                <p :class="{ 'correct': isCorrect, 'incorrect': !isCorrect }">{{ userAnswer }}</p>
            </div>
            <div class="correct-answer">
                <h3>Réponse correcte :</h3>
                <p>{{ correctAnswer }}</p>
            </div>
            <div class="result-message" :class="{ 'correct': isCorrect, 'incorrect': !isCorrect }">
                {{ isCorrect ? 'Bravo ! +1 point' : 'Incorrect. Essayez encore !' }}
            </div>
            
            <!-- Message pour guider l'utilisateur -->
            <div class="next-step-message">
                <p>Cliquez sur <strong>"Nouvelle question"</strong> pour continuer</p>
            </div>
        </div>

        <!-- Game over section -->
        <div v-if="gameOver" class="game-over">
            <h2>Partie terminée</h2>
            <p>Votre score final : {{ score }}</p>
            <button @click="score = 0; wrongAnswersCount = 0; gameOver = false; askQuestion()">Nouvelle partie</button>
        </div>
    </div>
</template>

<style scoped>
.defi-container {
    max-width: 90%;
    margin: 0 auto;
    padding: 20px;
}

.score-display {
    background-color: #0a0a0a;
    padding: 10px 15px;
    border-radius: 5px;
    margin-bottom: 20px;
    text-align: center;
}

.theme-selection {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    align-items: center;
    flex-wrap: wrap; /* Allow wrapping on small screens */
}

.theme-selection label {
    margin-bottom: 5px;
}

.theme-selection select {
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #333;
    flex: 1; /* Allow select to grow */
    min-width: 200px; /* Ensure minimum width */
}

#askQuestion {
    padding: 8px 12px;
    font-size: 1rem;
}

.abandon-button {
    padding: 8px 12px;
    font-size: 1rem;
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.abandon-button:hover {
    background-color: #c0392b;
}

.answer-feedback {
    margin-top: 20px;
    padding: 15px;
    background-color: #070707;
    border-radius: 5px;
    border: 1px solid #222;
}

.user-answer, .correct-answer {
    margin-bottom: 10px;
    word-break: break-word; /* Prevent text overflow */
}

.correct {
    color: #2ecc71;
    font-weight: bold;
}

.incorrect {
    color: #e74c3c;
    font-weight: bold;
}

.result-message {
    margin-top: 15px;
    font-size: 1.2em;
    text-align: center;
    padding: 10px;
    border-radius: 4px;
}

.result-message.correct {
    background-color: rgba(46, 204, 113, 0.1);
}

.result-message.incorrect {
    background-color: rgba(231, 76, 60, 0.1);
}

.game-over {
    margin-top: 20px;
    padding: 20px;
    background-color: #070707;
    border-radius: 5px;
    border: 1px solid #222;
    text-align: center;
}

.game-over button {
    margin-top: 15px;
    padding: 10px 15px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
}

.game-over button:hover {
    background-color: #2980b9;
}

.next-step-message {
    margin-top: 20px;
    text-align: center;
    padding: 10px;
    background-color: rgba(52, 152, 219, 0.1);
    border: 1px dashed #3498db;
    border-radius: 4px;
}

.next-step-message p {
    color: #3498db;
    margin: 0;
}

/* Responsive adjustments for mobile */
@media (max-width: 768px) {
    .defi-container {
        padding: 10px;
        max-width: 100%;
    }

    .theme-selection {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
    }

    .theme-selection label {
        width: 100%;
    }

    .theme-selection select {
        width: 100%;
        margin: 0;
    }

    #askQuestion, .abandon-button {
        width: 100%;
        padding: 12px;
        margin-top: 5px;
        font-size: 1.1rem;
    }

    .score-display h2 {
        font-size: 1.3rem;
    }

    h1 {
        font-size: 1.8rem;
        text-align: center;
    }

    .answer-feedback {
        padding: 10px;
    }

    .result-message {
        font-size: 1.1rem;
    }
}

/* For very small screens */
@media (max-width: 480px) {
    h1 {
        font-size: 1.6rem;
    }

    .score-display h2 {
        font-size: 1.1rem;
    }

    .answer-feedback {
        margin-top: 15px;
        padding: 8px;
    }
}
</style>