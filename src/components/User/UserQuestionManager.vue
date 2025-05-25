<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from 'vue-router';

// Types pour les questions et les pools
interface Question {
    id: number;
    question: string;
    answer: string;
    theme?: string;
    subtheme?: string;
    question_type?: string;
}

interface QuestionPool {
    id: number;
    name: string;
    description?: string;
    is_public?: boolean;
    question_count?: number;
    questions?: any;
}

// Router pour rediriger si non authentifié
const router = useRouter();

// Références réactives
const questions = ref<Question[]>([]);
const myQuestions = ref<Question[]>([]);
const myPools = ref<QuestionPool[]>([]);
const selectedTab = ref<string>("myQuestions"); // "myQuestions", "createQuestion", "myPools", "createPool"
const themes = ref<string[]>([]);
const errorMessage = ref("");
const successMessage = ref("");
const isLoading = ref(true);

// Variables pour la création de question
const newQuestionText = ref("");
const newQuestionAnswer = ref("");
const selectedTheme = ref("");
const newQuestionSubtheme = ref("");
const newQuestionType = ref("text");

// Variables pour la création de pool
const newPoolName = ref("");
const newPoolDescription = ref("");
const isPublic = ref(false);
// const selectedQuestions = ref<number[]>([]);

// Variables pour la pagination
const currentPage = ref(1);
const totalPages = ref(1);

// Variables pour l'édition
const editingQuestionId = ref<number | null>(null);
const editQuestionText = ref("");
const editQuestionAnswer = ref("");
const editQuestionTheme = ref("");
const editQuestionSubtheme = ref("");
const editQuestionType = ref("");

// Variables pour la recherche
const searchQuery = ref("");
const filteredQuestions = ref<Question[]>([]);

// Vérifie si l'utilisateur est connecté
function checkAuthentication() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        router.push('/connexion');
        return false;
    }
    return true;
}

