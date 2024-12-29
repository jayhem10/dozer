<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Clés d'accès pour le sondage</h1>
      <button
        @click="backToSurveys"
        class="bg-gray-500 text-white px-4 py-2 rounded-md shadow hover:bg-gray-600 transition"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
      </button>
    </div>

    <!-- Key Statistics -->
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
        class="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 transition"
      >
        <font-awesome-icon :icon="['fas', 'plus']" /> Générer une clé
      </button>
    </div>

    <!-- Loading Spinner -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <!-- Key Table -->
    <div v-else>
      <table class="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th class="border border-gray-300 px-4 py-2">Clé</th>
            <th class="border border-gray-300 px-4 py-2">Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="key in keys"
            :key="key.id"
            class="hover:bg-gray-100 transition"
          >
            <td class="border border-gray-300 px-4 py-2">{{ key.key }}</td>
            <td class="border border-gray-300 px-4 py-2">
              {{ key.is_used ? "Utilisée" : "Disponible" }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useSupabaseClient, useRoute, navigateTo } from "#imports";

const supabase = useSupabaseClient();
const route = useRoute();
const id = route.params.id;

const keys = ref([]);
const isLoading = ref(true);
const numberOfKeys = ref(0);
const numberOfUsedKeys = ref(0);

onMounted(async () => {
  await fetchKeys();
});

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
    });
    if (error) {
      console.error("Erreur lors de la génération de la clé :", error);
    } else {
      await fetchKeys();
    }
  } catch (err) {
    console.error(err);
  }
};

const backToSurveys = () => {
  navigateTo("/admin/surveys");
};
</script>
