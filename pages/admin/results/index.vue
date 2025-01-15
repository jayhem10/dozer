<template>
  <div class="max-w-4xl mx-auto p-6 mt-10">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Résultats des sondages</h1>
      <button
        v-tippy="'Retour'"
        @click="backToAdmin"
        class="bg-gray-500 text-white px-4 py-2 rounded-md shadow hover:bg-gray-600 transition"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
      </button>
    </div>
    <div class="relative mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher par nom ou description"
        class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200 pr-10"
      />
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
      >
        <font-awesome-icon :icon="['fas', 'times']" />
      </button>
    </div>

    <ResultsList :surveys="filteredSurveys" :isLoading="isLoading" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useSurveyStore } from "@/stores/survey";
import { navigateTo } from "nuxt/app";

import ResultsList from "@/components/admin/ResultsList.vue";

const isLoading = ref(false);
const searchQuery = ref("");

const store = useSurveyStore();

const { fetchSurveys } = store;

const clearSearch = () => {
  searchQuery.value = "";
};

const filteredSurveys = computed(() => store.filteredSurveys);

onMounted(async () => {
  try {
    isLoading.value = true;
    await fetchSurveys();
  } catch (error) {
    console.error("Erreur lors du chargement des sondages :", error);
  } finally {
    isLoading.value = false;
  }
});

watch(searchQuery, (newQuery) => {
  store.filterSurveys(newQuery);
});

const backToAdmin = () => {
  navigateTo("/admin");
};
</script>
