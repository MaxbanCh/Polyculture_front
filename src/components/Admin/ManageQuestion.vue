<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

import { fetchThemes } from '../Game/themes.ts';

const questions = ref<{ 
    questions: any[], 
    currentPage: number, 
    totalPages: number 
}>({
    questions: [],
    currentPage: 1,
    totalPages: 1
});
const filteredQuestions = ref<any[]>([]); // Pour stocker les questions filtrées
const themes = ref<string[]>([]); // Liste des thèmes
const selectedTheme = ref<string>("");

// Variables pour la recherche
const searchQuery = ref("");
const isSearching = ref(false);

// Variables pour l'ajout de question
const newQuestionText = ref("");
const newQuestionAnswer = ref("");
const newQuestionType = ref("text"); // Défaut sur 'text'
const newQuestionSubtheme = ref("");
const errorMessage = ref("");
const wait = ref(true);

// Variables pour la modification
const editingQuestion = ref(null);
const editQuestionText = ref("");
const editQuestionAnswer = ref("");
const editQuestionTheme = ref("");
const editQuestionSubtheme = ref("");
const editQuestionType = ref("");

// Surveiller les changements de questions pour mettre à jour filteredQuestions
watch(() => questions.value, () => {
  updateFilteredQuestions();
}, { deep: true, immediate: true });

async function fetchQuestions(page = 1) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        errorMessage.value = "Vous n'êtes pas connecté";
        wait.value = false;
        return;
    }
    
    if (page < 1) {
        page = 1;
    }

    const url = new URL("https://polyculture-back.cluster-ig3.igpolytech.fr/question");
    url.searchParams.append("page", page.toString());

    wait.value = true;
    fetch(url.toString(), {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    })
    .then(async (response) => {
        const result = await response.json();
        questions.value = result;
        wait.value = false;
        updateFilteredQuestions(); // Mettre à jour les questions filtrées
    })
    .catch((error) => {
        console.error("Erreur lors de la récupération des questions:", error);
        errorMessage.value = "Erreur lors de la récupération des questions";
        wait.value = false;
    });
}

// Fonction pour filtrer les questions en fonction de la recherche
function updateFilteredQuestions() {
    if (!searchQuery.value.trim() || !questions.value.questions) {
        filteredQuestions.value = questions.value.questions || [];
        isSearching.value = false;
        return;
    }

    const query = searchQuery.value.toLowerCase();
    isSearching.value = true;
    
    filteredQuestions.value = questions.value.questions.filter(question => 
        question.question.toLowerCase().includes(query) || 
        (question.answer && question.answer.toLowerCase().includes(query)) || 
        (question.theme && question.theme.toLowerCase().includes(query)) ||
        (question.subtheme && question.subtheme.toLowerCase().includes(query))
    );
}

async function addQuestion() {
    const token = localStorage.getItem('auth_token');
    if (!token || !newQuestionText.value || !newQuestionAnswer.value) {
        errorMessage.value = "Veuillez remplir tous les champs requis";
        return;
    }

    try {
        const response = await fetch("https://polyculture-back.cluster-ig3.igpolytech.fr/question", {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                question: newQuestionText.value,
                answer: newQuestionAnswer.value,
                theme: selectedTheme.value || "Général",
                subtheme: newQuestionSubtheme.value || " ",
                type: newQuestionType.value
            }),
        });
        if (response.ok) {
            fetchQuestions(); // Rafraîchir la liste complète
            
            // Réinitialiser les champs
            newQuestionText.value = "";
            newQuestionAnswer.value = "";
            newQuestionSubtheme.value = "";
            selectedTheme.value = "";
            
            errorMessage.value = "Question ajoutée avec succès";
            setTimeout(() => {
                errorMessage.value = "";
            }, 2000);
        } else {
            errorMessage.value = "Erreur lors de l'ajout de la question";
        }
    } catch (error) {
        console.error("Erreur lors de l'ajout de la question:", error);
        errorMessage.value = "Erreur lors de l'ajout de la question";
    }
}

