<script setup>
import { onMounted, ref } from 'vue'
import { loadFromBackend, saveToBackend } from '@/helpers/backend.js'

const text1 = ref('');
const text2 = ref('');
const text3 = ref('');

const save = () => {
  const data = JSON.stringify({
    text1: text1.value,
    text2: text2.value,
    text3: text3.value,
  });
  saveToBackend(data);
}

const load = () => {
  loadFromBackend().then(data => {
    text1.value = data.text1;
    text2.value = data.text2;
    text3.value = data.text3;
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
      <v-textarea v-model="text1" @input="save" label="Label" rows="40"></v-textarea>
    </div>
    <div class="flex-grow-1 pa-1">
      <h3>Future Tasks</h3>
      <v-textarea v-model="text2" @input="save" label="Label" rows="40"></v-textarea>
    </div>
    <div class="flex-grow-1 pa-1">
      <h3>Buy list</h3>
      <v-textarea v-model="text3" @input="save" label="Label" rows="40"></v-textarea>
    </div>

  </main>
</template>
