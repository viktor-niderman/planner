<script setup>
import { onMounted, ref, watch } from 'vue'
import { loadFromBackend, saveToBackend } from '@/helpers/backend.js'
import Tiptap from '@/components/Tiptap.vue'

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

watch(currentTasks, () => {
  save();
})
watch(futureTasks, () => {
  save();
})
watch(toBuyList, () => {
  save();
})

</script>

<template>
  <main class="d-flex pa-2 w-100">

    <div class="pa-1 w-33">
      <h3>Current Tasks</h3>
      <tiptap v-model="currentTasks" />
    </div>
    <div class="w-33 pa-1">
      <h3>Future Tasks</h3>
      <tiptap v-model="futureTasks" />
    </div>
    <div class="w-33 pa-1">
      <h3>Buy list</h3>
      <tiptap v-model="toBuyList" />
    </div>
  </main>
</template>
