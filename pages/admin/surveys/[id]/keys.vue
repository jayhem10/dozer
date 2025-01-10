<template>
  <div class="max-w-4xl mx-auto p-6 mt-10">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">
        Clés d'accès pour le sondage : {{ surveyTitle }}
      </h1>
      <button
        v-tippy="'Retour'"
        @click="backToSurveys"
        class="bg-gradient-to-r from-gray-400 to-gray-600 text-white px-4 py-2 rounded-md shadow hover:from-gray-500 hover:to-gray-700 transition"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
      </button>
    </div>

    <div class="flex justify-between items-center mb-4 space-x-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher une clé"
        class="w-full max-w-sm p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
      />
      <select
        v-model="filterStatus"
        class="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
      >
        <option value="all">Toutes</option>
        <option value="used">Utilisées</option>
        <option value="available">Disponibles</option>
        <option value="sent">Envoyées</option>
      </select>
    </div>

    <div class="flex justify-between items-center mb-4">
      <div class="text-gray-800">
        <p class="text-lg font-semibold">
          Nombre total de clés :
          <span class="text-blue-500">{{ numberOfKeys }}</span>
        </p>
        <p class="text-lg font-semibold">
          Clés utilisées :
          <span class="text-red-500">{{ numberOfUsedKeys }}</span>
        </p>
      </div>
      <button
        @click="generateKey"
        v-tippy="'Générer une nouvelle clé'"
        class="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-md shadow hover:from-blue-500 hover:to-blue-700 transition"
      >
        <font-awesome-icon :icon="['fas', 'plus']" /> Générer une clé
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <div v-else>
      <div
        v-if="filteredKeys.length === 0"
        class="text-center py-16 text-gray-500"
      >
        <p class="text-lg">Aucune clé disponible.</p>
      </div>
      <div v-else class="bg-white shadow rounded-md overflow-hidden">
        <table class="w-full table-auto border-collapse">
          <thead class="bg-gray-900 text-white">
            <tr>
              <th class="border border-gray-300 px-4 py-2">Clé</th>
              <th class="border border-gray-300 px-4 py-2">Statut</th>
              <th class="border border-gray-300 px-4 py-2">Envoyée</th>
              <th class="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="key in filteredKeys"
              :key="key.id"
              class="hover:bg-gray-50 transition"
            >
              <td class="border border-gray-300 px-4 py-2">{{ key.key }}</td>
              <td class="border border-gray-300 px-4 py-2">
                {{ key.is_used ? "Utilisée" : "Disponible" }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ key.is_sent ? "Oui" : "Non" }}
              </td>
              <td
                class="border border-gray-300 px-4 py-2 flex justify-center items-center space-x-2"
              >
                <button
                  @click="navigateToSendKey(key.key)"
                  v-tippy="'Envoyer la clé'"
                  :disabled="key.is_sent"
                  class="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-md shadow hover:from-green-500 hover:to-green-700 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <font-awesome-icon
                    :icon="['fas', 'paper-plane']"
                    class="m-auto"
                  />
                </button>
                <button
                  @click="deleteKey(key.id)"
                  v-tippy="'Supprimer la clé'"
                  class="bg-gradient-to-r from-red-400 to-red-600 text-white px-4 py-2 rounded-md shadow hover:from-red-500 hover:to-red-700 transition flex items-center"
                >
                  <font-awesome-icon :icon="['fas', 'trash']" class="m-auto" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useSupabaseClient, useRoute, navigateTo } from "#imports";
import { useToast } from "vue-toastification";
import { useSurveyStore } from "@/stores/survey";

const supabase = useSupabaseClient();
const route = useRoute();
const toast = useToast();
const store = useSurveyStore();
const id = route.params.id;

const surveyTitle = ref("");
const keys = ref([]);
const isLoading = ref(true);
const numberOfKeys = ref(0);
const numberOfUsedKeys = ref(0);
const searchQuery = ref("");
const filterStatus = ref("all");

const filteredKeys = computed(() => {
  let filtered = keys.value;

  if (searchQuery.value.trim()) {
    filtered = filtered.filter((key) =>
      key.key.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  if (filterStatus.value === "used") {
    filtered = filtered.filter((key) => key.is_used);
  } else if (filterStatus.value === "available") {
    filtered = filtered.filter((key) => !key.is_used);
  } else if (filterStatus.value === "sent") {
    filtered = filtered.filter((key) => key.is_sent);
  }

  return filtered;
});

onMounted(async () => {
  await fetchSurvey();
  await fetchKeys();
});

const fetchSurvey = async () => {
  try {
    const { data, error } = await supabase
      .from("surveys")
      .select("title")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erreur lors de la récupération du sondage :", error);
    } else {
      surveyTitle.value = data.title;
    }
  } catch (err) {
    console.error(err);
  }
};

const fetchKeys = async () => {
  isLoading.value = true;
  try {
    const { data, error } = await supabase
      .from("access_keys")
      .select("*")
      .eq("survey_id", id)
      .order("is_used", { ascending: false });
    if (error) {
      console.error("Erreur lors de la récupération des clés :", error);
    } else {
      keys.value = data || [];
      numberOfKeys.value = keys.value.length;
      numberOfUsedKeys.value = keys.value.filter((key) => key.is_used).length;
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const generateKey = async () => {
  const newKey = Math.random().toString(36).substring(2, 10).toUpperCase();
  try {
    const { error } = await supabase.from("access_keys").insert({
      survey_id: id,
      key: newKey,
      is_used: false,
      is_sent: false,
    });
    if (error) {
      console.error("Erreur lors de la génération de la clé :", error);
    } else {
      toast.success("Clé générée avec succès !");
      await fetchKeys();
    }
  } catch (err) {
    console.error(err);
  }
};

const deleteKey = async (keyId) => {
  try {
    const { error } = await supabase
      .from("access_keys")
      .delete()
      .eq("id", keyId);
    if (error) {
      console.error("Erreur lors de la suppression de la clé :", error);
    } else {
      toast.success("Clé supprimée avec succès !");
      await fetchKeys();
    }
  } catch (err) {
    console.error(err);
  }
};

const navigateToSendKey = (key) => {
  navigateTo(`/admin/send-key/${id}/${key}`);
};

const backToSurveys = () => {
  navigateTo("/admin/surveys");
};
</script>
