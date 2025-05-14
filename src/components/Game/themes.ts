import { ref } from "vue";

export async function fetchThemes() {
    try {
        const response = await fetch("http://83.195.188.17:3000/themes", {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Themes fetched successfully:", data.themes);
            return data.themes; // Retourner les thèmes
            // themes.value = data.themes; // Stocker les thèmes
        } else {
            console.error("Failed to fetch themes");

        }
    } catch (error) {
        console.error("Error fetching themes:", error);
    }
}

// const themes = ref<string[]>([]); // Liste des thèmes
// const themesLoaded = ref(false); // Indicateur de chargement des thèmes

// // Fonction pour charger les thèmes
// async function loadThemes() {
//     if (!themesLoaded.value) {
//         const fetchedThemes = await fetchThemes();
//         if (fetchedThemes) {
//             themes.value = fetchedThemes;
//             themesLoaded.value = true; // Marquer les thèmes comme chargés
//         }
//     }
// }

export default fetchThemes;