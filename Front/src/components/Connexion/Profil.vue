<script setup lang="ts">
import { ref, onMounted } from 'vue';
// // import ws from '../../utils/websocket.ts'
// console.log("Hello from Profil!")

// import { useRouter } from 'vue-router'; // Importer useRouter
// // const router = useRouter(); // Initialiser le routeur

let username = ref("");
let score = ref(0);
let nbGames = ref(0);
let nbWins = ref(0);
let nbDefis = ref(0);
let nbDefisGagnes = ref(0);



function logout() {
    console.log("Logout successful");
    localStorage.removeItem('auth_token');
    window.location.href = '/'; // Rediriger vers la page d'accueil
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
    await fetch("http://89.195.188.17:3000/profil", {
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
            return response.json();
        } else {
            console.error("Failed to fetch user data");
            return false;
        }
    })
}
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
        <p v-if="isAdmin">Vous êtes administrateur</p>
        <p v-else>Vous n'êtes pas administrateur</p>
    </div>

    <button id="logout" @click="logout()">Logout</button>
</template>