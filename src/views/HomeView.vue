<script setup>
import { onBeforeMount, onMounted, ref, watch } from 'vue'
import { loadFromBackend, saveToBackend } from '@/helpers/backend.js'
import Tiptap from '@/components/Tiptap.vue'
import Pusher from 'pusher-js'
import { useUserStore } from '@/stores/user.js'

const currentTasks = ref('');
const futureTasks = ref('');
const toBuyList = ref('');
const uuid = useUserStore().uuid;
const dontNeedToSave = ref(true);

const save = () => {
  const data = JSON.stringify({
    currentTasks: currentTasks.value,
    futureTasks: futureTasks.value,
    toBuyList: toBuyList.value,
  });
  saveToBackend(data, uuid);
}

const load = () => {
  loadFromBackend().then(data => {
    loadToStorage(data);
  })
}

const loadToStorage = (data) => {
  dontNeedToSave.value = true;
  currentTasks.value = data.currentTasks;
  futureTasks.value = data.futureTasks;
  toBuyList.value = data.toBuyList;
  setTimeout(() => {
    dontNeedToSave.value = false;
  }, 200);
}


const pusherListener = () => {
  // Pusher.logToConsole = true;

  const pusher = new Pusher('bc27d3057fdb26d91571', {
    cluster: 'eu'
  });

  const channel = pusher.subscribe('planner_updated');
  channel.bind('planner.updated', function(data) {
    const newPlannerJson = data.message.planner.data;
    if (!newPlannerJson || data.message.uuid === uuid) {
      return;
    }
    const newPlanner = JSON.parse(newPlannerJson);
    loadToStorage(newPlanner);
  });
}

onBeforeMount(() => {
  load();
  pusherListener();
})

onMounted(() => {
  dontNeedToSave.value = false;
})


watch(currentTasks, (newValue, oldValue) => {
  if (oldValue === '' || oldValue === newValue || dontNeedToSave.value) {
    return
  }
  save();
})
watch(futureTasks, (newValue, oldValue) => {
  if (oldValue === '' || oldValue === newValue) {
    return
  }
  save();
})
watch(toBuyList, (newValue, oldValue) => {
  if (oldValue === '' || oldValue === newValue) {
    return
  }
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
