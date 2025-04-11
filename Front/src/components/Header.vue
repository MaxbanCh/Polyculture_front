<script setup lang="ts">
import Login from './Connexion/Login.vue'
</script>

<template>
    <header>
        <nav>
            <ul>
                <li><RouterLink to="/">Accueil</RouterLink></li>
                <li><a href="#">Une question surprise !</a></li>
                <li><RouterLink to="/login">Login</RouterLink></li>
            </ul>
        </nav>
    </header>
</template>