// Récupère les questions créées par l'utilisateur
async function fetchMyQuestions(page = 1) {
    if (!checkAuthentication()) return;
    
    isLoading.value = true;
    const token = localStorage.getItem('auth_token');
    
    try {
        const response = await fetch(`https://polyculture-back.cluster-ig3.igpolytech.fr/my-questions?page=${page}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            myQuestions.value = data.questions;
            currentPage.value = data.currentPage;
            totalPages.value = data.totalPages;
        } else {
            errorMessage.value = "Erreur lors de la récupération de vos questions";
        }
    } catch (error) {
        console.error("Erreur:", error);
        errorMessage.value = "Erreur de connexion au serveur";
    } finally {
        isLoading.value = false;
    }
}

// Récupère les pools créés par l'utilisateur
async function fetchMyPools() {
    if (!checkAuthentication()) return;
    
    isLoading.value = true;
    const token = localStorage.getItem('auth_token');
    
    try {
        const response = await fetch("https://polyculture-back.cluster-ig3.igpolytech.fr/my-pools", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.ok) {
            myPools.value = await response.json();
        } else {
            errorMessage.value = "Erreur lors de la récupération de vos pools";
        }
    } catch (error) {
        console.error("Erreur:", error);
        errorMessage.value = "Erreur de connexion au serveur";
    } finally {
        isLoading.value = false;
    }
}

// Récupère les thèmes disponibles
async function fetchThemes() {
    if (!checkAuthentication()) return;
    
    try {
        const response = await fetch("https://polyculture-back.cluster-ig3.igpolytech.fr/themes", {
            method: "GET",
        });

        if (response.ok) {
            const data = await response.json();
            themes.value = data.themes.map((theme: any) => theme.name);
        }
    } catch (error) {
        console.error("Erreur lors du chargement des thèmes:", error);
    }
}

// Pour la recherche de questions à ajouter dans un pool
async function fetchAllQuestions() {
    if (!checkAuthentication()) return;
    
    isLoading.value = true;
    const token = localStorage.getItem('auth_token');
    
    try {
        const response = await fetch("https://polyculture-back.cluster-ig3.igpolytech.fr/question", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            questions.value = data.questions;
            filteredQuestions.value = data.questions;
        }
    } catch (error) {
        console.error("Erreur:", error);
    } finally {
        isLoading.value = false;
    }
}

// Crée une nouvelle question
async function createQuestion() {
    if (!checkAuthentication()) return;
    
    if (!newQuestionText.value || !newQuestionAnswer.value) {
        errorMessage.value = "Veuillez remplir au moins la question et la réponse";
        return;
    }

    const token = localStorage.getItem('auth_token');
    
    try {
        const response = await fetch("https://polyculture-back.cluster-ig3.igpolytech.fr/question", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                question: newQuestionText.value,
                answer: newQuestionAnswer.value,
                theme: selectedTheme.value || "Général",
                subtheme: newQuestionSubtheme.value || " ",
                question_type: newQuestionType.value
            }),
        });

        if (response.ok) {
            // Réinitialiser les champs
            newQuestionText.value = "";
            newQuestionAnswer.value = "";
            selectedTheme.value = "";
            newQuestionSubtheme.value = "";
            newQuestionType.value = "text";
            
            successMessage.value = "Question créée avec succès";
            setTimeout(() => { successMessage.value = ""; }, 3000);
            
            // Basculer vers l'onglet Mes Questions et actualiser
            selectedTab.value = "myQuestions";
            await fetchMyQuestions();
        } else {
            const error = await response.json();
            errorMessage.value = error.error || "Erreur lors de la création de la question";
        }
    } catch (error) {
        console.error("Erreur:", error);
        errorMessage.value = "Erreur de connexion au serveur";
    }
}

// Crée un nouveau pool de questions
async function createPool() {
    if (!checkAuthentication()) return;
    
    if (!newPoolName.value) {
        errorMessage.value = "Veuillez donner un nom à votre pool";
        return;
    }

    const token = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');
    
    try {
        const response = await fetch("https://polyculture-back.cluster-ig3.igpolytech.fr/questionpool", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: newPoolName.value,
                description: newPoolDescription.value,
                user_id: userId,
                is_public: isPublic.value
            }),
        });

        if (response.ok) {
            // Réinitialiser les champs
            newPoolName.value = "";
            newPoolDescription.value = "";
            isPublic.value = false;
            
            successMessage.value = "Pool créé avec succès";
            setTimeout(() => { successMessage.value = ""; }, 3000);
            
            // Basculer vers l'onglet Mes Pools et actualiser
            selectedTab.value = "myPools";
            await fetchMyPools();
        } else {
            const error = await response.json();
            errorMessage.value = error.error || "Erreur lors de la création du pool";
        }
    } catch (error) {
        console.error("Erreur:", error);
        errorMessage.value = "Erreur de connexion au serveur";
    }
}

// Supprime une question
async function deleteQuestion(id: number) {
    if (!checkAuthentication()) return;
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
        return;
    }

    const token = localStorage.getItem('auth_token');
    
    try {
        const response = await fetch(`https://polyculture-back.cluster-ig3.igpolytech.fr/question/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.ok) {
            successMessage.value = "Question supprimée avec succès";
            setTimeout(() => { successMessage.value = ""; }, 3000);
            await fetchMyQuestions(currentPage.value);
        } else {
            const error = await response.json();
            errorMessage.value = error.error || "Erreur lors de la suppression de la question";
        }
    } catch (error) {
        console.error("Erreur:", error);
        errorMessage.value = "Erreur de connexion au serveur";
    }
}

