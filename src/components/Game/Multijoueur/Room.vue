// Front/src/components/Game/Room.vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { fetchThemes } from '../themes';
import ws from '../../../utils/websocket';

const roomCode = ref('');
const inputRoomCode = ref(''); // Nouveau ref pour l'input
const players = ref([]);
const selectedThemes = ref([]);
const isHost = ref(false);
const themes = ref([]);

// Game Refs
const gameInProgress = ref(false);
const currentQuestion = ref(null);
const timeRemaining = ref(0);
const totalRounds = ref(10); // Number of questions per game
const currentRound = ref(0);
const playerScores = ref({});
const userAnswer = ref('');
const hasAnswered = ref(false);
const questionResults = ref(null);


function getUserId(): string {
  // Récupérer tous les cookies
  const cookies = document.cookie.split(';');
  console.log('Cookies:', cookies);
  
  // Chercher le cookie auth_token
  const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token'));

  console.log('Auth token:', authCookie);

  if (!authCookie) {
    console.error('Auth token cookie not found');
    return '';
  }
  
  // Extraire la valeur du token
  const token = authCookie.split('=')[1].trim();
  
  try {
    // Décoder le token JWT (sans vérifier la signature côté client)
    // Le token JWT est composé de 3 parties: header.payload.signature
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Retourner le username (selon la structure de votre token)
    return payload.userName || '';
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return '';
  }
}

function getUsername(): string {
  let username = document.getElementById('username') as HTMLInputElement;
  if (username) {
    return username.value;
  } else {
    console.error('Username input not found');
    return '';
  }
}

function createRoom() {
  ws.send(JSON.stringify({
    type: 'CREATE_ROOM',
    userId: getUserId(),
    username: getUsername()
  }));
}

function joinRoom() {
  if (!inputRoomCode.value) return;

  ws.send(JSON.stringify({
    type: 'JOIN_ROOM',
    roomCode: inputRoomCode.value,
    userId: getUserId(),
    username: getUsername()
  }));
}

function startGame() {
  if (isHost.value) {
    ws.send(JSON.stringify({
      type: 'START_GAME',
      roomCode: roomCode.value,
      themes: selectedThemes.value,
      totalRounds: totalRounds.value
    }));
  }
}

function submitAnswer() {
  if (!hasAnswered.value && gameInProgress.value && currentQuestion.value) {
    ws.send(JSON.stringify({
      type: 'SUBMIT_ANSWER',
      roomCode: roomCode.value,
      userId: getUserId(),
      username: getUsername(),
      answer: userAnswer.value,
      timestamp: Date.now()
    }));
    hasAnswered.value = true;
  }
}

// Handle timer updates
function updateTimer() {
  if (timeRemaining.value > 0) {
    timeRemaining.value -= 1;
  }
}

// Enhanced WebSocket message handler
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received WebSocket message:', data);

  switch (data.type) {
    case 'ROOM_CREATED':
      roomCode.value = data.room.code;
      isHost.value = true;
      players.value = data.room.players;
      break;
      
    case 'ROOM_JOINED':
      roomCode.value = data.room.code;
      players.value = data.room.players;
      isHost.value = data.room.host === getUserId();
      break;
      
    case 'PLAYER_JOINED':
      players.value = data.players;
      break;
      
    case 'GAME_STARTED':
      gameInProgress.value = true;
      currentRound.value = 0;
      playerScores.value = data.scores || {};
      break;
      
    case 'NEW_QUESTION':
      currentQuestion.value = data.question;
      timeRemaining.value = data.timeLimit || 30; // Default 30 seconds
      currentRound.value = data.round;
      hasAnswered.value = false;
      userAnswer.value = '';
      questionResults.value = null;
      
      // Start timer
      const timer = setInterval(() => {
        updateTimer();
        if (timeRemaining.value <= 0) {
          clearInterval(timer);
        }
      }, 1000);
      break;
      
    case 'ROUND_ENDED':
      questionResults.value = data.results;
      playerScores.value = data.scores;
      break;
      
    case 'GAME_ENDED':
      gameInProgress.value = false;
      playerScores.value = data.finalScores;
      break;
  }
};

// Clean up on component unmount
onUnmounted(() => {
  if (roomCode.value) {
    ws.send(JSON.stringify({
      type: 'LEAVE_ROOM',
      roomCode: roomCode.value,
      userId: getUserId(),
    }));
  }
});

