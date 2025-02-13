<template>
  <div class="max-w-4xl mx-auto p-6 mt-10">
    <div class="flex justify-between items-center mb-6">
      <h1 v-if="isLoadingSurvey" class="text-2xl font-bold">
        Chargement du sondage...
      </h1>
      <h1 v-else class="text-2xl font-bold">
        Envoyer la clé : {{ key }} pour le sondage {{ surveyTitle }}
      </h1>
      <button
        @click="backToSurveyKeys"
        class="bg-gradient-to-r from-gray-400 to-gray-600 text-white px-3 py-2 rounded-md shadow hover:from-gray-500 hover:to-gray-700 transition mr-4"
        v-tippy="'Retour'"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
      </button>
    </div>

    <div
      v-if="isLoadingCollaborators"
      class="flex justify-center items-center h-64"
    >
      <div
        class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <div v-else>
      <div class="relative mb-4">
        <input
          v-model="searchQuery"
          @input="filterCollaborators"
          type="text"
          placeholder="Rechercher par nom ou email"
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

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="collaborator in filteredCollaborators"
          :key="collaborator.id"
          :class="{
            'border-blue-500 bg-blue-50 shadow-lg':
              selectedCollaborator === collaborator.id,
            'border-gray-300 bg-white':
              selectedCollaborator !== collaborator.id,
          }"
          class="flex items-center p-4 border rounded-md shadow hover:shadow-lg cursor-pointer transition"
          @click="selectCollaborator(collaborator.id)"
        >
          <input
            type="radio"
            :value="collaborator.id"
            v-model="selectedCollaborator"
            class="mr-2 pointer-events-none"
          />
          <div>
            <p class="font-semibold">
              {{ collaborator.first_name }} {{ collaborator.last_name }}
            </p>
            <p class="text-sm text-gray-600">{{ collaborator.email }}</p>
          </div>
        </div>
      </div>

      <p
        v-if="!selectedCollaborator"
        class="text-sm text-red-500 mt-4 flex items-center"
      >
        <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-2" />
        Veuillez sélectionner un collaborateur.
      </p>

      <div class="flex justify-end mt-6">
        <button
          @click="sendKey"
          class="flex items-center justify-center bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-md hover:from-green-500 hover:to-green-700 transition"
          :disabled="!selectedCollaborator || isSendingKey"
        >
          <div
            v-if="isSendingKey"
            class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
          ></div>
          <span>
            {{ isSendingKey ? "Envoi en cours..." : "Envoyer la clé" }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useSupabaseClient, useRoute, navigateTo } from "#imports";
import { useToast } from "vue-toastification";
import emailService from "@/utils/emailService";

const toast = useToast();
const searchQuery = ref("");
const collaborators = ref([]);
const selectedCollaborator = ref(null);
const surveyTitle = ref("");
const key = ref("");
const isLoadingSurvey = ref(true);
const isLoadingCollaborators = ref(true);
const isSendingKey = ref(false);
const route = useRoute();
const supabase = useSupabaseClient();

const filteredCollaborators = computed(() => {
  if (!searchQuery.value) return collaborators.value;
  return collaborators.value.filter(
    (collaborator) =>
      collaborator.first_name
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      collaborator.last_name
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      collaborator.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(async () => {
  const surveyId = route.params.id;
  key.value = route.params.key;

  try {
    const { data: survey, error: surveyError } = await supabase
      .from("surveys")
      .select("title")
      .eq("id", surveyId)
      .single();

    if (surveyError) throw surveyError;

    surveyTitle.value = survey.title;
    isLoadingSurvey.value = false;

    const { data: collaboratorData, error: collaboratorError } = await supabase
      .from("collaborators")
      .select("*")
      .order("last_name", { ascending: true });

    if (collaboratorError) throw collaboratorError;

    collaborators.value = collaboratorData || [];
    isLoadingCollaborators.value = false;
  } catch (err) {
    console.error("Erreur lors du chargement des données :", err);
    toast.error("Impossible de charger les données. Veuillez réessayer.");
    navigateTo(`/survey/${surveyId}/keys`);
  }
});

const clearSearch = () => {
  searchQuery.value = "";
};

const selectCollaborator = (id) => {
  selectedCollaborator.value = id;
};

const sendKey = async () => {
  isSendingKey.value = true;

  const collaborator = collaborators.value.find(
    (c) => c.id === selectedCollaborator.value
  );

  if (!collaborator) {
    toast.error("Collaborateur non trouvé.");
    isSendingKey.value = false;
    return;
  }

  try {
    const { data: keyData, error: keyError } = await supabase
      .from("access_keys")
      .select("is_sent")
      .eq("key", key.value)
      .single();

    if (keyError) throw keyError;

    if (keyData.is_sent) {
      toast.error("Cette clé a déjà été envoyée.");
      isSendingKey.value = false;
      return;
    }

    const result = await emailService.sendEmail(
      collaborator.email,
      surveyTitle.value,
      key.value
    );
    if (!result.success) {
      throw new Error(result.error);
    }
    toast.success(`Clé envoyée à ${collaborator.email}`);

    const { error } = await supabase
      .from("access_keys")
      .update({ is_sent: true })
      .eq("key", key.value);

    if (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
      toast.warning("Échec de la mise à jour du statut de la clé.");
    } else {
      navigateTo(`/admin/surveys/${route.params.id}/keys`);
    }
  } catch (err) {
    console.error("Erreur lors de l'envoi de la clé :", err);
    toast.error("Échec de l'envoi de la clé. Veuillez réessayer.");
  } finally {
    isSendingKey.value = false;
  }
};

const backToSurveyKeys = () => {
  navigateTo(`/admin/surveys/${route.params.id}/keys`);
};
</script>
