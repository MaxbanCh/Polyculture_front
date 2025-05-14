<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

let username = ref("");
let score = ref(0);
let nbGames = ref(0);
let nbWins = ref(0);
let nbDefis = ref(0);
let nbDefisGagnes = ref(0);

let isAdminvar = ref(false);

function logout() {
   const token = localStorage.getItem('auth_token');
    
    // 1. Envoi d'une requête au serveur pour invalider le token
    fetch("http://83.195.188.17:3000/logout", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        }
    })
    .then(response => {
        if (response.ok) {
            console.log("Logout successful on server");
        } else {
            console.error("Server logout failed");
        }
        
        // 2. Suppression du token du localStorage
        localStorage.removeItem('auth_token');
        
        // 3. Suppression du cookie auth_token
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict;";
        
        // 4. Redirection vers la page d'accueil
        window.location.href = '/';
    })
    .catch(error => {
        console.error("Error during logout:", error);
        // En cas d'erreur, on déconnecte quand même côté client
        localStorage.removeItem('auth_token');
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict;";
        window.location.href = '/';
    });
}

// async function fetchUserData() {
//     const token = localStorage.getItem('auth_token');
//     if (!token) {
//         console.error("No token found");
//         return;
//     }

//     try {
//         const response = await fetch("http://89.195.188.17:3000/profil", {
//             method: "GET",
//             mode: "cors",
//             credentials: "include",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${token}`,
//             },
//         });
//         if (response.ok) {
//             const data = await response.json();
//             console.log("User data fetched successfully", data);
//             username.value = data.username;
//             score.value = data.score;
//             nbGames.value = data.nbGames;
//             nbWins.value = data.nbWins;
//             nbDefis.value = data.nbDefis;
//             nbDefisGagnes.value = data.nbDefisGagnes;
//         } else {
//             console.error("Failed to fetch user data");
//         }
//     } catch (error) {
//         console.error("Error fetching user data:", error);
//     }
// }

async function isAdmin() {
    const token = localStorage.getItem('auth_token');
    await fetch("http://83.195.188.17:3000/admin", {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    })
    .then((response) => {
        if (response.status === 200) {
            isAdminvar.value = true;
            return response.json();
        } else {
            console.error("Failed to fetch user data");
            return false;
        }
    })
}

function redirectAdmin() {
    if (isAdminvar.value) {
        router.push('/admin');
    } else {
        alert("Vous n'avez pas accès à cette page");
    }
}

async function checkAuthStatus() {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    console.log("Token absent, déconnexion automatique");
    router.push('/login');
    return;
  }

  try {
    const response = await fetch("http://83.195.188.17:3000/check-token", {
      method: "GET",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.log("Token invalide ou expiré, déconnexion automatique");
      // Suppression du token et du cookie
      localStorage.removeItem('auth_token');
      document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict;";
      window.location.href = '/login';
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
  }
}

onMounted(() => {
    checkAuthStatus();
    isAdmin();
});
</script>



<template>
    <h1>Profil</h1>
    <div id="profil">
        <h2>Mes informations</h2>
        <p id="username">Nom d'utilisateur : {{ username }}</p>
    </div>


    <div id="stats">
        <h2>Mes statistiques</h2>
        <p id="score">Score : {{ score }}</p>
        <p id="nbGames">Nombre de jeux : {{ nbGames }}</p>
        <p id="nbWins">Nombre de victoires : {{ nbWins }}</p>
        <p id="nbDefis">Nombre de défis : {{ nbDefis }}</p>
        <p id="nbDefisGagnes">Nombre de défis gagnés : {{ nbDefisGagnes }}</p>
    </div>

    <div id="admin">
        <h2>Admin</h2>
        <div id="admin" v-if="isAdminvar">
            <button @click="redirectAdmin()">Accéder à la page admin</button>
            <p>Vous êtes administrateur</p>
        </div>
        <p v-else>Vous n'êtes pas administrateur</p>
    </div>

    <button id="logout" @click="logout()">Logout</button>
    

</template>