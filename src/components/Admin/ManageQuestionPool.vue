<script setup lang="ts">
import { ref, onMounted } from "vue";

interface Question {
    id: number;
    question: string;
    answer: string;
    theme?: string;
    subtheme?: string;
    [key: string]: any;
}

const pools = ref<{ id: number; name: string; description?: string; is_public?: boolean; question_count?: number; questions?: any }[]>([]);
const questions = ref<Question[]>([]);
const selectedQuestions = ref<number[]>([]);
const errorMessage = ref("");
const wait = ref(true);

// Variables pour l'ajout de pool
const newPoolName = ref("");
const newPoolDescription = ref("");
const isPublic = ref(false);

// Variables pour la modification
const editingPool = ref<number | null>(null);
const editPoolName = ref("");
const editPoolDescription = ref("");
const editIsPublic = ref(false);
const showAddQuestions = ref(false);
const currentPoolId = ref<number | null>(null);
const searchQuery = ref("");
const filteredQuestions = ref<Question[]>([]);

// Pagination des questions
const questionPage = ref(1);
const totalQuestionPages = ref(1);

async function fetchPools() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        errorMessage.value = "Vous n'êtes pas connecté";
        wait.value = false;
        return;
    }

    fetch("https://polyculture-back.axithem.fr/questionpool", {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    })
    .then(async (response) => {
        if (response.ok) {
            pools.value = await response.json();
            wait.value = false;
        } else {
            errorMessage.value = "Erreur lors de la récupération des pools";
            wait.value = false;
        }
    })
    .catch((error) => {
        console.error("Erreur lors de la récupération des pools:", error);
        errorMessage.value = "Erreur lors de la récupération des pools";
        wait.value = false;
    });
}

async function fetchAllQuestions(page = 1) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        errorMessage.value = "Vous n'êtes pas connecté";
        return;
    }

    const url = new URL("https://polyculture-back.axithem.fr/question");
    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", "50");

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
        if (response.ok) {
            const result = await response.json();
            questions.value = result.questions;
            questionPage.value = result.currentPage;
            totalQuestionPages.value = result.totalPages;
            updateFilteredQuestions();
        } else {
            errorMessage.value = "Erreur lors de la récupération des questions";
        }
    })
    .catch((error) => {
        console.error("Erreur lors de la récupération des questions:", error);
        errorMessage.value = "Erreur lors de la récupération des questions";
    });
}

function updateFilteredQuestions() {
    if (!searchQuery.value.trim()) {
        filteredQuestions.value = questions.value;
        return;
    }

    const query = searchQuery.value.toLowerCase();
    filteredQuestions.value = questions.value.filter(q => 
        q.question.toLowerCase().includes(query) || 
        q.theme?.toLowerCase().includes(query) ||
        q.subtheme?.toLowerCase().includes(query)
    );
}

async function fetchPoolQuestions(poolId : number) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        errorMessage.value = "Vous n'êtes pas connecté";
        return;
    }

    fetch(`https://polyculture-back.axithem.fr/questionpool/${poolId}/questions`, {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    })
    .then(async (response) => {
        if (response.ok) {
            const pool = pools.value.find(p => p.id === poolId);
            if (pool) {
                pool.questions = await response.json();
                console.log("Questions du pool récupérées:", pool.questions);
            }
        } else {
            errorMessage.value = "Erreur lors de la récupération des questions du pool";
        }
    })
    .catch((error) => {
        console.error("Erreur lors de la récupération des questions du pool:", error);
        errorMessage.value = "Erreur lors de la récupération des questions du pool";
    });
}

async function createPool() {
    const token = localStorage.getItem('auth_token');
    if (!token || !newPoolName.value) {
        errorMessage.value = "Veuillez renseigner au moins un nom pour le pool";
        return;
    }

    try {
        const response = await fetch("https://polyculture-back.axithem.fr/questionpool", {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: newPoolName.value,
                user_id: "admin",
                description: newPoolDescription.value,
                is_public: isPublic.value
            }),
        });
        
        if (response.ok) {
            fetchPools();
            newPoolName.value = "";
            newPoolDescription.value = "";
            isPublic.value = false;
            
            errorMessage.value = "Pool créé avec succès";
            setTimeout(() => {
                errorMessage.value = "";
            }, 2000);
        } else {
            errorMessage.value = "Erreur lors de la création du pool";
        }
    } catch (error) {
        console.error("Erreur lors de la création du pool:", error);
        errorMessage.value = "Erreur lors de la création du pool";
    }
}

