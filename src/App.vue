<script setup>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

async function checkAuthStatus() {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    console.log("Token absent, déconnexion automatique");
    clearAuthData();
    router.push('/connexion');
    return;
  }

  try {
    const response = await fetch("https://polyculture-back.axithem.fr/check-token", {
      method: "GET",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.log("Token invalide ou expiré, déconnexion automatique");
      clearAuthData();
      router.push('/connexion');
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    // En cas d'erreur réseau, on peut aussi nettoyer les données d'auth
    clearAuthData();
    router.push('/connexion');
  }
}

function clearAuthData() {
  // Suppression du token du localStorage
  localStorage.removeItem('auth_token');
  
  // Suppression du cookie avec tous les attributs possibles
  document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure;";
  
  // Nettoyage supplémentaire si d'autres données d'auth existent
  localStorage.removeItem('user_data');
  sessionStorage.clear();
}

onMounted(() => {
    checkAuthStatus();
    // isAdmin();
});
</script>

<template>
  <Header />
  <div class="main-container">
    <router-view />
  </div>
  <Footer />
</template>

