<script setup lang="ts">
    import { ref, onMounted } from "vue";
    import ManageQuestion from './ManageQuestion.vue';


    let wait = ref(true);
    let isAdmin = ref(false);
    let errorMessage = ref("");

    async function checkAdminAccess() {                        
        try {
            const response = await fetch("https://polyculture-back.cluster-ig3.igpolytech.fr/admin", {
                method: "GET",
                mode: "cors",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            
            if (response.status === 200) {
                // L'utilisateur est un administrateur
                isAdmin.value = true;
                wait.value = false;
            } else if (response.status === 403) {
                // L'utilisateur est connecté mais n'a pas les droits admin
                errorMessage.value = "Vous n'avez pas les droits d'administrateur";
                wait.value = false;
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else if (response.status === 401) {
                // Token invalide ou expiré
                errorMessage.value = "Session expirée, veuillez vous reconnecter";
                wait.value = false;
                // Supprimer le token et le cookie
                localStorage.removeItem('auth_token');
                document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict;";
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                // Autre erreur
                errorMessage.value = "Une erreur est survenue";
                wait.value = false;
            }
        } catch (error) {
            console.error("Erreur lors de la vérification des droits admin:", error);
            errorMessage.value = "Erreur de connexion au serveur";
            wait.value = false;
        }
    }

    onMounted(() => {
        checkAdminAccess();
    });
</script>

<template>
    <div id="admin">
        <div v-if="wait">
            <p>Vérification des droits d'accès...</p>
        </div>
        <div v-else-if="!isAdmin">
            <h2>Accès refusé</h2>
            <p>{{ errorMessage }}</p>
        </div>
        <div v-else>
            <h1>Panneau d'administration</h1>
            <ManageQuestion />
        </div>
    </div>
</template>