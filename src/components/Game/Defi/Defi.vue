<script setup lang="ts">
import { ref, onMounted } from 'vue';

console.log("Hello from Defi !")
import Question from '../Question.vue';
import {fetchThemes} from '../themes';

interface QuestionData {
    id: string;
    answer: string;
    [key: string]: any;
}

interface QuestionPool {
    id: number;
    name: string;
    description?: string;
    question_count: number;
}

const questionData = ref<QuestionData | null>(null);
const selectedTheme = ref<string>(""); 
const score = ref(0);
const themes = ref<string[]>([]); // Liste des thèmes
const showAnswer = ref(false);
const userAnswer = ref("");
const isCorrect = ref(false);
const correctAnswer = ref("");
const hasAnswered = ref(false);

// Variables pour le suivi du temps et des échecs
const startTime = ref(0);
const questionTimes = ref<Record<string, number>>({});
const attemptCount = ref(0); // Nombre de tentatives pour la question courante
const MAX_ATTEMPTS = 3;
const gameOver = ref(false);

// Variables pour le mode pool
const pools = ref<QuestionPool[]>([]);
const selectedPool = ref<number | null>(null);
const poolQuestions = ref<QuestionData[]>([]);
const currentQuestionIndex = ref(0);
const isPoolMode = ref(false);

// Ajouter une clé pour forcer la recréation du composant Question
const questionKey = ref(0);

// Charger les pools de questions disponibles
async function fetchPools() {
    try {
        const response = await fetch("http://83.195.188.17:3000/questionpool", {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            }
        });
        
        if (response.ok) {
            pools.value = await response.json();
        }
    } catch (error) {
        console.error("Erreur lors du chargement des pools:", error);
    }
}

// Charger les questions d'un pool spécifique
async function fetchPoolQuestions(poolId: number) {
    try {
        const response = await fetch(`http://83.195.188.17:3000/questionpool/${poolId}/questions`, {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            poolQuestions.value = result.questions || [];
            
            // Initialiser le jeu avec la première question
            currentQuestionIndex.value = 0;
            score.value = 0;
            gameOver.value = false;
            
            if (poolQuestions.value.length > 0) {
                loadPoolQuestion();
            }
        }
    } catch (error) {
        console.error("Erreur lors du chargement des questions du pool:", error);
    }
}

// Charger la question courante du pool
function loadPoolQuestion() {
    if (currentQuestionIndex.value < poolQuestions.value.length) {
        questionData.value = poolQuestions.value[currentQuestionIndex.value];
        resetQuestionState();
    } else {
        // Toutes les questions ont été répondues
        gameOver.value = true;
        sendScoreToServer();
    }
}

// Passer à la question suivante du pool
function nextPoolQuestion() {
    currentQuestionIndex.value++;
    loadPoolQuestion();
}

function askQuestion() {
    if (isPoolMode.value && selectedPool.value) {
        // Mode pool: charger les questions du pool sélectionné
        fetchPoolQuestions(selectedPool.value);
    } else {
        // Mode thème: demander une question aléatoire
        resetQuestionState();
        
        const theme = selectedTheme.value;
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
                questionData.value = await response.json();
            } else {
                console.error("Error asking question");
            }
        })
        .catch((error) => {
            console.error("There has been a problem with your fetch operation:", error);
        });
    }
}

function resetQuestionState() {
    showAnswer.value = false;
    userAnswer.value = "";
    hasAnswered.value = false;
    attemptCount.value = 0;
    questionKey.value++;
    startTime.value = Date.now();
}

