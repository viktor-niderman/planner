<script setup>
import { onMounted, ref } from 'vue'

const text1 = ref('');
const text2 = ref('');
const text3 = ref('');

const save = () => {
  const data = JSON.stringify({
    text1: text1.value,
    text2: text2.value,
    text3: text3.value,
  });
  localStorage.setItem('store', data);
  fetch('https://api.niderman.pro/api/planners', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error:' + response.statusText);
    }
    return response.json();
  })
  .then(planner => {
    console.log('Clan created:', planner);
  })
  .catch(error => {
    console.log(error)
    alert('Error');
  });
}

const load = () => {
  const data = localStorage.getItem('store');
  if (data) {
    const parsed = JSON.parse(data);
    text1.value = parsed.text1;
    text2.value = parsed.text2;
    text3.value = parsed.text3;
  }


  fetch('https://api.niderman.pro/api/planners/latest')
  .then(response => {
    if (!response.ok) {
      throw new Error('Not found');
    }
    return response.json();
  })
  .then(planner => {
    const lastPlan = JSON.parse(planner.data);
    text1.value = lastPlan.text1;
    text2.value = lastPlan.text2;
    text3.value = lastPlan.text3;
    console.log('Last plan:', planner);
  })
  .catch(error => {
    console.error('Error:', error);
  });
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
