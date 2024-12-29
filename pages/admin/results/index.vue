<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Résultats des sondages</h1>
      <button
        @click="backToAdmin"
        class="bg-gray-500 text-white px-4 py-2 rounded-md shadow hover:bg-gray-600 transition"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
      </button>
    </div>
    <!-- Search Bar -->
    <div class="relative mb-4">
      <input
        v-model="searchQuery"
        @input="fetchSurveys"
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

    <!-- Results List -->
    <ResultsList :surveys="filteredSurveys" :isLoading="isLoading" />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useSupabaseClient } from "#imports";
import ResultsList from "@/components/admin/ResultsList.vue";

const supabase = useSupabaseClient();
const isLoading = ref(true);
const surveys = ref([]);
const searchQuery = ref("");

const fetchSurveys = async () => {
  isLoading.value = true;

  try {
    const { data, error } = await supabase
      .from("surveys")
      .select("*")
      .order("is_active", { ascending: false });

    if (error) {
      console.error("Erreur lors de la récupération des enquêtes :", error);
    } else {
      surveys.value = data || [];
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const clearSearch = () => {
  searchQuery.value = "";
};

const filteredSurveys = computed(() => {
  if (!searchQuery.value.trim()) {
    return surveys.value;
  }
  return surveys.value.filter((survey) =>
    [survey.title, survey.description]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.value.trim().toLowerCase())
  );
});

fetchSurveys();

const backToAdmin = () => {
  navigateTo("/admin");
};
</script>
