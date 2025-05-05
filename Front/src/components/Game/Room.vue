// Front/src/components/Game/Room.vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import ws from '../../utils/websocket';

const roomCode = ref('');
const players = ref([]);
const selectedThemes = ref([]);
const isHost = ref(false);

function createRoom() {
  ws.send(JSON.stringify({
    type: 'CREATE_ROOM',
    userId: getCurrentUserId(),
    username: getCurrentUsername()
  }));
}

function joinRoom() {
  ws.send(JSON.stringify({
    type: 'JOIN_ROOM',
    roomCode: roomCode.value,
    userId: getCurrentUserId(),
    username: getCurrentUsername()
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
    case 'PLAYER_JOINED':
      players.value = data.players;
      break;
  }
};
</script>

<template>
  <div class="room">
    <div v-if="!roomCode">
      <button @click="createRoom">Créer un salon</button>
      <div>
        <input v-model="roomCode" placeholder="Code du salon">
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
          <option v-for="theme in availableThemes" :key="theme">
            {{ theme }}
          </option>
        </select>
        <button @click="startGame">Démarrer la partie</button>
      </div>
    </div>
  </div>
</template>