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
      themes: selectedThemes.value
    }));
  }
}

// Gestion des messages WebSocket
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case 'ROOM_CREATED':
      roomCode.value = data.room.code;
      isHost.value = true;
      break;
    case 'ROOM_JOINED':
      console.log('Room joined:', data);
      roomCode.value = data.room.code;
      isHost.value = false;
      break;

    case 'PLAYER_JOINED':
      players.value = data.players;
      break;
  }
};
</script>

<template>
  <div class="room">
    <div v-if="!roomCode">
      <input id="username" placeholder="Nom d'utilisateur">
      <button @click="createRoom">Créer un salon</button>
      <div>
        <input v-model="inputRoomCode" placeholder="Code du salon">
        <button @click="joinRoom">Rejoindre</button>
      </div>
    </div>

    <div v-else>
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
        <button @click="startGame">Démarrer la partie</button>
      </div>
    </div>
  </div>
</template>