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

const value = ref(0);
</script>

<template>
  <main class="d-flex pa-2 w-100">
    <div class="pa-1 d-none d-md-block w-100 w-md-33"
    :class="{'d-block': value === 0}">
      <h3 class="d-none d-md-block">Current Tasks</h3>
      <tiptap v-model="currentTasks" />
    </div>
    <div class="pa-1 d-none d-md-block w-100 w-md-33"
         :class="{'d-block': value === 1}">
      <h3 class="d-none d-md-block">Future Tasks</h3>
      <tiptap v-model="futureTasks" />
    </div>
    <div class="pa-1 d-none d-md-block w-100 w-md-33"
         :class="{'d-block': value === 2}">
      <h3 class="d-none d-md-block">Buy list</h3>
      <tiptap v-model="toBuyList" />
    </div>
  </main>
  <footer class="d-block d-md-none">
    <v-layout class="overflow-visible" style="height: 56px;">
      <v-bottom-navigation
        v-model="value"
        color="primary"
        active
      >
        <v-btn>
          <v-icon>mdi-history</v-icon>

          Current Tasks
        </v-btn>

        <v-btn>
          <v-icon>mdi-heart</v-icon>

          Future Tasks
        </v-btn>

        <v-btn>
          <v-icon>mdi-map-marker</v-icon>

          <span>Buy list</span>
        </v-btn>
      </v-bottom-navigation>
    </v-layout>
  </footer>
</template>
