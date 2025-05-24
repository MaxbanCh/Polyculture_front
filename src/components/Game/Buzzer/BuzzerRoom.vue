<script setup lang="ts">
import Buzzer from './Buzzer.vue';
import { defineEmits } from 'vue';
const emit = defineEmits(["buzz-submitted"]);

function handleBuzz() {
    // handle the buzz event here
}

</script>

<template>
    <div id="buzz-room">
        <Buzzer @buzz-submitted="handleBuzz" />
        <input type="text" id="pseudo" placeholder="Pseudo" />
    </div>
</template>