<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import ws from '../../../utils/websocket'
import Buzzer from './Buzzer.vue';
import { defineEmits } from 'vue';
const emit = defineEmits(["buzz-submitted"]);

</script>

<template>
    <div id="buzz-room">
        <Buzzer @buzz-submitted="handleBuzz" />
        <input type="text" id="pseudo" placeholder="Pseudo" />
    </div>
</template>