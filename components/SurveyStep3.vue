<template>
  <div class="max-w-2xl mx-auto p-6">
    <!-- Step Title -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-4">Évaluation des critères</h2>
      <p class="text-gray-600 mb-4">
        Évaluez chacun des critères suivants en attribuant une note de 1 (très
        insatisfait) à 10 (très satisfait) selon votre ressenti et expérience au
        sein de l’entreprise. Soyez sincère, vos réponses resteront anonymes.
      </p>
    </div>

    <!-- Ratings Input -->
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
          v-model.number="store.ratings[item.id]"
          min="1"
          max="10"
          class="w-20 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>

    <!-- Validation Message -->
    <div class="mt-8">
      <p v-if="!canSubmit" class="text-red-500 text-sm">
        Veuillez évaluer tous les critères avec une note entre 1 et 10 avant de
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useSurveyStore } from "@/stores/survey";

const store = useSurveyStore();

onMounted(() => {
  // Ensure all ratings are initialized to 0
  store.questions.forEach((q) => {
    if (store.ratings[q.id] === undefined) {
      store.ratings[q.id] = 0;
    }
  });
});

// Validation for submission
const canSubmit = computed(() =>
  store.questions.every(
    (q) =>
      store.ratings[q.id] >= 1 &&
      store.ratings[q.id] <= 10 &&
      store.ratings[q.id] !== null
  )
);

// Submit results and transition to the next step
const submitResults = async () => {
  if (canSubmit.value) {
    try {
      await store.submitSurvey(); // Call the store function to send results
      store.nextStep(); // Transition to the next step
    } catch (error) {
      console.error("Erreur lors de l'envoi des résultats:", error);
    }
  }
};
</script>
