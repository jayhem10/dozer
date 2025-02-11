<template>
  <div class="max-w-2xl mx-auto p-6">
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <div v-else>
      <div class="mb-8 bg-white p-6 rounded-lg shadow-sm">
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
            Vous devez atteindre entre 102 et 103 points pour valider vos
            réponses. Ajustez les notes attribuées pour rester dans cette
            fourchette.
          </p>
        </div>
      </div>

      <div class="space-y-4">
        <div
          v-for="item in store.questions"
          :key="item.id"
          class="flex flex-col gap-4 bg-white p-4 rounded-lg shadow-sm"
        >
          <label :for="item.id" class="text-lg font-medium">
            {{ item.text }}
          </label>

          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-500">0</span>
            <input
              type="range"
              :id="item.id"
              v-model.number="store.weights[item.id]"
              min="0"
              max="3"
              step="1"
              class="flex-1 appearance-none h-2 bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="store.calculateTotalPoints"
            />
            <span class="text-sm text-gray-500">3</span>
          </div>

          <div
            class="text-center text-lg"
            :class="{
              'text-red-500': store.weights[item.id] === 0,
              'text-green-500': store.weights[item.id] > 0,
            }"
          >
            Score attribué : {{ store.weights[item.id] }}
          </div>
        </div>
      </div>

      <div class="mt-8 p-4 rounded" :class="pointsClass">
        <p class="font-bold">
          Total des points : {{ store.totalPoints.toFixed(2) }}
        </p>
        <p v-if="!store.isValidPoints" class="text-sm mt-2">
          {{ pointsMessage }}
        </p>
      </div>

      <div class="mt-8 flex justify-end">
        <button
          :disabled="!canProceed"
          @click="handleNextStep"
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

    <div
      class="fixed top-1/2 right-10 transform -translate-y-1/2 bg-white shadow-lg p-4 rounded-lg border"
      :class="{
        'border-green-500': store.isValidPoints,
        'border-red-500': !store.isValidPoints,
      }"
    >
      <p
        class="font-bold"
        :class="{
          'text-green-500': store.isValidPoints,
          'text-red-500': !store.isValidPoints,
        }"
      >
        {{ store.isValidPoints ? "Score valide" : "Score invalide" }}
      </p>
      <p class="mt-2 text-gray-600">
        Total : {{ store.totalPoints.toFixed(2) }}
      </p>
      <p v-if="!store.isValidPoints" class="text-sm text-red-500">
        {{ pointsMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useSurveyStore } from "~/stores/survey";

const store = useSurveyStore();
const isLoading = ref(true);

onMounted(async () => {
  try {
    await store.fetchQuestions();
    store.questions.forEach((q) => {
      if (store.weights[q.id] === undefined) {
        store.weights[q.id] = 0;
      }
    });
    store.calculateTotalPoints();
  } catch (error) {
    console.error("Erreur lors du chargement des questions :", error);
  } finally {
    isLoading.value = false;
  }
});

const pointsClass = computed(() => {
  if (!store.totalPoints) return "bg-white";
  return store.isValidPoints ? "bg-green-100" : "bg-red-100";
});

const pointsMessage = computed(() => {
  if (store.totalPoints < 102) {
    return "Vous devez atteindre au moins 102 points.";
  }
  if (store.totalPoints > 103) {
    return "Vous avez dépassé 103 points, veuillez ajuster vos réponses.";
  }
  return "";
});

const canProceed = computed(
  () => store.isValidPoints && store.areAllWeightsSet
);

function handleNextStep() {
  store.nextStep();
}
</script>
