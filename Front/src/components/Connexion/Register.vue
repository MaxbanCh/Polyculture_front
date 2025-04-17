<script setup lang="ts">
import ws from '../../utils/websocket.ts'

console.log("Hello from Register!")
</script>

<template>
    <h1>Login</h1>
    Username:
    <input type="text" name="Username" id="username">
    Email :
    <input type="email" name="Mail" id="mail">
    Password:
    <input type="password" name="Password" id="password">

    <button id="register" @click="register()">Register</button>
</template>