async function deleteQuestion(id : number) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        errorMessage.value = "Vous n'êtes pas connecté";
        return;
    }

    if (!confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
        return;
    }

    try {
        const response = await fetch(`https://polyculture-back.cluster-ig3.igpolytech.fr/question/${id}`, {
            method: "DELETE",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (response.ok) {
            fetchQuestions(); // Rafraîchir la liste complète
            errorMessage.value = "Question supprimée avec succès";
            setTimeout(() => {
                errorMessage.value = "";
            }, 2000);
        } else {
            errorMessage.value = "Erreur lors de la suppression de la question";
        }
    } catch (error) {
        console.error("Erreur lors de la suppression de la question:", error);
        errorMessage.value = "Erreur lors de la suppression de la question";
    }
}

function startEdit(question: any) {
    editingQuestion.value = question.id;
    editQuestionText.value = question.question;
    editQuestionAnswer.value = question.answer;
    editQuestionTheme.value = question.theme;
    editQuestionSubtheme.value = question.subtheme;
    editQuestionType.value = question.type || "text";
}

async function saveEdit(id : number) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        errorMessage.value = "Vous n'êtes pas connecté";
        return;
    }

    try {
        const response = await fetch(`https://polyculture-back.cluster-ig3.igpolytech.fr/question/${id}`, {
            method: "PUT",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                question: editQuestionText.value,
                answer: editQuestionAnswer.value,
                theme: editQuestionTheme.value,
                subtheme: editQuestionSubtheme.value,
                type: editQuestionType.value
            }),
        });
        
        if (response.ok) {
            editingQuestion.value = null;
            fetchQuestions(); // Rafraîchir la liste
            errorMessage.value = "Question modifiée avec succès";
            setTimeout(() => {
                errorMessage.value = "";
            }, 2000);
        } else {
            errorMessage.value = "Erreur lors de la modification de la question";
        }
    } catch (error) {
        console.error("Erreur lors de la modification de la question:", error);
        errorMessage.value = "Erreur lors de la modification de la question";
    }
}

function cancelEdit() {
    editingQuestion.value = null;
}

// function handleSearch() {
//     fetchQuestions(1); // Revenir à la première page lors d'une recherche
// }

function clearSearch() {
    searchQuery.value = "";
    updateFilteredQuestions();
}

onMounted(() => {
    wait.value = true;
    fetchQuestions();

    fetchThemes()
    .then((data) => {
        themes.value = data; // Store the themes in the ref
    })
    .catch((error) => {
        console.error("Error fetching themes:", error);
    });
});
</script>

