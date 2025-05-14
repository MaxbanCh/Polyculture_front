import { createRouter, createWebHistory } from "vue-router";

import Home from "../components/Home.vue"
import Lobby from "../components/Game/Lobby.vue"
import Defi from "../components/Game/Defi/Defi.vue"
import Profil from "../components/Connexion/Profil.vue"
import Room from "../components/Game/Multijoueur/Room.vue"

import Connect from "../components/Connexion/Connect.vue"
import Admin from "../components/Admin/Admin.vue"

export default createRouter({
	history : createWebHistory("/"),
	routes: [
		{
			path : "/",
			name : "Home",
			component : Home,
		},
		{
			path: "/connexion",
			name: "Connect",
			component: Connect,
			props: true,
		},
		{
			path: '/room/:code?',
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
			beforeEnter: (to, from, next) => {
				const token = localStorage.getItem('auth_token');
				if (!token) {
					next('/login');
				} else {
					// Vérification du token
					fetch("http://83.195.188.17:3000/profil", {
						headers: {
							"Authorization": `Bearer ${token}`
						}
					})
					.then(response => {
						if (response.status === 200) {
							next(); // Autoriser l'accès
						} else {
							next('/'); // Rediriger vers la page d'accueil
						}
					})
					.catch(() => next('/connexion'));
				}
			}
		},
		{
			path: "/admin",
			name: "Admin",
			component: Admin,
			beforeEnter: (to, from, next) => {
				const token = localStorage.getItem('auth_token');
				if (!token) {
				next('/login');
				} else {
				// Vérification des droits admin
				fetch("http://83.195.188.17:3000/admin", {
					headers: {
					"Authorization": `Bearer ${token}`
					}
				})
				.then(response => {
					if (response.status === 200) {
					next(); // Autoriser l'accès
					} else {
					next('/'); // Rediriger vers la page d'accueil
					}
				})
				.catch(() => next('/'));
				}
			}
		}
	],
});