async function deletePool(id : number) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        errorMessage.value = "Vous n'êtes pas connecté";
        return;
    }

    if (!confirm("Êtes-vous sûr de vouloir supprimer ce pool de questions ?")) {
        return;
    }

    try {
        const response = await fetch(`https://polyculture-back.axithem.fr/questionpool/${id}`, {
            method: "DELETE",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        
        if (response.ok) {
            fetchPools(); 
            errorMessage.value = "Pool supprimé avec succès";
            setTimeout(() => {
                errorMessage.value = "";
            }, 2000);
        } else {
            errorMessage.value = "Erreur lors de la suppression du pool";
        }
    } catch (error) {
        console.error("Erreur lors de la suppression du pool:", error);
        errorMessage.value = "Erreur lors de la suppression du pool";
    }
}

function startEdit(pool: { id: number; name: string; description?: string; is_public?: boolean; question_count?: number; questions?: any }) {
    editingPool.value = pool.id;
    editPoolName.value = pool.name;
    editPoolDescription.value = pool.description || "";
    editIsPublic.value = pool.is_public ?? false;
    fetchPoolQuestions(pool.id);
}

async function saveEdit(id : number) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        errorMessage.value = "Vous n'êtes pas connecté";
        return;
    }

    try {
        const response = await fetch(`https://polyculture-back.axithem.fr/questionpool/${id}`, {
            method: "PUT",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: editPoolName.value,
                description: editPoolDescription.value,
                is_public: editIsPublic.value
            }),
        });
        
        if (response.ok) {
            editingPool.value = null;
            fetchPools();
            errorMessage.value = "Pool modifié avec succès";
            setTimeout(() => {
                errorMessage.value = "";
            }, 2000);
        } else {
            errorMessage.value = "Erreur lors de la modification du pool";
        }
    } catch (error) {
        console.error("Erreur lors de la modification du pool:", error);
        errorMessage.value = "Erreur lors de la modification du pool";
    }
}

function cancelEdit() {
    editingPool.value = null;
    showAddQuestions.value = false;
    selectedQuestions.value = [];
}

function openAddQuestionsModal(poolId : number) {
    currentPoolId.value = poolId;
    showAddQuestions.value = true;
    fetchAllQuestions();
    selectedQuestions.value = [];
}

function toggleQuestionSelection(questionId : number) {
    const index = selectedQuestions.value.indexOf(questionId);
    if (index === -1) {
        selectedQuestions.value.push(questionId);
    } else {
        selectedQuestions.value.splice(index, 1);
    }
}

async function addQuestionsToPool() {
    const token = localStorage.getItem('auth_token');
    if (!token || !currentPoolId.value || selectedQuestions.value.length === 0) {
        errorMessage.value = "Veuillez sélectionner au moins une question";
        return;
    }

    try {
        const response = await fetch(`https://polyculture-back.axithem.fr/questionpool/${currentPoolId.value}/questions`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                question_ids: selectedQuestions.value
            }),
        });
        
        if (response.ok) {
            showAddQuestions.value = false;
            selectedQuestions.value = [];
            fetchPoolQuestions(currentPoolId.value);
            errorMessage.value = "Questions ajoutées avec succès";
            setTimeout(() => {
                errorMessage.value = "";
            }, 2000);
        } else {
            errorMessage.value = "Erreur lors de l'ajout des questions";
        }
    } catch (error) {
        console.error("Erreur lors de l'ajout des questions:", error);
        errorMessage.value = "Erreur lors de l'ajout des questions";
    }
}

