<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { fetchThemes } from '../themes';

const router = useRouter();
const ws = new WebSocket(`wss://83.195.188.17:3000/Multi`);

// Authentification
const isAuthenticated = ref(false);
const username = ref('');
const token = ref('');

// Room state
const roomCode = ref('');
const inputRoomCode = ref(''); 
interface Player {
  id: string;
  username: string;
  status?: string;
}

const players = ref<Player[]>([]);
const selectedThemes = ref<string[]>([]);
const isHost = ref(false);
const themes = ref<string[]>([]);

// Question pools
interface QuestionPool {
  id: number;
  name: string;
  description?: string;
  question_count?: number;
  created_by?: string;
}
const questionPools = ref<QuestionPool[]>([]);
const selectedPoolId = ref<number | undefined>(undefined);

const playerScores = ref<Record<string, number>>({});
const gameInProgress = ref(false);
interface Question {
  question: string;
  theme: string;
  // Ajoutez d'autres propriétés si nécessaire
  [key: string]: any;
}
const currentQuestion = ref<Question | null>(null);
const timeRemaining = ref(0);
const totalRounds = ref(10);
const currentRound = ref(0);
const userAnswer = ref('');
const hasAnswered = ref(false);
interface QuestionResults {
  correctAnswer: string;
  playerResults: Array<{
    playerId: string;
    username: string;
    answer: string;
    time: number;
    points: number;
    isCorrect: boolean;
  }>;
}

const questionResults = ref<QuestionResults | null>(null);

// Variables pour le statut des réponses des joueurs
const playerResponseStatus = ref<{ [playerId: string]: {
  status: string;
  points: number;
  time: number;
  isCorrect: boolean;
} }>({});
const rankNames = {
  0: "1er",
  1: "2ème",
  2: "3ème"
};

let timer: number | undefined = undefined;

// Ajouter cette fonction pour suivre qui a répondu
const playersWhoAnswered = ref(new Set());
const sortedPlayers = computed(() => {
  return [...players.value].sort((a, b) => 
    (playerScores.value[b.id] || 0) - (playerScores.value[a.id] || 0)
  );
});

// Ajouter avec les autres refs
const currentRoom = ref({
  host: '',
  code: '',
  players: [],
  status: 'waiting'
});


// Vérifie si l'utilisateur est authentifié
function checkAuthentication() {
  // Essayer d'abord le localStorage
  let authToken = localStorage.getItem('auth_token');
  
  // Si pas dans localStorage, essayer les cookies
  if (!authToken) {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
    if (authCookie) {
      authToken = authCookie.split('=')[1].trim();
    }
  }
  
  if (!authToken) {
    isAuthenticated.value = false;
    return false;
  }
  
  token.value = authToken;
  
  try {
    // Décoder le JWT pour obtenir le username
    const payload = JSON.parse(atob(authToken.split('.')[1]));
    if (payload.userName) {
      username.value = payload.userName;
      isAuthenticated.value = true;
      return true;
    }
  } catch (error) {
    console.error('Erreur lors du décodage du token JWT:', error);
  }
  
  isAuthenticated.value = false;
  return false;
}

// Redirige vers la page de connexion
function redirectToLogin() {
  router.push('/connexion');
}

// Fonction pour récupérer les pools de questions
async function fetchQuestionPools() {
  try {
    const token = localStorage.getItem('auth_token') || document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];
    
    if (!token) {
      console.error("Aucun token d'authentification trouvé");
      return;
    }

    const response = await fetch('http://83.195.188.17:3000/questionpool', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    questionPools.value = data;
    console.log("Pools de questions récupérés:", data);
  } catch (error) {
    console.error("Erreur lors de la récupération des pools de questions:", error);
  }
}

function getUserId(): string {
  return username.value || '';
}

function createRoom() {
  if (!isAuthenticated.value) {
    alert('Vous devez être connecté pour créer un salon');
    redirectToLogin();
    return;
  }

  ws.send(JSON.stringify({
    type: 'CREATE_ROOM',
    userId: getUserId(),
    username: getUserId() // Utilise le username du token
  }));
}