<template>
    <div class="manage-question">
        <h1>Gestion des questions</h1>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div v-if="wait" class="loading">Chargement...</div>
        <div v-else>
            
            <h2>Liste des questions</h2>
            
            <!-- Barre de recherche instantanée -->
            <div class="search-container">
                <input 
                    type="text" 
                    v-model="searchQuery" 
                    @input="updateFilteredQuestions"
                    placeholder="Rechercher des questions..."
                />
                <button v-if="isSearching" class="clear-btn" @click="clearSearch">
                    Effacer la recherche
                </button>
            </div>
            
            <div class="table-container">
                <table class="questions-table">
                    <thead>
                        <tr>
                            <th>Question</th>
                            <th>Réponse</th>
                            <th>Thème</th>
                            <th>Sous-thème</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="question in filteredQuestions" :key="question.id">
                            <template v-if="editingQuestion !== question.id">
                                <td>{{ question.question }}</td>
                                <td>{{ question.answer }}</td>
                                <td>{{ question.theme || 'Non défini' }}</td>
                                <td>{{ question.subtheme || 'Non défini' }}</td>
                                <td>{{ question.type || 'text' }}</td>
                                <td class="actions">
                                    <button class="edit-btn" @click="startEdit(question)">Modifier</button>
                                    <button class="delete-btn" @click="deleteQuestion(question.id)">Supprimer</button>
                                </td>
                            </template>
                            
                            <template v-else>
                                <td><input v-model="editQuestionText" placeholder="Question" /></td>
                                <td><input v-model="editQuestionAnswer" placeholder="Réponse" /></td>
                                <td>
                                    <select v-model="editQuestionTheme">
                                        <option v-for="theme in themes" :key="theme" :value="theme">
                                            {{ theme }}
                                        </option>
                                    </select>
                                </td>
                                <td><input v-model="editQuestionSubtheme" placeholder="Sous-thème" /></td>
                                <td>
                                    <select v-model="editQuestionType">
                                        <option value="text">Texte</option>
                                        <option value="choice">Choix multiple</option>
                                    </select>
                                </td>
                                <td class="actions">
                                    <button class="save-btn" @click="saveEdit(question.id)">Enregistrer</button>
                                    <button class="cancel-btn" @click="cancelEdit">Annuler</button>
                                </td>
                            </template>
                        </tr>
                        <!-- Message quand aucun résultat -->
                        <tr v-if="filteredQuestions.length === 0">
                            <td colspan="6" class="no-results">
                                Aucune question ne correspond à votre recherche
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="pagination">
                    <button 
                        :disabled="questions.currentPage <= 1" 
                        @click="fetchQuestions(questions.currentPage - 1)">
                        Précédent
                    </button>
                    <span>Page {{ questions.currentPage }} sur {{ questions.totalPages }}</span>
                    <button 
                        :disabled="questions.currentPage >= questions.totalPages" 
                        @click="fetchQuestions(questions.currentPage + 1)">
                        Suivant
                    </button>
                </div>
            </div>
            
            <h2>Ajouter une question</h2>
            <div class="add-question-form">
                <div class="form-group">
                    <label for="new-question">Question:</label>
                    <input id="new-question" type="text" v-model="newQuestionText" placeholder="Texte de la question" />
                </div>
                
                <div class="form-group">
                    <label for="new-answer">Réponse:</label>
                    <input id="new-answer" type="text" v-model="newQuestionAnswer" placeholder="Réponse correcte" />
                </div>
                
                <div class="form-group">
                    <label for="theme-select">Thème:</label>
                    <select id="theme-select" v-model="selectedTheme">
                        <option value="" disabled>-- Sélectionnez un thème --</option>
                        <option v-for="theme in themes" :key="theme" :value="theme">
                            {{ theme }}
                        </option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="subtheme">Sous-thème:</label>
                    <input id="subtheme" type="text" v-model="newQuestionSubtheme" placeholder="Sous-thème (optionnel)" />
                </div>
                
                <div class="form-group">
                    <label for="question-type">Type:</label>
                    <select id="question-type" v-model="newQuestionType">
                        <option value="text">Texte</option>
                        <option value="choice">Choix multiple</option>
                    </select>
                </div>
                
                <button class="add-btn" @click="addQuestion">Ajouter cette question</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.manage-question {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
}

.error-message {
    background-color: #ffdddd;
    color: #ff0000;
    padding: 10px;
    margin-bottom: 15px;
    border-radius: 5px;
}

.table-container {
    overflow-x: auto;
    margin-bottom: 20px;
}

.questions-table {
    width: 100%;
    border-collapse: collapse;
}

.questions-table th, .questions-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

.questions-table th {
    background-color: #0d0d0d;
    position: sticky;
    top: 0;
}

.questions-table tr:nth-child(even) {
    background-color: #070707;
}

.questions-table tr:hover {
    background-color: #0f0f0f;
}

.actions {
    display: flex;
    gap: 5px;
}

button {
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.edit-btn {
    background-color: #4caf50;
    color: white;
}

.delete-btn {
    background-color: #f44336;
    color: white;
}

.save-btn {
    background-color: #2196F3;
    color: white;
}

.cancel-btn {
    background-color: #607D8B;
    color: white;
}

.add-btn {
    background-color: #4caf50;
    color: white;
    padding: 8px 16px;
    font-size: 16px;
}

.add-question-form {
    background-color: #070707;
    padding: 15px;
    border-radius: 5px;
    margin-top: 10px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.form-group input, .form-group select {
    width: 100%;
    padding: 8px;
    border: 1px solid #333;
    border-radius: 4px;
}

.search-container {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    align-items: center;
}

.search-container input {
    flex: 1;
    padding: 10px;
    border: 1px solid #333;
    border-radius: 4px;
    background-color: #121212;
    color: white;
}

.search-btn {
    background-color: #2196F3;
    color: white;
}

.clear-btn {
    background-color: #607D8B;
    color: white;
}

/* Indiquer que des filtres sont actifs */
.search-active {
    border-bottom: 2px solid #4caf50;
    padding-bottom: 5px;
}

/* Style pour le message quand aucun résultat */
.no-results {
    text-align: center;
    padding: 20px;
    font-style: italic;
    color: #999;
}
</style>