<script setup lang="ts">
import ws from '../../utils/websocket.ts'

console.log("Hello from Register!")

async function register() {
    let username = document.getElementById("username").value;
    let mail = document.getElementById("mail").value;
    let password = document.getElementById("password").value;

    fetch("http://localhost:3000/register", {
        method: "POST",
        mode : "cors",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({username: username, mail: mail, password: password})
        })
    .then(async (response) => {
        if (response.ok) {
            console.log("Register successful");
            const data = await response.json();

            console.log(data);
            localStorage.setItem('auth_token', data.auth_token);
            router.push("/");
        }
        // throw new Error("Network response was not ok.");
        else {
            
        }

    })
    .then((data) => {
        console.log(data);
    })
    .catch((error) => {
        console.error("There has been a problem with your fetch operation:", error);
    });

}
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