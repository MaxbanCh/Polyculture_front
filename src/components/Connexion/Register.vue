<script setup lang="ts">

console.log("Hello from Register!")

async function register() {
    let username = ((document.getElementById("usernameRegister") as HTMLInputElement)?.value ?? "");
    let password = (document.getElementById("passwordRegister") as HTMLInputElement)?.value ?? "";

    fetch("https://83.195.188.17:3000/register", {
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
            console.log("Register successful");
            const data = await response.json();

            console.log(data);
            localStorage.setItem('auth_token', data.auth_token);
            window.location.href = '/'; // Rediriger vers la page d'accueil
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
    <h2>Register</h2>
    Username:
    <input type="text" name="UsernameRegister" id="usernameRegister">
    Password:
    <input type="password" name="PasswordRegister" id="passwordRegister">

    <button id="register" @click="register()">Register</button>
</template>