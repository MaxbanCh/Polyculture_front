<script setup lang="ts">
console.log("Hello from Login!")

async function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    fetch("http://localhost:3000/login", {
        method: "POST",
        mode : "cors",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({username: username, password: password})
        })
    .then(async (response) => {
        if (response.ok) {
            console.log("Login successful");
            const data = await response.json();

            console.log(data);
            localStorage.setItem('auth_token', data.auth_token);
            window.location.href = '/chat/index.html'
        }
        // throw new Error("Network response was not ok.");
        else {
            console.log("Login failed");
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
    Password:
    <input type="password" name="Password" id="password">

    <button id="login" onclick="login()">Login</button>
</template>