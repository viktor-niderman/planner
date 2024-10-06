<script setup>
import { onMounted, ref } from 'vue'
import { loadFromBackend, saveToBackend } from '@/helpers/backend.js'

const currentTasks = ref('');
const futureTasks = ref('');
const toBuyList = ref('');

const save = () => {
  const data = JSON.stringify({
    currentTasks: currentTasks.value,
    futureTasks: futureTasks.value,
    toBuyList: toBuyList.value,
  });
  saveToBackend(data);
}

const load = () => {
  loadFromBackend().then(data => {
    currentTasks.value = data.currentTasks;
    futureTasks.value = data.futureTasks;
    toBuyList.value = data.toBuyList;
  })
}

onMounted(() => {
  load();
})

</script>

<template>
  <main class="d-flex pa-2">
    <div class="flex-grow-1 pa-1">
      <h3>Current Tasks</h3>
      <v-textarea v-model="currentTasks" @input="save" label="Label" rows="40"></v-textarea>
    </div>
    <div class="flex-grow-1 pa-1">
      <h3>Future Tasks</h3>
      <v-textarea v-model="futureTasks" @input="save" label="Label" rows="40"></v-textarea>
    </div>
    <div class="flex-grow-1 pa-1">
      <h3>Buy list</h3>
      <v-textarea v-model="toBuyList" @input="save" label="Label" rows="40"></v-textarea>
    </div>

  </main>
</template>