function submitAnswer(answer: string) {
    if (hasAnswered.value) {
        console.log("Une réponse a déjà été soumise pour cette question");
        return;
    }
    
    userAnswer.value = answer;
    
    const endTime = Date.now();
    const timeSpent = endTime - startTime.value;
    
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
            const data = await response.json();
            isCorrect.value = data.correct;
            correctAnswer.value = questionData.value?.answer || "";
            showAnswer.value = true;
            
            if (data.correct) {
                score.value += 1; // Ajouter un point pour une bonne réponse
                hasAnswered.value = true; // Bloquer d'autres tentatives
                
                if (isPoolMode.value) {
                    // Attendre un peu puis passer à la question suivante
                    setTimeout(() => {
                        nextPoolQuestion();
                    }, 2000);
                }
            } else {
                attemptCount.value += 1;
                
                if (attemptCount.value >= MAX_ATTEMPTS) {
                    hasAnswered.value = true; // Bloquer d'autres tentatives après 3 échecs
                    
                    if (isPoolMode.value) {
                        // En mode pool, passer à la question suivante après 3 échecs
                        setTimeout(() => {
                            nextPoolQuestion();
                        }, 2000);
                    } else {
                        // En mode thème, terminer le jeu après 3 erreurs
                        gameOver.value = true;
                        sendScoreToServer();
                    }
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
            questionTimes: questionTimes.value,
            poolId: isPoolMode.value ? selectedPool.value : null
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

function abandonGame() {
    gameOver.value = true;
    sendScoreToServer();
}

function resetGame() {
    score.value = 0;
    attemptCount.value = 0;
    gameOver.value = false;
    currentQuestionIndex.value = 0;
    askQuestion();
}

function toggleMode(mode: boolean) {
    isPoolMode.value = mode;
    questionData.value = null;
    score.value = 0;
    gameOver.value = false;
}

onMounted(() => {
    fetchThemes()
        .then((data) => {
            themes.value = data; // Store the themes in the ref
        })
        .catch((error) => {
            console.error("Error fetching themes:", error);
        });
    
    // Charger également les pools de questions
    fetchPools();
});
</script>

<template>
    <div class="defi-container">
        <h1>Défi</h1>
        
        <!-- Score display -->
        <div class="score-display">
            <h2>Score actuel: {{ score }}</h2>
            <div v-if="isPoolMode && poolQuestions.length > 0" class="question-counter">
                Question {{ currentQuestionIndex + 1 }} sur {{ poolQuestions.length }}
            </div>
        </div>

        <!-- Mode selector -->
        <div class="mode-selector">
            <button 
                @click="toggleMode(false)" 
                :class="{ 'active': !isPoolMode }">
                Mode Thème
            </button>
            <button 
                @click="toggleMode(true)" 
                :class="{ 'active': isPoolMode }">
                Mode Pool
            </button>
        </div>
        
        <!-- Theme selection (non-pool mode) -->
        <div v-if="!isPoolMode" class="theme-selection">
            <label for="theme-select">Choisissez un thème :</label>
            <select id="theme-select" v-model="selectedTheme">
                <option value="" disabled>-- Sélectionnez un thème --</option>
                <option v-for="theme in themes" :key="theme" :value="theme">
                    {{ theme }}
                </option>
            </select>
            <button id="askQuestion" @click="askQuestion()">Nouvelle question</button>
        </div>
        
        <!-- Pool selection (pool mode) -->
        <div v-if="isPoolMode" class="theme-selection">
            <label for="pool-select">Choisissez un pool de questions :</label>
            <select id="pool-select" v-model="selectedPool">
                <option :value="null" disabled>-- Sélectionnez un pool --</option>
                <option v-for="pool in pools" :key="pool.id" :value="pool.id">
                    {{ pool.name }} ({{ pool.question_count }} questions)
                </option>
            </select>
            <button id="askQuestion" @click="askQuestion()">Commencer le défi</button>
        </div>
        
        <div id="question">
            <Question 
                v-if="questionData && !gameOver" 
                :question="questionData" 
                :disabled="hasAnswered" 
                @answer-submitted="submitAnswer"
                :key="questionKey"
            />
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
                <template v-if="isCorrect">
                    Bravo ! +1 point
                    <p v-if="isPoolMode">Prochaine question dans quelques secondes...</p>
                </template>
                <template v-else>
                    <span v-if="attemptCount < MAX_ATTEMPTS">
                        Incorrect. Essayez encore ! (Tentative {{ attemptCount }}/{{ MAX_ATTEMPTS }})
                    </span>
                    <span v-else-if="isPoolMode">
                        Incorrect. Passage à la question suivante...
                    </span>
                    <span v-else>
                        Incorrect. Partie terminée après 3 erreurs !
                    </span>
                </template>
            </div>
            
            <!-- Message pour guider l'utilisateur -->
            <div v-if="!isPoolMode && (isCorrect || attemptCount >= MAX_ATTEMPTS)" class="next-step-message">
                <p>Cliquez sur <strong>"Nouvelle question"</strong> pour continuer</p>
            </div>
        </div>

        <!-- Game over section -->
        <div v-if="gameOver" class="game-over">
            <h2>Partie terminée</h2>
            <p>Votre score final : {{ score }}</p>
            <p v-if="isPoolMode">
                Vous avez répondu correctement à {{ score }} questions sur {{ poolQuestions.length }}.
            </p>
            <button @click="resetGame()">Nouvelle partie</button>
        </div>
        
        <button v-if="!gameOver && questionData" class="abandon-button" @click="abandonGame()">Abandonner</button>
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

.question-counter {
    font-size: 0.9em;
    color: #aaaaaa;
    margin-top: 5px;
}

.mode-selector {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    gap: 10px;
}

.mode-selector button {
    padding: 8px 16px;
    background-color: #141414;
    border: 1px solid #333;
    color: white;
    border-radius: 4px;
    cursor: pointer;
}

.mode-selector button.active {
    background-color: #3498db;
    border-color: #2980b9;
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
    word-break: break-word;
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
    .mode-selector {
        flex-direction: column;
    }
    
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
}
</style>