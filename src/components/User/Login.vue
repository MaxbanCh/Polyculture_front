<script setup lang="ts">


async function login() {
    let usernameElement = document.getElementById("username");
    let username = usernameElement ? (usernameElement as HTMLInputElement).value : '';

    let passwordElement = document.getElementById("password") as HTMLInputElement;
    let password = passwordElement ? passwordElement.value : '';

    fetch("https://polyculture-back.cluster-ig3.igpolytech.fr/login", {
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
            // const data = await response.json();

            // const expirationDate = new Date();
            // expirationDate.setDate(expirationDate.getDate() + 7); // Cookie valide 7 jours
            
            // document.cookie = `auth_token=${data.auth_token}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict; Secure`;

            window.location.href = '/'; // Rediriger vers la page d'accueil
            // router.push('/'); // Utiliser le routeur pour rediriger vers la page d'accueil
        }
        })
    .catch((error) => {
        console.error("There has been a problem with your fetch operation:", error);
    });
}

</script>

<template>
    <h2>Login</h2>
    Username:
    <input type="text" name="Username" id="username">
    Password:
    <input type="password" name="Password" id="password">

    <button id="login" @click="login()">Login</button>
</template>