// Fetch themes on mount
onMounted(() => {
  fetchThemes()
    .then((data) => {
      themes.value = data;
    })
    .catch((error) => {
      console.error("Error fetching themes:", error);
    });
});
</script>

<template>
  <div class="room">
    <!-- Lobby view when not in a game -->
    <div v-if="!roomCode">
      <h2>Créer ou rejoindre un salon</h2>
      <h3>Créer un salon</h3>
      <input id="username" placeholder="Nom d'utilisateur">
      <button @click="createRoom">Créer un salon</button>
      <div>
        <h3>Rejoindre un salon</h3>
        <input v-model="inputRoomCode" placeholder="Code du salon">
        <button @click="joinRoom">Rejoindre</button>
      </div>
    </div>

    <!-- Room view (either waiting or in-game) -->
    <div v-else>
      <!-- Waiting room view -->
      <div v-if="!gameInProgress">
        <h2>Salon: {{ roomCode }}</h2>
        <div class="players">
          <h3>Joueurs</h3>
          <ul>
            <li v-for="player in players" :key="player.id">
              {{ player.username }}
            </li>
          </ul>
        </div>

        <div v-if="isHost" class="themes">
          <h3>Sélection des thèmes</h3>
          <select multiple v-model="selectedThemes">
            <option v-for="theme in themes" :key="theme">
              {{ theme }}
            </option>
          </select>
          
          <div class="game-options">
            <label for="rounds">Nombre de questions:</label>
            <input type="number" id="rounds" v-model="totalRounds" min="5" max="20">
          </div>
          
          <button @click="startGame">Démarrer la partie</button>
        </div>
      </div>
      
      <!-- In-game view -->
      <div v-else class="game-container">
        <div class="game-header">
          <h2>Question {{ currentRound }} sur {{ totalRounds }}</h2>
          <div class="timer">Temps restant: {{ timeRemaining }} secondes</div>
        </div>
        
        <!-- Question display -->
        <div v-if="currentQuestion" class="question-container">
          <div class="question-theme">Thème: {{ currentQuestion.theme }}</div>
          <h3 class="question-text">{{ currentQuestion.question }}</h3>
          
          <!-- Answer input (disabled after submission) -->
          <div class="answer-section">
            <input 
              v-model="userAnswer" 
              :disabled="hasAnswered || timeRemaining <= 0" 
              placeholder="Votre réponse" 
              @keyup.enter="submitAnswer"
            />
            <button 
              @click="submitAnswer" 
              :disabled="hasAnswered || timeRemaining <= 0"
            >
              Répondre
            </button>
          </div>
          
          <!-- Answer status message -->
          <div v-if="hasAnswered" class="answer-status">
            Réponse envoyée! Attente des autres joueurs...
          </div>
        </div>
        
        <!-- Round results -->
        <div v-if="questionResults" class="results-container">
          <h3>Réponse correcte: {{ questionResults.correctAnswer }}</h3>
          <table class="results-table">
            <thead>
              <tr>
                <th>Joueur</th>
                <th>Réponse</th>
                <th>Temps</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="result in questionResults.playerResults" :key="result.playerId">
                <td>{{ result.username }}</td>
                <td>{{ result.answer }}</td>
                <td>{{ result.time }}s</td>
                <td>{{ result.points }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Scoreboard -->
        <div class="scoreboard">
          <h3>Scores</h3>
          <table>
            <thead>
              <tr>
                <th>Joueur</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(score, playerId) in playerScores" :key="playerId">
                <td>{{ players.find(p => p.id === playerId)?.username }}</td>
                <td>{{ score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.room {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.game-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timer {
  font-size: 1.2rem;
  font-weight: bold;
  color: #e74c3c;
}

.question-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.question-theme {
  color: #7f8c8d;
  margin-bottom: 10px;
}

.question-text {
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.answer-section {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.answer-section input {
  flex-grow: 1;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.answer-status {
  color: #3498db;
  margin-top: 10px;
}

.results-container {
  background-color: #eafaf1;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
}

.results-table, .scoreboard table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.results-table th, .scoreboard th,
.results-table td, .scoreboard td {
  padding: 8px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

.game-options {
  margin: 15px 0;
}
</style>