<script setup lang="ts">
import { ref } from 'vue';

const errorMessage = ref("");

async function register() {
    let username = ((document.getElementById("usernameRegister") as HTMLInputElement)?.value ?? "").trim();
    let password = (document.getElementById("passwordRegister") as HTMLInputElement)?.value ?? "";

    // Frontend validation
    if (!username || !password) {
        errorMessage.value = "Veuillez remplir tous les champs";
        return;
    }
    
    // Username validation (3-50 chars, only alphanumeric and _.-) 
    if (username.length < 3 || username.length > 50) {
        errorMessage.value = "Le nom d'utilisateur doit contenir entre 3 et 50 caractères";
        return;
    }
    
    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usernameRegex.test(username)) {
        errorMessage.value = "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres et les caractères _ . -";
        return;
    }
    
    // Password validation (at least 8 chars)
    if (password.length < 8) {
        errorMessage.value = "Le mot de passe doit contenir au moins 8 caractères";
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
            
            window.location.href = '/'; // Redirection vers la page d'accueil
        } else {
            const errorData = await response.json();
            
            // More descriptive error messages based on server response
            switch(response.status) {
                case 400:
                    // Format validation errors
                    errorMessage.value = errorData.error || "Format de nom d'utilisateur ou mot de passe invalide";
                    break;
                case 409:
                    // Conflict - username already exists
                    errorMessage.value = "Ce nom d'utilisateur est déjà utilisé";
                    break;
                case 500:
                    errorMessage.value = "Erreur serveur, veuillez réessayer plus tard";
                    break;
                default:
                    errorMessage.value = errorData.error || "Erreur lors de l'inscription";
            }
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
        
        <!-- Improved error display -->
        <div v-if="errorMessage" class="error-message">
            <i class="error-icon">⚠️</i>
            <span>{{ errorMessage }}</span>
        </div>
        
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
    background-color: #ffebee;
    color: #d32f2f;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
    border-left: 4px solid #d32f2f;
    display: flex;
    align-items: center;
}

.error-icon {
    margin-right: 10px;
    font-size: 1.2em;
}
</style>