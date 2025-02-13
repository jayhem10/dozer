<template>
  <div class="max-h-screen flex flex-col p-4">
    <div v-if="isLoading" class="flex-grow flex justify-center items-center">
      <div
        class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <div v-else class="flex flex-col h-full">
      <!-- En-tête compact -->
      <div class="bg-white p-3 rounded-lg shadow-sm">
        <h2 class="text-lg font-bold">Évaluation des critères</h2>
        <p class="text-xs text-gray-600 mt-1">
          Évaluez chacun des critères suivants en attribuant une note de 0 (très
          insatisfait) à 10 (très satisfait) selon votre ressenti.
        </p>
      </div>

      <!-- Liste des questions -->
      <div class="flex-1 overflow-y-auto my-4">
        <div class="grid gap-2">
          <div
            v-for="item in filteredQuestions"
            :key="item.id"
            class="bg-white p-4 rounded-lg shadow-sm"
          >
            <div class="flex items-center justify-between gap-4">
              <label :for="item.id" class="text-sm font-medium flex-grow">
                {{ item.rating }}
              </label>
              <div class="flex items-center gap-2 min-w-[200px]">
                <span class="text-xs text-gray-500">0</span>
                <input
                  type="range"
                  :id="item.id"
                  v-model.number="store.ratings[item.id]"
                  min="0"
                  max="10"
                  step="1"
                  class="flex-1 h-2 bg-gray-200 rounded-full"
                />
                <span class="text-xs text-gray-500">10</span>
                <span
                  class="w-6 text-center font-medium"
                  :class="{
                    'text-red-500': store.ratings[item.id] === 0,
                    'text-green-500': store.ratings[item.id] > 0,
                  }"
                >
                  {{ store.ratings[item.id] }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bloc de validation avec avertissement intégré -->
      <div class="bg-white p-3 rounded-lg shadow-sm">
        <div class="flex justify-between items-center">
          <div v-if="hasAllZeros" class="px-4 py-2 bg-yellow-50 rounded-md">
            <p class="text-yellow-600 font-bold text-sm">
              Attention : tous les scores sont à 0
            </p>
          </div>
          <div v-else class="w-8"></div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useSurveyStore } from "@/stores/survey";
import type { Question } from "@/stores/survey";
import Swal from "sweetalert2";

const store = useSurveyStore();
const isLoading = ref(true);

onMounted(async () => {
  try {
    store.questions.forEach((q: Question) => {
      if (store.ratings[q.id] === undefined) {
        store.ratings[q.id] = 0;
      }
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    console.error("Erreur lors du chargement des questions :", error);
  } finally {
    isLoading.value = false;
  }
});

const canSubmit = computed(() =>
  store.questions.every(
    (q: Question) => store.ratings[q.id] >= 0 && store.ratings[q.id] <= 10
  )
);

const hasAllZeros = computed(() =>
  store.questions.every((q: Question) => store.ratings[q.id] === 0)
);

const filteredQuestions = computed(() =>
  store.questions
    .filter((q: Question) => q.rating)
    .sort((a, b) => a.position - b.position)
);

const submitResults = async () => {
  if (canSubmit.value) {
    if (hasAllZeros.value) {
      const result = await Swal.fire({
        title: "Attention",
        text: "Tous les scores sont à 0. Voulez-vous vraiment valider ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Oui, valider",
        cancelButtonText: "Annuler",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      });

      if (result.isConfirmed) {
        try {
          await store.submitSurvey();
          store.nextStep();
        } catch (error) {
          console.error("Erreur lors de l'envoi des résultats :", error);
        }
      }
    } else {
      try {
        await store.submitSurvey();
        store.nextStep();
      } catch (error) {
        console.error("Erreur lors de l'envoi des résultats :", error);
      }
    }
  }
};
</script>
