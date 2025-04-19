<script setup lang="ts">
import ws from '../../utils/websocket.ts'
console.log("Hello from Profil!")

import { useRouter } from 'vue-router'; // Importer useRouter
const router = useRouter(); // Initialiser le routeur

async function logout() {
    fetch("http://localhost:3000/logout", {
        method: "POST",
        mode : "cors",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(async (response) => {
        if (response.ok) {
            console.log("Logout successful");
            localStorage.removeItem('auth_token');
            window.location.href = '/'; // Rediriger vers la page d'accueil
            // router.push('/'); // Utiliser le routeur pour rediriger vers la page d'accueil
        }
    })
    .catch((error) => {
        console.error("There has been a problem with your fetch operation:", error);
    });
}



<\script setup>