// Supprime un pool
async function deletePool(id: number) {
    if (!checkAuthentication()) return;
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce pool de questions ?")) {
        return;
    }

    const token = localStorage.getItem('auth_token');
    
    try {
        const response = await fetch(`https://polyculture-back.cluster-ig3.igpolytech.fr/questionpool/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.ok) {
            successMessage.value = "Pool supprimé avec succès";
            setTimeout(() => { successMessage.value = ""; }, 3000);
            await fetchMyPools();
        } else {
            const error = await response.json();
            errorMessage.value = error.error || "Erreur lors de la suppression du pool";
        }
    } catch (error) {
        console.error("Erreur:", error);
        errorMessage.value = "Erreur de connexion au serveur";
    }
}

// Commence l'édition d'une question
function startEditQuestion(question: Question) {
    editingQuestionId.value = question.id;
    editQuestionText.value = question.question;
    editQuestionAnswer.value = question.answer;
    editQuestionTheme.value = question.theme || "";
    editQuestionSubtheme.value = question.subtheme || "";
    editQuestionType.value = question.question_type || "text";
}

// Annule l'édition d'une question
function cancelEditQuestion() {
    editingQuestionId.value = null;
}

// Sauvegarde les modifications d'une question
async function saveEditQuestion(id: number) {
    if (!checkAuthentication()) return;
    
    if (!editQuestionText.value || !editQuestionAnswer.value) {
        errorMessage.value = "La question et la réponse ne peuvent pas être vides";
        return;
    }

    const token = localStorage.getItem('auth_token');
    
    try {
        const response = await fetch(`https://polyculture-back.cluster-ig3.igpolytech.fr/question/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                question: editQuestionText.value,
                answer: editQuestionAnswer.value,
                theme: editQuestionTheme.value,
                subtheme: editQuestionSubtheme.value,
                question_type: editQuestionType.value
            }),
        });

        if (response.ok) {
            successMessage.value = "Question mise à jour avec succès";
            setTimeout(() => { successMessage.value = ""; }, 3000);
            editingQuestionId.value = null;
            await fetchMyQuestions(currentPage.value);
        } else {
            const error = await response.json();
            errorMessage.value = error.error || "Erreur lors de la mise à jour de la question";
        }
    } catch (error) {
        console.error("Erreur:", error);
        errorMessage.value = "Erreur de connexion au serveur";
    }
}

// Filtre les questions en fonction de la recherche
function updateFilteredQuestions() {
    if (!searchQuery.value.trim()) {
        filteredQuestions.value = questions.value;
        return;
    }

    const query = searchQuery.value.toLowerCase();
    filteredQuestions.value = questions.value.filter(question => 
        question.question.toLowerCase().includes(query) || 
        question.answer.toLowerCase().includes(query) || 
        (question.theme && question.theme.toLowerCase().includes(query))
    );
}

// Surveille les changements dans la recherche
watch(searchQuery, updateFilteredQuestions);

// Chargement initial
onMounted(() => {
    if (checkAuthentication()) {
        fetchThemes();
        fetchMyQuestions();
    }
});

// Change d'onglet et charge les données appropriées
function changeTab(tab: string) {
    selectedTab.value = tab;
    
    if (tab === "myQuestions") {
        fetchMyQuestions();
    } else if (tab === "myPools") {
        fetchMyPools();
    } else if (tab === "addToPool") {
        fetchAllQuestions();
    }
}
</script>

