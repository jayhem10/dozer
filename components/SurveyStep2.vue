<template>
  <div class="max-w-2xl mx-auto p-6">
    <!-- Loader -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <!-- Content -->
    <div v-else>
      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Pondération des critères</h2>
        <p class="text-gray-600 mb-4">
          Notez entre 0 et 3 l'importance de ces critères pour vous :
        </p>
        <ul class="list-disc ml-6 mb-6 text-gray-600">
          <li>0 - Pas important du tout</li>
          <li>1 - Peu important</li>
          <li>2 - Important</li>
          <li>3 - Très important</li>
        </ul>
        <div class="bg-blue-50 p-4 rounded-md text-sm text-blue-700">
          <p>
            À chaque fois que vous attribuerez une note, un certain nombre de
            points sera ajouté à votre compteur. Plus un critère sera important
            pour vous, plus le nombre de points sera important. Vous devez
            atteindre entre 102 et 103 points pour valider vos réponses.
          </p>
        </div>
      </div>

      <div class="space-y-4">
        <div
          v-for="item in store.questions"
          :key="item.id"
          class="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm"
        >
          <label :for="item.id" class="flex-1">{{ item.text }}</label>
          <input
            type="number"
            :id="item.id"
            v-model.number="store.weights[item.id]"
            min="0"
            max="3"
            class="w-20 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="store.calculateTotalPoints"
          />
        </div>
      </div>

      <!-- Points Feedback -->
      <div class="mt-8 p-4 rounded" :class="pointsClass">
        <p class="font-bold">
          Total des points: {{ store.totalPoints.toFixed(2) }}
        </p>
        <p v-if="!store.isValidPoints" class="text-sm mt-2">
          {{ pointsMessage }}
        </p>
      </div>

      <div class="mt-8 flex justify-end">
        <button
          :disabled="!canProceed"
          @click="nextStep"
          class="px-6 py-2 rounded text-white font-bold transition-all"
          :class="{
            'bg-blue-600 hover:bg-blue-700': canProceed,
            'bg-gray-400 cursor-not-allowed': !canProceed,
          }"
        >
          Suivant
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useSurveyStore } from "@/stores/survey";

const store = useSurveyStore();
const isLoading = ref(true);

onMounted(async () => {
  await store.fetchQuestions();
  isLoading.value = false;
});

const pointsClass = computed(() => {
  if (!store.totalPoints) return "bg-gray-100";
  return store.isValidPoints ? "bg-green-100" : "bg-red-100";
});

const pointsMessage = computed(() => {
  if (store.totalPoints < 102) {
    return "Vous devez atteindre au moins 102 points.";
  }
  return "Vous avez dépassé 103 points, veuillez ajuster vos réponses.";
});

// Button validation
const canProceed = computed(
  () => store.isValidPoints && store.areAllWeightsSet
);

// Proceed to the next step or submit the survey
function nextStep() {
  store.nextStep();
}
</script>
