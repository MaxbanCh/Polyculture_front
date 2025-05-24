<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import ws from '../../../utils/websocket';

const router = useRouter();
const isAuthenticated = ref(false);
const username = ref('');

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

function pressBuzzer() {
  if (!isAuthenticated.value) {
    alert('Vous devez être connecté pour utiliser le buzzer');
    redirectToLogin();
    return;
  }
  
  ws.send(JSON.stringify({
    type: "buzz",
    data: {
      name: username.value
    }
  }));
  return;
}

function priority(event) {
  console.log("Buzzer pressed");
  const buzz = JSON.parse(event.data);
  console.log(`pressed by : ${buzz.owner}`);
  const light = document.getElementById("light");
  if (light) {
    light.textContent = `La main est à : ${buzz.owner}`;
    if (buzz.owner === username.value) {
      light.style.backgroundColor = "green";
    } else {
      light.style.backgroundColor = "red";
    }
    light.style.width = "80%";
    light.style.height = "40%";
  }

  return;
}

onMounted(() => {
  // Vérifie l'authentification au chargement du composant
  if (!checkAuthentication()) {
    alert('Vous devez être connecté pour utiliser le buzzer');
    redirectToLogin();
    return;
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === "Space") {
      pressBuzzer();
    }
  };

  document.addEventListener("keydown", handleKeyDown);

  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });
});

ws.onmessage = function(event) {
  const buzz = JSON.parse(event.data);
  if (buzz.type === "buzz") {
    priority(event);
  }
}
</script>

<template>
  <div class="buzzer-container">
    <!-- Affichage si non authentifié -->
    <div v-if="!isAuthenticated" class="auth-error">
      <h2>Authentification requise</h2>
      <p>Vous devez être connecté pour utiliser le buzzer.</p>
      <button @click="redirectToLogin">Se connecter</button>
    </div>

    <div v-else>
      <div class="welcome-message">
        <p>Connecté en tant que <strong>{{ username }}</strong></p>
      </div>

      <button id="Buzz" @click="pressBuzzer()">Appuyer pour buzzer</button>
      <div id="light"></div>
    </div>
  </div>
</template>

<style scoped>
.buzzer-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

/* #Buzz {
  background-color: #e74c3c;
  color: white;
  font-size: 24px;
  padding: 20px 40px;
  border-radius: 50%;
  width: 200px;
  height: 200px;
  border: none;
  box-shadow: 0 6px #c0392b;
  cursor: pointer;
  margin-bottom: 30px;
  transition: all 0.2s;
} */

#Buzz:active {
  box-shadow: 0 2px #c0392b;
  transform: translateY(4px);
}

#light {
  margin: 20px auto;
  padding: 20px;
  border-radius: 8px;
  font-size: 20px;
  font-weight: bold;
  color: white;
  transition: all 0.3s;
}

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

.welcome-message {
  background-color: #2c6e49;
  border-radius: 4px;
  padding: 10px 15px;
  margin-bottom: 20px;
  text-align: center;
}
</style>