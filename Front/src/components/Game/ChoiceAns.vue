<script setup lang="ts">
console.log("Hello from Choice Answer!")

</script>

<template>
    <div>
        <input type="radio" id="answer1" name="answer" value="answer1">
        <label for="answer1">Réponse 1</label><br>
        <input type="radio" id="answer2" name="answer" value="answer2">
        <label for="answer2">Réponse 2</label><br>
        <input type="radio" id="answer3" name="answer" value="answer3">
        <label for="answer3">Réponse 3</label><br>
        <input type="radio" id="answer4" name="answer" value="answer4">
        <label for="answer4">Réponse 4</label><br>
        <button id="submit">Valider</button>
    </div>    
</template>