<template>
    <div class="user-question-manager">
        <h1>Gérer mes questions</h1>

        <!-- Messages -->
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        
        <!-- Navigation des onglets -->
        <div class="tabs">
            <button 
                :class="{ active: selectedTab === 'myQuestions' }" 
                @click="changeTab('myQuestions')">
                Mes Questions
            </button>
            <button 
                :class="{ active: selectedTab === 'createQuestion' }" 
                @click="changeTab('createQuestion')">
                Créer une Question
            </button>
            <button 
                :class="{ active: selectedTab === 'myPools' }" 
                @click="changeTab('myPools')">
                Mes Pools
            </button>
            <button 
                :class="{ active: selectedTab === 'createPool' }" 
                @click="changeTab('createPool')">
                Créer un Pool
            </button>
        </div>

        <div class="tab-content">
            <!-- Affichage et gestion de mes questions -->
            <div v-if="selectedTab === 'myQuestions'" class="tab-pane">
                <h2>Mes questions</h2>
                
                <div v-if="isLoading" class="loading">Chargement...</div>
                
                <div v-else-if="myQuestions.length === 0" class="empty-state">
                    Vous n'avez pas encore créé de questions. 
                    <button @click="changeTab('createQuestion')">Créer votre première question</button>
                </div>
                
                <div v-else class="table-container">
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
                            <tr v-for="question in myQuestions" :key="question.id">
                                <!-- Mode affichage normal -->
                                <template v-if="editingQuestionId !== question.id">
                                    <td>{{ question.question }}</td>
                                    <td>{{ question.answer }}</td>
                                    <td>{{ question.theme || 'Non défini' }}</td>
                                    <td>{{ question.subtheme || 'Non défini' }}</td>
                                    <td>{{ question.question_type || 'text' }}</td>
                                    <td class="actions">
                                        <button class="edit-btn" @click="startEditQuestion(question)">Modifier</button>
                                        <button class="delete-btn" @click="deleteQuestion(question.id)">Supprimer</button>
                                    </td>
                                </template>
                                
                                <!-- Mode édition -->
                                <template v-else>
                                    <td><input v-model="editQuestionText" placeholder="Question" /></td>
                                    <td><input v-model="editQuestionAnswer" placeholder="Réponse" /></td>
                                    <td>
                                        <select v-model="editQuestionTheme">
                                            <option value="" disabled>-- Sélectionner --</option>
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
                                        <button class="save-btn" @click="saveEditQuestion(question.id)">Enregistrer</button>
                                        <button class="cancel-btn" @click="cancelEditQuestion()">Annuler</button>
                                    </td>
                                </template>
                            </tr>
                        </tbody>
                    </table>
                    
                    <!-- Pagination -->
                    <div class="pagination" v-if="totalPages > 1">
                        <button 
                            :disabled="currentPage <= 1" 
                            @click="fetchMyQuestions(currentPage - 1)">
                            Précédent
                        </button>
                        <span>Page {{ currentPage }} sur {{ totalPages }}</span>
                        <button 
                            :disabled="currentPage >= totalPages" 
                            @click="fetchMyQuestions(currentPage + 1)">
                            Suivant
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Création d'une question -->
            <div v-else-if="selectedTab === 'createQuestion'" class="tab-pane">
                <h2>Créer une nouvelle question</h2>
                
                <div class="form-container">
                    <div class="form-group">
                        <label for="question-text">Question :</label>
                        <input id="question-text" type="text" v-model="newQuestionText" placeholder="Votre question" />
                    </div>
                    
                    <div class="form-group">
                        <label for="question-answer">Réponse :</label>
                        <input id="question-answer" type="text" v-model="newQuestionAnswer" placeholder="La réponse correcte" />
                    </div>
                    
                    <div class="form-group">
                        <label for="question-theme">Thème :</label>
                        <select id="question-theme" v-model="selectedTheme">
                            <option value="" disabled>-- Sélectionner un thème --</option>
                            <option v-for="theme in themes" :key="theme" :value="theme">
                                {{ theme }}
                            </option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="question-subtheme">Sous-thème (optionnel) :</label>
                        <input id="question-subtheme" type="text" v-model="newQuestionSubtheme" placeholder="Sous-thème" />
                    </div>
                    
                    <div class="form-group">
                        <label for="question-type">Type de question :</label>
                        <select id="question-type" v-model="newQuestionType">
                            <option value="text">Texte</option>
                            <option value="choice">Choix multiple</option>
                        </select>
                    </div>
                    
                    <button class="create-btn" @click="createQuestion">Créer la question</button>
                </div>
            </div>
            
            <!-- Mes pools de questions -->
            <div v-else-if="selectedTab === 'myPools'" class="tab-pane">
                <h2>Mes pools de questions</h2>
                
                <div v-if="isLoading" class="loading">Chargement...</div>
                
                <div v-else-if="myPools.length === 0" class="empty-state">
                    Vous n'avez pas encore créé de pools de questions.
                    <button @click="changeTab('createPool')">Créer votre premier pool</button>
                </div>
                
                <div v-else class="table-container">
                    <table class="pools-table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Description</th>
                                <th>Public</th>
                                <th>Questions</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="pool in myPools" :key="pool.id">
                                <td>{{ pool.name }}</td>
                                <td>{{ pool.description || 'Aucune description' }}</td>
                                <td>{{ pool.is_public ? 'Oui' : 'Non' }}</td>
                                <td>{{ pool.question_count || 0 }}</td>
                                <td class="actions">
                                    <button class="delete-btn" @click="deletePool(pool.id)">Supprimer</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Création d'un pool -->
            <div v-else-if="selectedTab === 'createPool'" class="tab-pane">
                <h2>Créer un nouveau pool de questions</h2>
                
                <div class="form-container">
                    <div class="form-group">
                        <label for="pool-name">Nom du pool :</label>
                        <input id="pool-name" type="text" v-model="newPoolName" placeholder="Nom du pool" />
                    </div>
                    
                    <div class="form-group">
                        <label for="pool-description">Description (optionnelle) :</label>
                        <textarea id="pool-description" v-model="newPoolDescription" placeholder="Description du pool"></textarea>
                    </div>
                    
                    <div class="form-group checkbox">
                        <input id="pool-public" type="checkbox" v-model="isPublic" />
                        <label for="pool-public">Rendre ce pool public</label>
                    </div>
                    
                    <button class="create-btn" @click="createPool">Créer le pool</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.user-question-manager {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

h1 {
    font-size: 2rem;
    margin-bottom: 20px;
    color: #fff;
}

h2 {
    font-size: 1.5rem;
    margin-bottom: 15px;
}

.error-message {
    background-color: rgba(231, 76, 60, 0.2);
    color: #e74c3c;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
}

.success-message {
    background-color: rgba(46, 204, 113, 0.2);
    color: #2ecc71;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
}

.tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.tabs button {
    padding: 10px 15px;
    border: 1px solid #333;
    background-color: #1a1a1a;
    color: #fff;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.tabs button.active {
    background-color: #3498db;
    border-color: #2980b9;
}

.tab-content {
    background-color: #0a0a0a;
    border-radius: 8px;
    padding: 20px;
    min-height: 400px;
}

.tab-pane {
    animation: fadeIn 0.3s ease-in-out;
}

.loading {
    text-align: center;
    padding: 20px;
    color: #aaa;
}

.empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #aaa;
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
}

