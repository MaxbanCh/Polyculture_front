<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import fetchThemes from ../themes.ts

// Connexion WebSocket
const ws = new WebSocket(`wss://polyculture-back.cluster-ig3.igpolytech.fr/BuzzerRoom`);

// Authentification
const isAuthenticated = ref(false);
const username = ref('');
const token = ref('');

// Room state
const roomCode = ref('');
const inputRoomCode = ref('');
const players = ref<Player[]>([]);
const isHost = ref(false);
const router = useRouter();

// Buzzer state
const activeBuzzer = ref<string | null>(null);
// const questionData = ref<Question | null>(null);
const showAnswer = ref(false);
const playerScores = ref<Record<string, number>>({});
const loadingQuestion = ref(false);

// Questions
const currentQuestion = ref<Question | null>(null);
const selectedTheme = ref<string | null>(null);
const themes = ref<string[]>([]);

interface Player {
  id: string;
  username: string;
  status?: string;
}

interface Question {
  id: string;
  question: string;
  answer: string;
  theme: string;
}

// Computed pour trier les joueurs par score
const sortedPlayers = computed(() => {
  return [...players.value].sort((a, b) => 
    (playerScores.value[b.id] || 0) - (playerScores.value[a.id] || 0)
  );
});

// Vérification d'authentification
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

function getUserId(): string {
  return username.value || '';
}

function createRoom() {
  if (!isAuthenticated.value) {
    alert('Vous devez être connecté pour créer une salle');
    redirectToLogin();
    return;
  }

  ws.send(JSON.stringify({
    type: 'CREATE_BUZZER_ROOM',
    userId: getUserId(),
    username: getUserId() 
  }));
}

function joinRoom() {
  if (!isAuthenticated.value) {
    alert('Vous devez être connecté pour rejoindre une salle');
    redirectToLogin();
    return;
  }

  if (!inputRoomCode.value) return;

  ws.send(JSON.stringify({
    type: 'JOIN_BUZZER_ROOM',
    roomCode: inputRoomCode.value,
    userId: getUserId(),
    username: getUserId()
  }));
}

function pressBuzzer() {
  if (!activeBuzzer.value) {
    ws.send(JSON.stringify({
      type: 'PRESS_BUZZER',
      roomCode: roomCode.value,
      userId: getUserId(),
      username: getUserId(),
      timestamp: Date.now()
    }));
  }
}

function resetBuzzer() {
  if (isHost.value) {
    ws.send(JSON.stringify({
      type: 'RESET_BUZZER',
      roomCode: roomCode.value
    }));
  }
}

function awardPoints(playerId: string, points: number = 1) {
  if (isHost.value) {
    ws.send(JSON.stringify({
      type: 'AWARD_POINTS',
      roomCode: roomCode.value,
      playerId: playerId,
      points: points
    }));
  }
}

function getRandomQuestion() {
  if (isHost.value && !loadingQuestion.value) {
    loadingQuestion.value = true;
    
    const url = new URL("https://polyculture-back.cluster-ig3.igpolytech.fr/randomquestion");
    if (selectedTheme.value) {
      url.searchParams.append("theme", selectedTheme.value);
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
      loadingQuestion.value = false;
      if (response.ok) {
        const data = await response.json();
        currentQuestion.value = data;
        showAnswer.value = false;
      } else {
        console.error("Error fetching question");
      }
    })
    .catch((error) => {
      loadingQuestion.value = false;
      console.error("Error fetching question:", error);
    });
  }
}

function toggleAnswer() {
  showAnswer.value = !showAnswer.value;
}

// WebSocket message handler
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
      playerScores.value = data.room.scores || {};
      break;
      
    case 'PLAYER_JOINED':
      players.value = data.players;
      break;
      
    case 'PLAYER_LEFT':
      players.value = data.players;
      if (data.newHost === getUserId()) {
        isHost.value = true;
      }
      break;
      
    case 'BUZZER_PRESSED':
      activeBuzzer.value = data.playerId;
      break;
      
    case 'BUZZER_RESET':
      activeBuzzer.value = null;
      break;
      
    case 'POINTS_UPDATED':
      playerScores.value = data.scores;
      break;
      
    case 'ERROR':
      alert(data.message);
      break;
  }
};

// Clean up on component unmount
onUnmounted(() => {
  if (roomCode.value) {
    ws.send(JSON.stringify({
      type: 'LEAVE_BUZZER_ROOM',
      roomCode: roomCode.value,
      userId: getUserId(),
    }));
  }
});

