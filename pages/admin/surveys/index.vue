<template>
  <div class="max-w-4xl mx-auto p-6 mt-10">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Gestion des sondages</h1>
      <div class="flex space-x-2">
        <button
          v-tippy="'Créer un sondage'"
          @click="createSurvey"
          class="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-md shadow hover:from-blue-500 hover:to-blue-700 transition"
        >
          <font-awesome-icon :icon="['fas', 'plus']" />
        </button>
        <div
          v-tippy="
            !store.hasActiveSurvey
              ? 'Aucun sondage actif à désactiver'
              : 'Désactiver tous les sondages'
          "
        >
          <button
            @click="handleDeactivateAll"
            class="bg-gradient-to-r from-orange-400 to-orange-600 text-white px-4 py-2 rounded-md shadow hover:from-orange-500 hover:to-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!store.hasActiveSurvey"
          >
            <font-awesome-icon
              :icon="
                !store.hasActiveSurvey ? ['fas', 'ban'] : ['fas', 'power-off']
              "
            />
          </button>
        </div>
        <button
          v-tippy="'Retour'"
          @click="backToAdmin"
          class="bg-gradient-to-r from-gray-400 to-gray-600 text-white px-4 py-2 rounded-md shadow hover:from-gray-500 hover:to-gray-700 transition"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
        </button>
      </div>
    </div>

    <div class="relative mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher par titre ou description"
        class="w-full p-2 border border-gray-300 rounded pr-10"
      />
      <button
        v-if="searchQuery"
        @click="handleResetSearch"
        class="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
      >
        <font-awesome-icon :icon="['fas', 'times']" />
      </button>
      <button
        v-if="searchQuery"
        @click="clearSearch"
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
        v-if="store.filteredSurveys.length === 0"
        class="text-gray-600 text-center"
      >
        Aucun sondage disponible.
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="survey in store.filteredSurveys"
          :key="survey.id"
          class="p-4 bg-white shadow rounded-md flex justify-between items-center"
        >
          <div>
            <h2 class="text-lg font-semibold">{{ survey.title }}</h2>
            <p class="text-sm text-gray-600">{{ survey.description }}</p>
            <div class="mt-2 text-sm text-gray-800 space-y-1">
              <p>
                <strong>Nombre de clés : </strong>
                {{ survey.total_keys > 0 ? survey.total_keys : "Aucune clé" }}
              </p>
              <p>
                <strong>Clés utilisées : </strong>
                {{
                  survey.total_keys > 0
                    ? `${survey.used_keys} / ${survey.total_keys} (${(
                        (survey.used_keys / survey.total_keys) *
                        100
                      ).toFixed(2)}%)`
                    : "N/A"
                }}
              </p>
              <p>
                <strong>Nombre de questions : </strong
                >{{ survey.question_count }}
              </p>
              <p>
                <strong>Point Multiplier : </strong>
                {{
                  Math.abs(survey.point_multiplier - 200 / 39) < 0.0001
                    ? "5.13 (par défaut)"
                    : survey.point_multiplier.toFixed(2)
                }}
              </p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 items-center">
            <button
              v-tippy="'Voir les clés'"
              @click="viewSurveyKeys(survey.id)"
              class="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-5 py-2 text-lg rounded-lg shadow hover:from-blue-500 hover:to-blue-700 transition"
            >
              <font-awesome-icon :icon="['fas', 'key']" />
            </button>
            <button
              v-tippy="survey.is_active ? 'Actif' : 'Inactif'"
              @click="handleToggleActiveSurvey(survey.id, survey.is_active)"
              class="px-5 py-2 text-lg rounded-lg shadow transition"
              :class="
                survey.is_active
                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700'
                  : 'bg-gradient-to-r from-gray-100 to-gray-300 text-gray-500 hover:from-gray-200 hover:to-gray-400'
              "
            >
              <font-awesome-icon
                :icon="['fas', survey.is_active ? 'check-circle' : 'ban']"
              />
            </button>
            <button
              v-tippy="'Modifier'"
              @click="editSurvey(survey.id)"
              class="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-5 py-2 text-lg rounded-lg shadow hover:from-yellow-500 hover:to-yellow-700 transition"
            >
              <font-awesome-icon :icon="['fas', 'edit']" />
            </button>
            <button
              v-tippy="'Supprimer'"
              @click="confirmDelete(survey.id)"
              class="bg-gradient-to-r from-red-400 to-red-600 text-white px-5 py-2 text-lg rounded-lg shadow hover:from-red-500 hover:to-red-700 transition"
            >
              <font-awesome-icon :icon="['fas', 'trash']" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import Swal from "sweetalert2";
import { useSurveyStore } from "@/stores/survey";
import { navigateTo } from "#imports";
import { useToast } from "vue-toastification";

const toast = useToast();
const store = useSurveyStore();
const isLoading = ref(true);
const searchQuery = ref("");

onMounted(async () => {
  try {
    isLoading.value = true;
    await store.fetchSurveys();
  } catch (error) {
    console.error("Erreur lors du chargement des sondages :", error);
  } finally {
    isLoading.value = false;
  }
});

const createSurvey = () => navigateTo("/admin/surveys/create");
const editSurvey = (id) => navigateTo(`/admin/surveys/${id}/edit`);
const viewSurveyKeys = (id) => navigateTo(`/admin/surveys/${id}/keys`);

const confirmDelete = (id: string) => {
  Swal.fire({
    title: "Êtes-vous sûr ?",
    text: "Cette action est irréversible.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Oui, supprimer",
    cancelButtonText: "Annuler",
  }).then(async (result) => {
    if (result.isConfirmed) {
      isLoading.value = true;
      try {
        await store.deleteSurvey(id);
        toast.success("Le sondage a été supprimé avec succès !");
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        toast.error("Erreur lors de la suppression du sondage.");
      } finally {
        isLoading.value = false;
      }
    }
  });
};

const handleToggleActiveSurvey = async (id: string, isActive: boolean) => {
  isLoading.value = true;
  try {
    await store.toggleActiveSurvey(id, isActive);
    const status = isActive ? "désactivé" : "activé";
    toast.success(`Le sondage a été ${status} avec succès !`);
  } catch (error) {
    console.error("Erreur lors du changement d'état :", error);
    toast.error("Erreur lors de l'activation/désactivation du sondage.");
  } finally {
    isLoading.value = false;
  }
};

const handleDeactivateAll = async () => {
  isLoading.value = true;
  try {
    await store.deactivateAll();
    toast.success("Tous les sondages ont été désactivés avec succès !");
  } catch (error) {
    console.error("Erreur lors de la désactivation :", error);
    toast.error("Erreur lors de la désactivation des sondages.");
  } finally {
    isLoading.value = false;
  }
};

const clearSearch = () => {
  searchQuery.value = "";
};

const handleResetSearch = () => {
  store.resetSearch();
};

const backToAdmin = () => navigateTo("/admin");

watch(searchQuery, (newQuery) => {
  store.filterSurveys(newQuery);
});
</script>
