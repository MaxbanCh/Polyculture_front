import { createRouter, createWebHistory } from "vue-router";

import Home from "../components/Home.vue";
import Defi from "../components/Game/Defi/Defi.vue";
import Profil from "../components/User/Profil.vue";
import Room from "../components/Game/Multijoueur/Room.vue";
import BuzzerRoom from "../components/Game/Buzzer/BuzzerRoom.vue";

import Connect from "../components/User/Connect.vue";
import Admin from "../components/Admin/Admin.vue";
import ManageQuestionPool from '../components/Admin/ManageQuestionPool.vue'
import UserQuestionManager from '../components/User/UserQuestionManager.vue'


export default createRouter({
  history: createWebHistory("/"),
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home,
    },
    {
      path: "/connexion",
      name: "Connect",
      component: Connect,
      props: true,
    },
    {
      path: "/room/:code?",
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
      beforeEnter: (_to, _from, next) => {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          next("/connexion");
        } else {
          // Vérification du token
          fetch("https://polyculture-back.cluster-ig3.igpolytech.fr/profil", {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          })
            .then((response) => {
              if (response.status === 200) {
                next(); // Autoriser l'accès
              } else {
                next("/connexion"); // Rediriger vers la page d'accueil
              }
            })
            .catch(() => next("/connexion"));
        }
      },
    },
    {
      path: "/admin",
      name: "Admin",
      component: Admin,
      beforeEnter: (_to, _from, next) => {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          next("/login");
        } else {
          // Vérification des droits admin
          fetch("https://polyculture-back.cluster-ig3.igpolytech.fr/admin", {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          })
            .then((response) => {
              if (response.status === 200) {
                next(); // Autoriser l'accès
              } else {
                next("/"); // Rediriger vers la page d'accueil
              }
            })
            .catch(() => next("/"));
        }
      },
    },
    {
      path: '/admin/pools',
      name: 'ManageQuestionPool',
      component: ManageQuestionPool,
      meta: { requiresAuth: true, requiresAdmin: true },
      beforeEnter: (_to, _from, next) => {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          next("/login");
        } else {
          // Vérification des droits admin
          fetch("https://polyculture-back.cluster-ig3.igpolytech.fr/admin", {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          })
            .then((response) => {
              if (response.status === 200) {
                next(); // Autoriser l'accès
              } else {
                next("/"); // Rediriger vers la page d'accueil
              }
            })
            .catch(() => next("/"));
        }
      },
    },
    {
      path: "/questions",
      name: "UserQuestionManager",
      component: UserQuestionManager,
    },
    {
      path: '/buzzer/:code?',
      name: 'BuzzerRoom',
      component: BuzzerRoom,
    }
  ],
});
