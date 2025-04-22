<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const isLoggedIn = ref(false); // Variable réactive pour l'état de connexion
const router = useRouter();

// Vérifie si l'utilisateur est connecté au montage du composant
onMounted(() => {
  isLoggedIn.value = !!localStorage.getItem('auth_token'); // Vérifie si un token est présent
});

// Fonction pour se déconnecter
function logout() {
  localStorage.removeItem('auth_token'); // Supprime le token
  isLoggedIn.value = false; // Met à jour l'état de connexion
  router.push('/'); // Redirige vers la page d'accueil
}
</script>

<template>
  <header>
    <nav>
      <ul>
        <li><RouterLink to="/">Accueil</RouterLink></li>
        <li><RouterLink to="/lobby">Multijoueur</RouterLink></li>
        <li><RouterLink to="/Defi">Defi</RouterLink></li>
        <li v-if="isLoggedIn">
          <RouterLink to="/profil">Profil</RouterLink>
        </li>
        <li v-else>
          <RouterLink to="/login">Login</RouterLink>
        </li>
      </ul>
    </nav>
  </header>
</template>



<style scoped>
/* Style général pour le header */
header {
    background-color: #2c3e50; /* Couleur de fond */
    padding: 1rem 2rem; /* Espacement interne */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Ombre légère */
}

/* Style pour la navigation */
nav ul {
    list-style: none; /* Supprime les puces */
    display: flex; /* Affiche les éléments en ligne */
    justify-content: space-around; /* Espacement égal entre les éléments */
    align-items: center; /* Aligne les éléments verticalement */
    margin: 0; /* Supprime les marges */
    padding: 0; /* Supprime les espacements internes */
}

/* Style pour les liens */
nav ul li {
    margin: 0 1rem; /* Espacement entre les éléments */
}

nav ul li a {
    text-decoration: none; /* Supprime le soulignement */
    color: #ecf0f1; /* Couleur du texte */
    font-weight: bold; /* Texte en gras */
    transition: color 0.3s ease; /* Transition pour le changement de couleur */
}

/* Effet au survol */
nav ul li a:hover {
    color: #3498db; /* Couleur au survol */
}

/* Style pour le header sur petits écrans */
@media (max-width: 768px) {
    nav ul {
        flex-direction: column; /* Affiche les éléments en colonne */
        text-align: center; /* Centre les éléments */
    }

    nav ul li {
        margin: 0.5rem 0; /* Réduit l'espacement entre les éléments */
    }
}
</style>