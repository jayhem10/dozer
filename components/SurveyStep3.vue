<template>
  <div class="max-w-2xl mx-auto p-6">
    <!-- Loader -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <svg
        class="animate-spin h-8 w-8 text-blue-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        ></path>
      </svg>
      <p class="ml-4 text-blue-500 font-medium">Chargement des questions...</p>
    </div>

    <!-- Form Content -->
    <div v-else>
      <!-- Step Title -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Évaluation des critères</h2>
        <p class="text-gray-600 mb-4">
          Évaluez chacun des critères suivants en attribuant une note de 1 (très
          insatisfait) à 10 (très satisfait) selon votre ressenti et expérience
          au sein de l’entreprise. Soyez sincère, vos réponses resteront
          anonymes.
        </p>
      </div>

      <!-- Ratings Input -->
      <div class="space-y-6">
        <div
          v-for="item in store.questions"
          :key="item.id"
          class="bg-white p-4 rounded-lg shadow-sm"
        >
          <div class="mb-4">
            <label :for="item.id" class="block text-lg font-medium">
              {{ item.text }}
            </label>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">0</span>
            <input
              type="range"
              :id="item.id"
              v-model.number="store.ratings[item.id]"
              min="0"
              max="10"
              step="1"
              class="flex-1 appearance-none h-2 bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-500">10</span>
          </div>
          <div class="mt-2 text-center">
            <span class="text-lg font-medium text-gray-800">
              Score : {{ store.ratings[item.id] }}
            </span>
          </div>
        </div>
      </div>

      <!-- Validation Message -->
      <div class="mt-8">
        <p v-if="!canSubmit" class="text-red-500 text-sm">
          Veuillez évaluer tous les critères avec une note d'au moins 1 avant de
          continuer.
        </p>
      </div>

      <!-- Submit Button -->
      <div class="mt-8 flex justify-end">
        <button
          :disabled="!canSubmit"
          @click="submitResults"
          class="px-6 py-2 rounded text-white font-bold transition-all"
          :class="{
            'bg-green-600 hover:bg-green-700': canSubmit,
            'bg-gray-400 cursor-not-allowed': !canSubmit,
          }"
        >
          Soumettre
        </button>
      </div>

      <!-- Fixed Modal -->
      <div
        class="fixed top-1/2 right-4 transform -translate-y-1/2 bg-white shadow-lg p-4 rounded-lg border"
        :class="{
          'border-green-500': canSubmit,
          'border-red-500': !canSubmit,
        }"
      >
        <p
          :class="{
            'text-green-500': canSubmit,
            'text-red-500': !canSubmit,
          }"
          class="font-bold"
        >
          {{
            canSubmit
              ? "Formulaire prêt à être soumis"
              : "Évaluation incomplète"
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useSurveyStore } from "@/stores/survey";

const store = useSurveyStore();
const isLoading = ref(true);

onMounted(async () => {
  try {
    await store.fetchQuestions(); // Charge les questions
    // Initialiser tous les scores à 0
    store.questions.forEach((q) => {
      if (store.ratings[q.id] === undefined) {
        store.ratings[q.id] = 0;
      }
    });
  } catch (error) {
    console.error("Erreur lors du chargement des questions :", error);
  } finally {
    isLoading.value = false; // Fin du chargement
  }
});

const canSubmit = computed(() =>
  store.questions.every(
    (q) => store.ratings[q.id] >= 1 && store.ratings[q.id] <= 10
  )
);

const submitResults = async () => {
  if (canSubmit.value) {
    try {
      await store.submitSurvey();
      store.nextStep();
    } catch (error) {
      console.error("Erreur lors de l'envoi des résultats :", error);
    }
  }
};
</script>
