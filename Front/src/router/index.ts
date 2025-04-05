import { createRouter, createWebHistory } from "vue-router";

import Home from "../components/Home.vue"
import Login from "../components/Connexion/Login.vue"

export default createRouter({
	history : createWebHistory("/"),
	routes: [
		{
			path : "/",
			name : "Home",
			component : Home,
		},
		{
			path: "/:login",
			name: "Login",
			component: Login,
			props: true,
		},
	],
});