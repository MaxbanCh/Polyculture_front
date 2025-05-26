<script setup>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

async function checkAuthStatus() {
  try {
    const response = await fetch("https://polyculture-back.cluster-ig3.igpolytech.fr/check-token", {
      method: "GET",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.log("Token invalide ou expiré, déconnexion automatique");
      await fetch("https://polyculture-back.cluster-ig3.igpolytech.fr/logout", {
        method: "POST",
        mode: "cors",
        credentials: "include",
      });
      router.push('/connexion');
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
  }
}

onMounted(() => {
    checkAuthStatus();
});
</script>

<template>
  <Header />
  <div class="main-container">
    <router-view />
  </div>
  <Footer />
</template>

