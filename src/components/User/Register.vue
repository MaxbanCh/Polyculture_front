<script setup lang="ts">
import { ref } from 'vue';
// Importez les fonctions d'authentification
import { setAuthToken } from '../../utils/auth';

console.log("Hello from Register!");

const errorMessage = ref("");

async function register() {
    let username = ((document.getElementById("usernameRegister") as HTMLInputElement)?.value ?? "");
    let password = (document.getElementById("passwordRegister") as HTMLInputElement)?.value ?? "";

    if (!username || !password) {
        errorMessage.value = "Veuillez remplir tous les champs";
        return;
    }

    try {
        const response = await fetch("https://polyculture-back.cluster-ig3.igpolytech.fr/register", {
            method: "POST",
            mode: "cors",
            credentials: "include", // Important pour les cookies cross-site
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: username, password: password })
        });

        if (response.ok) {
            console.log("Register successful");
            const data = await response.json();
            
            // Utilisation de la fonction utilitaire pour définir le token
            setAuthToken(data.auth_token);
            
            window.location.href = '/'; // Redirection vers la page d'accueil
        } else {
            const errorData = await response.json();
            errorMessage.value = errorData.error || "Erreur lors de l'inscription";
        }
    } catch (error) {
        console.error("There has been a problem with your fetch operation:", error);
        errorMessage.value = "Erreur de connexion au serveur";
    }
}
</script>

<template>
    <div class="register-container">
        <h2>Inscription</h2>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div class="form-group">
            <label for="usernameRegister">Nom d'utilisateur :</label>
            <input type="text" name="UsernameRegister" id="usernameRegister">
        </div>
        <div class="form-group">
            <label for="passwordRegister">Mot de passe :</label>
            <input type="password" name="PasswordRegister" id="passwordRegister">
        </div>
        <button id="register" @click="register()">S'inscrire</button>
    </div>
</template>

<style scoped>
.register-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
}

.form-group input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

button {
    padding: 10px 15px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #45a049;
}

.error-message {
    color: red;
    margin-bottom: 15px;
}
</style>