async function removeQuestionFromPool(poolId : number, questionId : number) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        errorMessage.value = "Vous n'êtes pas connecté";
        return;
    }

    try {
        const response = await fetch(`https://polyculture-back.axithem.fr/questionpool/${poolId}/questions/${questionId}`, {
            method: "DELETE",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        
        if (response.ok) {
            fetchPoolQuestions(poolId);
            errorMessage.value = "Question retirée avec succès";
            setTimeout(() => {
                errorMessage.value = "";
            }, 2000);
        } else {
            errorMessage.value = "Erreur lors du retrait de la question";
        }
    } catch (error) {
        console.error("Erreur lors du retrait de la question:", error);
        errorMessage.value = "Erreur lors du retrait de la question";
    }
}

onMounted(() => {
    wait.value = true;
    fetchPools();
});
</script>

<template>
    <div class="manage-pool">
        <h1>Gestion des pools de questions</h1>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div v-if="wait" class="loading">Chargement...</div>
        <div v-else>
            <h2>Liste des pools</h2>
            <div class="table-container">
                <table class="pools-table">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Description</th>
                            <th>Nombre de questions</th>
                            <th>Public</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="pool in pools" :key="pool.id">
                            <!-- Mode affichage normal -->
                            <template v-if="editingPool !== pool.id">
                                <td>{{ pool.name }}</td>
                                <td>{{ pool.description || 'Aucune description' }}</td>
                                <td>{{ pool.question_count || 0 }}</td>
                                <td>{{ pool.is_public ? 'Oui' : 'Non' }}</td>
                                <td class="actions">
                                    <button class="edit-btn" @click="startEdit(pool)">Modifier</button>
                                    <button class="add-btn" @click="openAddQuestionsModal(pool.id)">Ajouter des questions</button>
                                    <button class="delete-btn" @click="deletePool(pool.id)">Supprimer</button>
                                </td>
                            </template>
                            
                            <!-- Mode édition -->
                            <template v-else>
                                <td><input v-model="editPoolName" placeholder="Nom du pool" /></td>
                                <td><input v-model="editPoolDescription" placeholder="Description" /></td>
                                <td>{{ pool.question_count || 0 }}</td>
                                <td><input type="checkbox" v-model="editIsPublic" /></td>
                                <td class="actions">
                                    <button class="save-btn" @click="saveEdit(pool.id)">Enregistrer</button>
                                    <button class="cancel-btn" @click="cancelEdit">Annuler</button>
                                </td>
                            </template>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Affichage des questions du pool en cours d'édition -->
            <div v-if="editingPool !== null" class="pool-questions">
                <h3>Questions dans ce pool</h3>
                <div class="table-container">
                    <table class="questions-table">
                        <thead>
                            <tr>
                                <th>Question</th>
                                <th>Réponse</th>
                                <th>Thème</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="question in pools.find(p => p.id === editingPool)?.questions.questions || []" :key="question.id">
                                <td>{{ question.question }}</td>
                                <td>{{ question.answer }}</td>
                                <td>{{ question.theme || 'Non défini' }}</td>
                                <td class="actions">
                                    <button class="delete-btn" @click="removeQuestionFromPool(editingPool, question.id)">Retirer</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <h2>Ajouter un nouveau pool</h2>
            <div class="add-pool-form">
                <div class="form-group">
                    <label for="new-pool-name">Nom:</label>
                    <input id="new-pool-name" type="text" v-model="newPoolName" placeholder="Nom du pool" />
                </div>
                
                <div class="form-group">
                    <label for="new-pool-description">Description:</label>
                    <textarea id="new-pool-description" v-model="newPoolDescription" placeholder="Description (optionnelle)"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="is-public">Public:</label>
                    <input id="is-public" type="checkbox" v-model="isPublic" />
                    <span class="checkbox-label">Rendre ce pool accessible à tous les utilisateurs</span>
                </div>
                
                <button class="add-btn" @click="createPool">Créer ce pool</button>
            </div>
            
            <div v-if="showAddQuestions" class="modal">
                <div class="modal-content">
                    <h2>Ajouter des questions</h2>
                    <div class="search-container">
                        <input 
                            type="text" 
                            v-model="searchQuery"
                            @input="updateFilteredQuestions"
                            placeholder="Rechercher des questions..."
                        />
                    </div>
                    <div class="table-container">
                        <table class="questions-table">
                            <thead>
                                <tr>
                                    <th width="30px">Sel.</th>
                                    <th>Question</th>
                                    <th>Réponse</th>
                                    <th>Thème</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="question in filteredQuestions" :key="question.id">
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            :checked="selectedQuestions.includes(question.id)"
                                            @change="toggleQuestionSelection(question.id)" 
                                        />
                                    </td>
                                    <td>{{ question.question }}</td>
                                    <td>{{ question.answer }}</td>
                                    <td>{{ question.theme || 'Non défini' }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="pagination">
                        <button 
                            :disabled="questionPage <= 1" 
                            @click="fetchAllQuestions(questionPage - 1)">
                            Précédent
                        </button>
                        <span>Page {{ questionPage }} sur {{ totalQuestionPages }}</span>
                        <button 
                            :disabled="questionPage >= totalQuestionPages" 
                            @click="fetchAllQuestions(questionPage + 1)">
                            Suivant
                        </button>
                    </div>
                    <div class="modal-actions">
                        <button class="add-btn" @click="addQuestionsToPool" :disabled="selectedQuestions.length === 0">
                            Ajouter les {{ selectedQuestions.length }} questions sélectionnées
                        </button>
                        <button class="cancel-btn" @click="cancelEdit">Annuler</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.manage-pool {
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

.pools-table, .questions-table {
    width: 100%;
    border-collapse: collapse;
}

.pools-table th, .pools-table td,
.questions-table th, .questions-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

.pools-table th, .questions-table th {
    background-color: #0d0d0d;
    position: sticky;
    top: 0;
}

.pools-table tr:nth-child(even), .questions-table tr:nth-child(even) {
    background-color: #070707;
}

.pools-table tr:hover, .questions-table tr:hover {
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

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

.add-pool-form {
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

.checkbox-label {
    margin-left: 10px;
    font-size: 0.9em;
}

.form-group input[type="text"], .form-group textarea, .form-group select {
    width: 100%;
    padding: 8px;
    border: 1px solid #333;
    border-radius: 4px;
    background-color: #121212;
    color: white;
}

.form-group textarea {
    height: 80px;
    resize: vertical;
}

.modal {
    position: fixed;
    z-index: 100;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: #0a0a0a;
    width: 90%;
    max-width: 900px;
    max-height: 80vh;
    padding: 20px;
    border-radius: 5px;
    overflow-y: auto;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}

.search-container {
    margin-bottom: 15px;
}

.search-container input {
    width: 100%;
    padding: 10px;
    border: 1px solid #333;
    border-radius: 4px;
    background-color: #121212;
    color: white;
}

.modal-actions {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
}

.pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
    padding: 10px 0;
}
</style>