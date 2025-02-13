<template>
  <div class="max-h-screen flex flex-col p-2">
    <div v-if="isLoading" class="flex-grow flex justify-center items-center">
      <div
        class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <div v-else class="flex flex-col h-full">
      <div class="bg-white p-3 rounded-lg shadow-sm">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-lg font-bold">Pondération des critères</h2>
            <div class="flex gap-4 text-xs text-gray-600 mt-1">
              <span>0: Pas important</span>
              <span>1: Peu important</span>
              <span>2: Important</span>
              <span>3: Très important</span>
            </div>
          </div>
        </div>
        <div class="bg-blue-50 p-2 rounded-md text-xs text-blue-700 mt-2">
          <p>
            Vous devez atteindre entre 102 et 103 points pour valider vos
            réponses.
          </p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto my-4">
        <div class="grid gap-2">
          <div
            v-for="item in weightingQuestions"
            :key="item.id"
            class="bg-white p-3 rounded-lg shadow-sm"
          >
            <div class="flex items-center justify-between gap-4">
              <label :for="item.id" class="text-sm font-medium flex-grow">
                {{ item.weighting }}
              </label>
              <div class="flex items-center gap-2 min-w-[200px]">
                <input
                  type="range"
                  :id="item.id"
                  v-model.number="store.weights[item.id]"
                  min="0"
                  max="3"
                  step="1"
                  class="flex-1 h-2 bg-gray-200 rounded-full"
                  @input="store.calculateTotalPoints"
                />
                <span
                  class="w-6 text-center font-medium"
                  :class="{
                    'text-red-500': store.weights[item.id] === 0,
                    'text-green-500': store.weights[item.id] > 0,
                  }"
                >
                  {{ store.weights[item.id] }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-3 rounded-lg shadow-sm">
        <div class="flex justify-between items-center">
          <div :class="pointsClass" class="px-4 py-2 rounded-md">
            <p class="font-bold">Total : {{ store.totalPoints.toFixed(2) }}</p>
            <p v-if="!store.isValidPoints" class="text-xs mt-1 text-red-500">
              {{ pointsMessage }}
            </p>
          </div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useSurveyStore } from "~/stores/survey";

const store = useSurveyStore();
const isLoading = ref(true);

// Filtrer et trier les questions avec weighting
const weightingQuestions = computed(() => {
  return store.questions
    .filter((q) => q.weighting && q.weighting.trim() !== "")
    .sort((a, b) => a.position - b.position);
});

onMounted(async () => {
  try {
    await store.fetchQuestions();
    // Initialiser les poids uniquement pour les questions avec weighting
    weightingQuestions.value.forEach((q) => {
      if (store.weights[q.id] === undefined) {
        store.weights[q.id] = 0;
      }
      // Stocker le texte de la question pour l'envoi final
      store.weightingTexts[q.id] = q.weighting;
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