function joinRoom() {
  if (!isAuthenticated.value) {
    alert('Vous devez être connecté pour rejoindre un salon');
    redirectToLogin();
    return;
  }

  if (!inputRoomCode.value) return;

  ws.send(JSON.stringify({
    type: 'JOIN_ROOM',
    roomCode: inputRoomCode.value,
    userId: getUserId(),
    username: getUserId() // Utilise le username du token
  }));
}

function startGame() {
  if (isHost.value) {
    ws.send(JSON.stringify({
      type: 'START_GAME',
      roomCode: roomCode.value,
      themes: selectedPoolId.value ? [] : selectedThemes.value, // Si un pool est sélectionné, on ignore les thèmes
      poolId: selectedPoolId.value,
      totalRounds: totalRounds.value
    }));
  }
}

// Mettre à jour quand une réponse est soumise
function submitAnswer() {
  if (!hasAnswered.value && gameInProgress.value && currentQuestion.value) {
    hasAnswered.value = true;
    playersWhoAnswered.value.add(getUserId());
    
    ws.send(JSON.stringify({
      type: 'SUBMIT_ANSWER',
      roomCode: roomCode.value,
      userId: getUserId(),
      username: getUserId(),
      answer: userAnswer.value,
      timestamp: Date.now()
    }));
  }
}

// Fonction pour vérifier si un joueur a répondu
function playerAnswered(playerId : string): boolean {
  return playersWhoAnswered.value.has(playerId);
}

