<script setup lang="ts">
    import { ref, onMounted } from "vue";
    let wait = ref(true);
    let isAdmin = ref(false);

    async function accessGranted() {
        try {
        const response = await fetch("http://89.195.188.17:3000/admin", {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        if (response.status === 200) {
            const data = await response.json();
            isAdmin.value = data.isAdmin;
        } else {
            console.error("Failed to fetch admin status");
        }
        } catch (error) {
            console.error("Error during admin check:", error);
            isAdmin.value = false;
        }
    }
    async function init() {
        await accessGranted();
        if (!isAdmin.value) {
            window.location.href = "/home";
        }
        wait.value = false;
    }
    init();

</script>


<template>
    <div id="admin">
        <div v-if="wait">
            <p>Loading...</p>
        </div>
        <div v-else>
            <h1>Admin Panel</h1>
        </div>

    </div>

</template>