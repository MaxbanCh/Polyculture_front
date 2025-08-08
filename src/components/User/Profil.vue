<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

let username = ref("");

function profil() {
    const token = localStorage.getItem('auth_token');
    
    fetch("https://polyculture-back.axithem.fr/profil", {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Failed to fetch user data");
        }
    })
    .then(data => {
        username.value = data.userName;
    })
    .catch(error => {
        console.error("Error fetching profile:", error);
    });
}

let isAdminvar = ref(false);

function logout() {
   const token = localStorage.getItem('auth_token');
    
    // 1. Envoi d'une requête au serveur pour invalider le token
    fetch("https://polyculture-back.axithem.fr/logout", {
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

async function isAdmin() {
    const token = localStorage.getItem('auth_token');
    await fetch("https://polyculture-back.axithem.fr/admin", {
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
    router.push('/connexion');
    return;
  }

  try {
    const response = await fetch("https://polyculture-back.axithem.fr/check-token", {
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
      window.location.href = '/connexion';
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
  }
}

onMounted(() => {
    checkAuthStatus();
    profil();
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
        Bientot...
    </div>

    <div id="admin">
        <div id="admin" v-if="isAdminvar">
            <h2>Admin</h2>
            <button @click="redirectAdmin()">Accéder à la page admin</button>
            <p>Vous êtes administrateur</p>
        </div>
    </div>

    <button id="logout" @click="logout()">Logout</button>
    

</template>
