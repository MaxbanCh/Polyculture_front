<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // Importer useRouter

import Login from './Login.vue';
import Register from './Register.vue';


</script>

<template>
    <h1>Connexion</h1>
    <div class="connexion">
        <Login />
        <Register />
    </div>
</template>