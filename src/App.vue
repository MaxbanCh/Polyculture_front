<script setup>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
</script>

<template>
  <Header />
  <div class="main-container">
    <router-view />
  </div>
  <Footer />
</template>