// Réinitialiser les joueurs qui ont répondu lors d'une nouvelle question
function resetPlayersAnswered() {
  playersWhoAnswered.value.clear();
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
      currentRoom.value = data.room;  // Ajoutez cette ligne
      break;
      
    case 'ROOM_JOINED':
      roomCode.value = data.room.code;
      players.value = data.room.players;
      isHost.value = data.room.host === getUserId();
      currentRoom.value = data.room;  // Ajoutez cette ligne
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
      currentRound.value = data.round;
      timeRemaining.value = data.timeLimit; // Utiliser la valeur envoyée par le serveur
      hasAnswered.value = false;
      userAnswer.value = '';
      questionResults.value = null;
      resetPlayersAnswered();
      
      // Clear any existing timer
      if (timer) {
        clearInterval(timer);
      }
      
      // Start timer - utilisez la variable globale sans "const"
      timer = setInterval(() => {
        updateTimer();
        if (timeRemaining.value <= 0) {
          clearInterval(timer);
        }
      }, 1000); // Une seconde
      break;
      
    case 'ROUND_ENDED':
      questionResults.value = data.results;
      playerScores.value = data.scores;
      
      // Mettez à jour le statut de réponse de chaque joueur
      playerResponseStatus.value = {};
      
      // Marquer les joueurs qui ont bien répondu avec leur rang
      data.results.playerResults.forEach((result: {
        playerId: string;
        username: string;
        answer: string;
        time: number;
        points: number;
        isCorrect: boolean;
      }) => {
        if (result.isCorrect) {
          const rank = data.results.playerResults
            .filter((r: { isCorrect: boolean }) => r.isCorrect)
            .sort((a: { time: number }, b: { time: number }) => Number(a.time) - Number(b.time))
            .findIndex((r: { playerId: string }) => r.playerId === result.playerId);
          
          playerResponseStatus.value[result.playerId] = {
            status: (rank >= 0 && rank <= 2) ? rankNames[rank as 0 | 1 | 2] : 'correct',
            points: result.points,
            time: result.time,
            isCorrect: true
          };
        } else {
          playerResponseStatus.value[result.playerId] = {
            status: 'incorrect',
            points: 0,
            time: result.time,
            isCorrect: false
          };
        }
      });
      break;
      
    case 'GAME_ENDED':
      gameInProgress.value = false;
      playerScores.value = data.finalScores;
      break;
    
    // Ajouter pour suivre les autres joueurs qui répondent
    case 'PLAYER_ANSWERED':
      playersWhoAnswered.value.add(data.playerId);
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

// Fetch themes on mount and check authentication
onMounted(() => {
  // Vérifie l'authentification au chargement du composant
  if (!checkAuthentication()) {
    redirectToLogin();
    return;
  }

  fetchThemes()
    .then((data) => {
      themes.value = data;
    })
    .catch((error) => {
      console.error("Error fetching themes:", error);
    });
  
  fetchQuestionPools();
});
</script>

<template>
  <div class="room">
    <!-- Affichage si non authentifié -->
    <div v-if="!isAuthenticated" class="auth-error">
      <h2>Authentification requise</h2>
      <p>Vous devez être connecté pour accéder aux parties multijoueur.</p>
      <button @click="redirectToLogin">Se connecter</button>
    </div>

    <!-- Lobby view when authenticated but not in a room -->
    <div v-else-if="!roomCode">
      <h2>Créer ou rejoindre un salon</h2>
      
      <div class="welcome-message">
        <p>Connecté en tant que <strong>{{ username }}</strong></p>
      </div>
      
      <h3>Créer un salon</h3>
      <button @click="createRoom">Créer un salon</button>
      
      <div>
        <h3>Rejoindre un salon</h3>
        <input v-model="inputRoomCode" placeholder="Code du salon">
        <button @click="joinRoom">Rejoindre</button>
      </div>
    </div>

    <!-- Room view (either waiting or in-game) -->
    <div v-else class="room-layout">
      <!-- Tableau de bord des joueurs - maintenant renommé "leaderboard" -->
      <div class="leaderboard">
        <h3>Joueurs</h3>
        <div class="player-list">
          <div v-for="player in sortedPlayers" :key="player.id" 
               class="player-card" 
               :class="{
                 'player-offline': player.status === 'offline',
                 'player-self': player.id === getUserId(),
                 'player-host': player.id === currentRoom.host
               }">
            
            <!-- Contenu du player-card inchangé -->
            <div class="player-header">
              <span class="status-dot" :class="player.status || 'online'"></span>
              <span class="player-name">{{ player.username }}</span>
              <span v-if="player.id === getUserId()" class="player-tag">(vous)</span>
              <span v-if="player.id === currentRoom.host" class="host-tag">[Host]</span>
            </div>
            
            <div class="player-score">
              {{ playerScores[player.id] || 0 }} pts
            </div>
            
            <div v-if="playerResponseStatus[player.id]" class="player-response"
                 :class="{
                   'response-correct': playerResponseStatus[player.id].isCorrect,
                   'response-incorrect': !playerResponseStatus[player.id].isCorrect,
                   'response-rank': ['1er', '2ème', '3ème'].includes(playerResponseStatus[player.id].status)
                 }">
              <div class="response-status">
                {{ playerResponseStatus[player.id].status }}
              </div>
              <div v-if="playerResponseStatus[player.id].isCorrect" class="response-time">
                {{ playerResponseStatus[player.id].time }}s
              </div>
            </div>
            
            <div v-else-if="gameInProgress && currentQuestion" class="player-answering">
              <span v-if="player.id === getUserId()">
                {{ hasAnswered ? '✓ Répondu' : 'En attente...' }}
              </span>
              <span v-else>
                {{ playerAnswered(player.id) ? '✓ A répondu' : 'En attente...' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenu principal (waiting room ou gameplay) -->
      <div class="main-content">
        <!-- Waiting room view -->
        <div v-if="!gameInProgress">
          <h2>Salon: {{ roomCode }}</h2>
          <!-- Reste du contenu de la salle d'attente -->
          <div class="players">
            <h3>Joueurs</h3>
            <ul>
              <li v-for="player in players" :key="player.id">
                {{ player.username }}
              </li>
            </ul>
          </div>

          <div v-if="isHost" class="game-setup">
            <div class="selection-option">
              <h3>Sélectionner une option:</h3>
              <div class="options-toggle">
                <button :class="{ active: !selectedPoolId }" @click="selectedPoolId = undefined">
                  Sélection par thèmes
                </button>
                <button :class="{ active: selectedPoolId }" @click="selectedPoolId = questionPools.length > 0 ? questionPools[0].id : undefined">
                  Utiliser un pool de questions
                </button>
              </div>
            </div>

            <!-- Sélection par thèmes -->
            <div v-if="!selectedPoolId" class="themes">
              <h3>Sélection des thèmes</h3>
              <select multiple v-model="selectedThemes" class="select-multiple">
                <option v-for="theme in themes" :key="theme">
                  {{ theme }}
                </option>
              </select>
            </div>

            <!-- Sélection par pool de questions -->
            <div v-else class="question-pool">
              <h3>Sélection d'un pool de questions</h3>
              <select v-model="selectedPoolId" class="select-single">
                <option v-for="pool in questionPools" :key="pool.id" :value="pool.id">
                  {{ pool.name }} ({{ pool.question_count }} questions)
                </option>
              </select>
              
              <div v-if="selectedPoolId && questionPools.length > 0" class="pool-info">
                <h4>Description du pool:</h4>
                <p>{{ questionPools.find(p => p.id === selectedPoolId)?.description || 'Aucune description disponible' }}</p>
                <p><strong>Créé par:</strong> {{ questionPools.find(p => p.id === selectedPoolId)?.created_by || 'Utilisateur inconnu' }}</p>
              </div>
            </div>
            
            <div class="game-options">
              <label for="rounds">Nombre de questions:</label>
              <input type="number" id="rounds" v-model="totalRounds" min="5" max="20">
            </div>
            
            <button @click="startGame" 
              :disabled="!!((!selectedPoolId && selectedThemes.length === 0) || 
                       (selectedPoolId && !questionPools.find(p => p.id === selectedPoolId)))" 
              class="start-button">
              Démarrer la partie
            </button>
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
          <!-- <div class="scoreboard">
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
          </div> -->
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
  background-color: #080808;
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
  background-color: #010f07;
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

/* Nouveaux styles pour la sélection de pool */
.game-setup {
  background-color: #0a0a0a;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.selection-option {
  margin-bottom: 20px;
}

.options-toggle {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.options-toggle button {
  padding: 10px 15px;
  border: none;
  background-color: #222;
  color: #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.options-toggle button.active {
  background-color: #2c6e49;
  color: white;
}

.select-multiple, .select-single {
  width: 100%;
  padding: 10px;
  background-color: #121212;
  color: #fff;
  border: 1px solid #333;
  border-radius: 4px;
}

.select-multiple {
  min-height: 150px;
}

.pool-info {
  margin-top: 15px;
  padding: 10px;
  background-color: #121212;
  border-radius: 4px;
  border-left: 3px solid #2c6e49;
}

.start-button {
  background-color: #2c6e49;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
}

.start-button:disabled {
  background-color: #444;
  cursor: not-allowed;
}

/* Styles pour le message de bienvenue */
.welcome-message {
  background-color: #2c6e49;
  border-radius: 4px;
  padding: 10px 15px;
  margin-bottom: 20px;
  text-align: center;
}

/* Styles pour l'affichage d'erreur d'authentification */
.auth-error {
  background-color: #ffe9e9;
  border: 1px solid #ff5555;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin: 40px auto;
  max-width: 500px;
}

.auth-error button {
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 15px;
}

/* Nouvelle mise en page responsive */
.room-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Styles pour le leaderboard (nouveau nom pour player-dashboard) */
.leaderboard {
  background: #080706;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.main-content {
  flex: 1;
}

/* Media query pour l'affichage desktop */
@media (min-width: 1024px) {
  .room {
    max-width: 1200px; /* Plus large pour accommoder la mise en page en colonnes */
  }
  
  .room-layout {
    flex-direction: row; /* Disposer en colonnes sur desktop */
    align-items: flex-start;
  }
  
  .leaderboard {
    position: sticky;
    top: 20px; /* Reste visible lors du défilement */
    width: 280px; /* Largeur fixe */
    margin-right: 20px;
    align-self: flex-start;
  }
  
  .main-content {
    flex: 1;
  }
  
  .player-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

/* Adaptations pour dark mode */
.leaderboard {
  background: #080706;
  color: #e0e0e0;
}

.player-card {
  background: #121212;
  color: #e0e0e0;
  border-color: #333;
}

.player-self {
  background: #0d1b29;
}

.response-correct {
  background-color: rgba(76, 175, 80, 0.2);
  color: #81c784;
}

.response-incorrect {
  background-color: rgba(244, 67, 54, 0.2);
  color: #e57373;
}

.response-rank {
  background-color: rgba(255, 193, 7, 0.2);
  color: #ffd54f;
}

.player-answering {
  color: #aaaaaa;
}

.player-tag, .host-tag {
  color: #9e9e9e;
}

.host-tag {
  color: #ffb74d;
}

/* Garder les autres styles de player-dashboard déjà définis */
</style>