// Fetch themes and check authentication on mount
onMounted(() => {
  // Vérifie l'authentification au chargement du composant
  if (!checkAuthentication()) {
    redirectToLogin();
    return;
  }

  fetchThemes()
        .then((data) => {
            themes.value = data; // Store the themes in the ref
        })
        .catch((error) => {
            console.error("Error fetching themes:", error);
        });});
</script>

<template>
  <div class="buzzer-room">
    <!-- Affichage si non authentifié -->
    <div v-if="!isAuthenticated" class="auth-error">
      <h2>Authentification requise</h2>
      <p>Vous devez être connecté pour accéder aux salles de buzzer.</p>
      <button @click="redirectToLogin">Se connecter</button>
    </div>

    <!-- Lobby view when authenticated but not in a room -->
    <div v-else-if="!roomCode">
      <h2>Créer ou rejoindre une salle de buzzer</h2>
      
      <div class="welcome-message">
        <p>Connecté en tant que <strong>{{ username }}</strong></p>
      </div>
      
      <div class="room-actions">
        <div class="create-room">
          <h3>Créer une salle</h3>
          <button @click="createRoom">Créer une salle</button>
        </div>
        
        <div class="join-room">
          <h3>Rejoindre une salle</h3>
          <input v-model="inputRoomCode" placeholder="Code de la salle">
          <button @click="joinRoom">Rejoindre</button>
        </div>
      </div>
    </div>

    <!-- Room view -->
    <div v-else class="room-layout">
      <!-- Tableau de bord des joueurs -->
      <div class="leaderboard">
        <h3>Joueurs</h3>
        <div class="player-list">
          <div v-for="player in sortedPlayers" :key="player.id" 
               class="player-card" 
               :class="{
                 'player-offline': player.status === 'offline',
                 'player-self': player.id === getUserId(),
                 'player-active': player.id === activeBuzzer,
                 'player-host': player.id === getUserId() && isHost
               }">
            
            <div class="player-header">
              <span class="status-dot" :class="player.status || 'online'"></span>
              <span class="player-name">{{ player.username }}</span>
              <span v-if="player.id === getUserId()" class="player-tag">(vous)</span>
              <span v-if="player.id === activeBuzzer" class="active-tag">🔔</span>
              <span v-if="isHost && player.id === getUserId()" class="host-tag">[Host]</span>
            </div>
            
            <div class="player-score">
              {{ playerScores[player.id] || 0 }} pts
            </div>
            
            <!-- Points controls for host -->
            <div v-if="isHost && player.id !== getUserId()" class="host-controls">
              <button @click="awardPoints(player.id, 1)" class="award-btn">+1</button>
              <button @click="awardPoints(player.id, -1)" class="remove-btn">-1</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="main-content">
        <h2>Salle: {{ roomCode }}</h2>

        <!-- Host Controls -->
        <div v-if="isHost" class="host-panel">
          <h3>Contrôles de l'hôte</h3>
          
          <div class="question-controls">
            <h4>Questions</h4>
            <div class="theme-selection">
              <label for="theme-select">Thème:</label>
              <select id="theme-select" v-model="selectedTheme">
                <option value="">Tous les thèmes</option>
                <option v-for="theme in themes" :key="theme" :value="theme">
                  {{ theme }}
                </option>
              </select>
            </div>
            
            <button @click="getRandomQuestion" :disabled="loadingQuestion">
              {{ loadingQuestion ? 'Chargement...' : 'Obtenir une question' }}
            </button>
          </div>
          
          <div v-if="currentQuestion" class="question-display">
            <div class="question-theme">Thème: {{ currentQuestion.theme }}</div>
            <div class="question-text">{{ currentQuestion.question }}</div>
            
            <div class="answer-section">
              <button @click="toggleAnswer">
                {{ showAnswer ? 'Masquer la réponse' : 'Afficher la réponse' }}
              </button>
              <div v-if="showAnswer" class="answer">
                <strong>Réponse:</strong> {{ currentQuestion.answer }}
              </div>
            </div>
          </div>
          
          <div class="buzzer-controls">
            <h4>Buzzer</h4>
            <button @click="resetBuzzer" :disabled="!activeBuzzer">
              Réinitialiser le buzzer
            </button>
          </div>
        </div>

        <!-- Player View -->
        <div v-else class="player-panel">
          <h3>Appuyez sur le buzzer pour répondre</h3>
          
          <div class="buzzer-status" v-if="activeBuzzer">
            <p v-if="activeBuzzer === getUserId()">
              <strong>C'est à vous de répondre!</strong>
            </p>
            <p v-else>
              <strong>{{ players.find(p => p.id === activeBuzzer)?.username || 'Un joueur' }} a le buzzer</strong>
            </p>
          </div>
          
          <button 
            class="buzzer-button" 
            @click="pressBuzzer" 
            :disabled="!!activeBuzzer"
            :class="{ 'active': activeBuzzer === getUserId() }">
            BUZZER
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.buzzer-room {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.room-actions {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.create-room, .join-room {
  flex: 1;
  padding: 15px;
  background-color: #080808;
  border-radius: 8px;
}

.join-room input {
  display: block;
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #121212;
  color: white;
}

.room-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.leaderboard {
  background: #080706;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.player-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #121212;
  border-radius: 6px;
  border-left: 4px solid #444;
}

.player-self {
  border-left-color: #2196F3;
  background-color: #0d1b29;
}

.player-active {
  border-left-color: #FFC107;
  background-color: #332d19;
}

.player-offline {
  opacity: 0.6;
}

.player-host {
  border-left-color: #4CAF50;
}

.host-controls {
  display: flex;
  gap: 5px;
}

.award-btn, .remove-btn {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.award-btn {
  background-color: #4CAF50;
  color: white;
}

.remove-btn {
  background-color: #F44336;
  color: white;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  background-color: #4CAF50;
}

.status-dot.offline {
  background-color: #9e9e9e;
}

.player-tag, .host-tag, .active-tag {
  margin-left: 6px;
  font-size: 0.8rem;
}

.host-tag {
  color: #ffb74d;
}

.active-tag {
  color: #FFC107;
  font-size: 1.2rem;
}

/* Host panel */
.host-panel {
  background-color: #080808;
  border-radius: 8px;
  padding: 15px;
}

.question-controls, .buzzer-controls {
  margin-bottom: 20px;
}

.theme-selection {
  margin-bottom: 10px;
}

.theme-selection select {
  width: 100%;
  padding: 8px;
  background-color: #121212;
  color: white;
  border: 1px solid #333;
  border-radius: 4px;
}

.question-display {
  background-color: #121212;
  padding: 15px;
  border-radius: 6px;
  margin: 15px 0;
}

.question-theme {
  color: #7f8c8d;
  margin-bottom: 10px;
}

.question-text {
  font-size: 1.3rem;
  margin-bottom: 15px;
}

.answer-section {
  margin-top: 15px;
}

.answer {
  margin-top: 10px;
  padding: 10px;
  background-color: #1e1e1e;
  border-radius: 4px;
}

/* Player panel */
.player-panel {
  text-align: center;
  padding: 20px;
}

.buzzer-button {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  font-size: 26px;
  font-weight: bold;
  background-color: #F44336;
  color: white;
  border: none;
  box-shadow: 0 6px 10px rgba(0,0,0,0.3);
  margin: 20px 0;
  cursor: pointer;
  transition: all 0.2s;
}

.buzzer-button:hover:not(:disabled) {
  transform: scale(1.05);
}

.buzzer-button:active:not(:disabled) {
  transform: scale(0.95);
  box-shadow: 0 3px 5px rgba(0,0,0,0.3);
}

.buzzer-button:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.buzzer-button.active {
  background-color: #4CAF50;
  animation: pulse 1.5s infinite;
}

.buzzer-status {
  min-height: 30px;
  margin-bottom: 15px;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
}

@media (min-width: 768px) {
  .room-layout {
    flex-direction: row;
  }
  
  .leaderboard {
    width: 30%;
  }
  
  .main-content {
    flex: 1;
  }
}

.auth-error {
  background-color: #ffe9e9;
  border: 1px solid #ff5555;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin: 40px auto;
  max-width: 500px;
  color: #333;
}

.welcome-message {
  background-color: #2c6e49;
  border-radius: 4px;
  padding: 10px 15px;
  margin-bottom: 20px;
  text-align: center;
}

button {
  padding: 8px 16px;
  background-color: #2c6e49;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:disabled {
  background-color: #555;
  cursor: not-allowed;
}
</style>