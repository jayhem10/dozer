<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Gestion des sondages</h1>
      <div class="flex space-x-2">
        <button
          v-tippy="'Créer un sondage'"
          @click="createSurvey"
          class="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 transition"
        >
          <font-awesome-icon :icon="['fas', 'plus']" />
        </button>
        <button
          v-tippy="'Désactiver tous les sondages'"
          @click="deactivateAll"
          class="bg-orange-500 text-white px-4 py-2 rounded-md shadow hover:bg-orange-600 transition"
          :disabled="!hasActiveSurvey"
        >
          <font-awesome-icon :icon="['fas', 'power-off']" />
        </button>
        <button
          v-tippy="'Retour'"
          @click="backToAdmin"
          class="bg-gray-500 text-white px-4 py-2 rounded-md shadow hover:bg-gray-600 transition"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
        </button>
      </div>
    </div>

    <div class="relative mb-6">
      <input
        v-model="searchText"
        @input="filterSurveys"
        type="text"
        placeholder="Rechercher par titre ou description"
        class="w-full p-2 border border-gray-300 rounded pr-10"
      />
      <button
        v-if="searchText"
        @click="resetSearch"
        class="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
      >
        <font-awesome-icon :icon="['fas', 'times']" />
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <div v-else>
      <div
        v-if="filteredSurveys.length === 0"
        class="text-gray-600 text-center"
      >
        Aucun sondage disponible.
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="survey in filteredSurveys"
          :key="survey.id"
          class="p-4 bg-white shadow rounded-md flex justify-between items-center"
        >
          <div>
            <h2 class="text-lg font-semibold">{{ survey.title }}</h2>
            <p class="text-sm text-gray-600">{{ survey.description }}</p>
          </div>
          <div class="flex space-x-4 items-center">
            <!-- Button Voir les clés -->
            <button
              v-tippy="'Voir les clés'"
              @click="viewSurveyKeys(survey.id)"
              class="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 transition"
            >
              <font-awesome-icon :icon="['fas', 'key']" />
            </button>
            <button
              v-tippy="'Modifier'"
              @click="editSurvey(survey.id)"
              class="bg-yellow-500 text-white px-4 py-2 rounded-md shadow hover:bg-yellow-600 transition"
            >
              <font-awesome-icon :icon="['fas', 'edit']" />
            </button>
            <!-- Button Supprimer -->
            <button
              v-tippy="'Supprimer'"
              @click="confirmDelete(survey.id)"
              class="bg-red-500 text-white px-4 py-2 rounded-md shadow hover:bg-red-600 transition"
            >
              <font-awesome-icon :icon="['fas', 'trash']" />
            </button>
            <button
              v-tippy="survey.is_active ? 'Actif' : 'Inactif'"
              @click="toggleActiveSurvey(survey.id, survey.is_active)"
              class="px-4 py-2 rounded-md shadow transition"
              :class="
                survey.is_active
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
              "
            >
              <font-awesome-icon
                :icon="['fas', survey.is_active ? 'check-circle' : 'ban']"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useSupabaseClient, navigateTo } from "#imports";

const supabase = useSupabaseClient();
const isLoading = ref(true);
const surveys = ref([]);
const filteredSurveys = ref([]);
const searchText = ref("");
const hasActiveSurvey = computed(() =>
  surveys.value.some((survey) => survey.is_active)
);

onMounted(async () => {
  await fetchSurveys();
});

const fetchSurveys = async () => {
  isLoading.value = true;
  try {
    const { data, error } = await supabase
      .from("surveys")
      .select("*")
      .order("id", { ascending: true });
    if (error) {
      console.error("Erreur lors de la récupération des sondages :", error);
    } else {
      surveys.value = data || [];
      filteredSurveys.value = surveys.value;
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const filterSurveys = () => {
  filteredSurveys.value = surveys.value.filter(
    (survey) =>
      survey.title.toLowerCase().includes(searchText.value.toLowerCase()) ||
      survey.description.toLowerCase().includes(searchText.value.toLowerCase())
  );
};

const resetSearch = () => {
  searchText.value = "";
  filteredSurveys.value = surveys.value;
};

const createSurvey = () => {
  navigateTo("/admin/surveys/create");
};

const editSurvey = (id) => {
  navigateTo(`/admin/surveys/${id}/edit`);
};

const viewSurveyKeys = (id) => {
  navigateTo(`/admin/surveys/${id}/keys`);
};

const confirmDelete = (id) => {
  selectedSurveyId.value = id;
  showModal.value = true;
};

const toggleActiveSurvey = async (id, isActive) => {
  if (!isActive) {
    await supabase
      .from("surveys")
      .update({ is_active: false })
      .eq("is_active", true);
    await supabase.from("surveys").update({ is_active: true }).eq("id", id);
  } else {
    await supabase.from("surveys").update({ is_active: false }).eq("id", id);
  }
  await fetchSurveys();
};

const deactivateAll = async () => {
  await supabase
    .from("surveys")
    .update({ is_active: false })
    .eq("is_active", true);
  await fetchSurveys();
};

const backToAdmin = () => {
  navigateTo("/admin");
};
</script>