.empty-state button {
    padding: 10px 20px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.table-container {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    padding: 12px 8px;
    text-align: left;
    border-bottom: 1px solid #333;
}

th {
    background-color: #121212;
    position: sticky;
    top: 0;
}

tr:hover {
    background-color: rgba(255, 255, 255, 0.05);
}

.actions {
    display: flex;
    gap: 5px;
}

button {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.edit-btn {
    background-color: #3498db;
    color: white;
}

.delete-btn {
    background-color: #e74c3c;
    color: white;
}

.save-btn {
    background-color: #2ecc71;
    color: white;
}

.cancel-btn {
    background-color: #7f8c8d;
    color: white;
}

.create-btn {
    background-color: #2ecc71;
    color: white;
    padding: 10px 20px;
    font-size: 1rem;
    margin-top: 10px;
}

.form-container {
    max-width: 600px;
    margin: 0 auto;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    color: #ddd;
}

.form-group input, .form-group select, .form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #333;
    border-radius: 4px;
    background-color: #121212;
    color: #fff;
}

.form-group textarea {
    height: 100px;
    resize: vertical;
}

.form-group.checkbox {
    display: flex;
    align-items: center;
    gap: 10px;
}

.form-group.checkbox input {
    width: auto;
}

.form-group.checkbox label {
    margin-bottom: 0;
}

.pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding: 10px 0;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* Responsive design */
@media (max-width: 768px) {
    .tabs {
        flex-direction: column;
    }
    
    .actions {
        flex-direction: column;
        gap: 5px;
    }
    
    th, td {
        padding: 8px 4px;
        font-size: 0.9rem;
    }
}
</style>