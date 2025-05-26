export async function fetchThemes() {
  try {
    const response = await fetch("https://polyculture-back.cluster-ig3.igpolytech.fr/themes", {
      method: "GET",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      
      // Check if themes is an array of objects with 'name' property
      if (data.themes && Array.isArray(data.themes) && data.themes.length > 0) {
        // If themes are objects, extract just the names
        if (typeof data.themes[0] === 'object' && data.themes[0].name) {
          const themeNames = data.themes.map((theme: { name: string }) => theme.name);
          console.log("Themes fetched successfully:", themeNames);
          return themeNames;
        }
        // If already array of strings, return as is
        console.log("Themes fetched successfully:", data.themes);
        return data.themes;
      }
      
      return []; // Return empty array if no themes
    } else {
      console.error("Failed to fetch themes");
      return [];
    }
  } catch (error) {
    console.error("Error fetching themes:", error);
    return [];
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
