import { createRouter, createWebHistory } from "vue-router";

import Home from "../components/Home.vue"
import Login from "../components/Connexion/Login.vue"
import Lobby from "../components/Game/Lobby.vue"
import Defi from "../components/Game/Defi/Defi.vue"

export default createRouter({
	history : createWebHistory("/"),
	routes: [
		{
			path : "/",
			name : "Home",
			component : Home,
		},
		{
			path: "/login",
			name: "Login",
			component: Login,
			props: true,
		},
		{
			path: "/lobby",
			name: "Lobby",
			component: Lobby,
		},
		{
			path: "/defi",
			name: "Defi",
			component: Defi,
		}
	],
});