<script setup lang="ts">
    import { ref, onMounted } from 'vue';

    interface Player {
        pseudo: string;
        score: number;
    }
    
    const players = ref<Player[]>([]);

    // Récupère le classement des joueurs
    async function fetchClassement() {
        try {
            const response = await fetch('https://polyculture-back.axithem.fr/classement', {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            players.value = data;
        } catch (error) {
            console.error('Erreur lors de la récupération du classement:', error);
        }
    }
    // Appel la fonction de récupération du classement lors du montage du composant
    onMounted(() => {
        fetchClassement();
    });
</script>

<template>
    <div id="classement">
        <h2>Classement</h2>
        <table>
            <thead>
                <tr>
                    <th>Position</th>
                    <th>Pseudo</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody>
                <!-- Remplacez les données par celles de votre API -->
                <tr v-for="(player, index) in players" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ player.pseudo }}</td>
                    <td>{{ player.score }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>