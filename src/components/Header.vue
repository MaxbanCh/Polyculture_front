<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isLoggedIn = ref(false); // Variable réactive pour l'état de connexion

// Vérifie si l'utilisateur est connecté au montage du composant
onMounted(() => {
  isLoggedIn.value = !!localStorage.getItem('auth_token'); // Vérifie si un token est présent
});


const isMenuOpen = ref(false);
function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

const closeMenu = () => {
  isMenuOpen.value = false;
};
</script>

<template>
  <div class="header-wrapper">
    <header>
    <nav>
        <div class="logo-container">
          Polyculture
        </div>
      <button class="menu-toggle" @click="toggleMenu" aria-label="Toggle menu">
        <div class="hamburger" :class="{ 'menu-open': isMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      <ul :class="{ 'menu-open': isMenuOpen }">
        
        <li><RouterLink to="/" @click="closeMenu">Accueil</RouterLink></li>
          <li><RouterLink to="/room" @click="closeMenu">Multijoueur</RouterLink></li>
          <li><RouterLink to="/Defi" @click="closeMenu">Defi</RouterLink></li>
          <li v-if="isLoggedIn">
            <RouterLink to="/profil" @click="closeMenu">Profil</RouterLink>
          </li>
          <li v-else>
            <RouterLink to="/connexion" @click="closeMenu">Connexion</RouterLink>
          </li>
        <li>Question</li>
      </ul>
    </nav>
  </header>
  </div>
  
</template>



<style scoped>
.header-wrapper {
    background-color: #2c3e50;
    margin: 1% 7.5%;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 20px;
    z-index: 1000;
}

header {
    width: 100%;
    background-color: transparent;
}

nav {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between; /* Changé de flex-end à space-between */
    align-items: center;
    height: 60px;
    position: relative;
}


/* Styles pour le bouton hamburger */
.menu-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 10px;
    z-index: 100;
}

.hamburger {
    width: 24px;
    height: 20px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.hamburger span {
    display: block;
    height: 3px;
    width: 100%;
    background-color: white;
    border-radius: 3px;
    transition: all 0.3s ease;
}

.logo-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    height: 40px;
}

.logo {
    height: 100%;
    width: auto;
}

.logo-text {
    color: white;
    font-size: 1.2rem;
    font-weight: 600;
}


/* Style pour les liens */
nav ul {
    list-style: none;
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0;
    gap: 2rem;
}

nav ul li {
    margin: 0;
    color: white;
    cursor: pointer;
}

nav ul li a {
    text-decoration: none;
    color: white;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

nav ul li a:hover,
nav ul li:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
}

nav ul li a.router-link-active {
    background-color: rgba(255, 255, 255, 0.15);
}

@media (max-width: 768px) {
    .header-wrapper {
        margin: 10px 20px;
        top: 10px;
    }

    nav {
        padding: 0 1rem;
    }

    .menu-toggle {
        display: block;
    }

    nav ul {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: #2c3e50;
        flex-direction: column;
        padding: 1rem;
        display: none;
        border-radius: 0 0 2% 2%;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    nav ul.menu-open {
        display: flex;
    }

    nav ul li {
        width: 100%;
        text-align: center;
        padding: 0.5rem 0;
    }

    /* Animation du hamburger */
    .menu-open + .menu-toggle .hamburger span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }

    .menu-open + .menu-toggle .hamburger span:nth-child(2) {
        opacity: 0;
    }

    .menu-open + .menu-toggle .hamburger span:nth-child(3) {
        transform: rotate(-45deg) translate(5px, -5px);
    }

    .logo-container {
        gap: 0.5rem;
    }

    .logo-text {
        font-size: 1rem;
    }
}
</style>