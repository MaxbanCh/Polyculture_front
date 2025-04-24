<script setup lang="ts">
    
</script>


<template>
    <div id="admin">
        <h1>Admin</h1>
        <h2>Ajouter une question</h2>
        <label for="theme">Thème :</label>
        <select id="theme" v-model="selectedTheme">
            <option v-for="theme in themes" :key="theme" :value="theme">{{ theme }}</option>
        </select>
        <button @click="askQuestion">Poser une question</button>
        <Question v-if="questionData" :question="questionData" />
    </div>
</template>