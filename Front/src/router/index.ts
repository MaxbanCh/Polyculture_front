import { createRouter, createWebHistory } from "vue-router";

import Home from "../components/Home.vue"
import Login from "../components/Connexion/Login.vue"
import Lobby from "../components/Game/Lobby.vue"
import Defi from "../components/Game/Defi/Defi.vue"
import Profil from "../components/Connexion/Profil.vue"
import Room from "../components/Game/Room.vue"

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
			path: "/room",
			name: "Room",
			component: Room,
		},
		{
			path: "/defi",
			name: "Defi",
			component: Defi,
		},
		{
			path: "/profil",
			name: "Profil",
			component: Profil,
		}
	],
});