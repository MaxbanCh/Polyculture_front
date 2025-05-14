<script setup lang="ts">
import ws from '../../utils/websocket.ts'


</script>

<template>
    <input type="text" id="pseudo" placeholder="Pseudo" />

    <div id="players">
        <h2>Joueurs</h2>
        <ul id="playerList">
            <!-- Liste des joueurs -->
        </ul>
    </div>

    <div id="roomNumber">
        <h2>Numéro de la salle</h2>
        <p id="roomNumberText">1234</p>
    </div>
</template>