<script lang="ts">

</script>

<template>
  <footer>
    <div class="footer-content">
      <p>&copy; 2025 Polyculture. Tous droits réservés.</p>
      <ul>
        <li>Publicité</li>
        <li></li>
      </ul>
    </div>
  </footer>
</template>

<style scoped>
footer {
  background-color: #333;
  color: #fff;
  padding: 20px;
  text-align: center;
}
.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 20px;
}
li {
  display: inline;
}
a {
  color: #fff;
  text-decoration: none;
  transition: color 0.3s;
}
a:hover {
  color: #ff6347;
}
</style>