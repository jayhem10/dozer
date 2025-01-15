<template>
  <div class="max-w-4xl mx-auto p-6 mt-10">
    <h1 v-if="isLoadingSurvey" class="text-2xl font-bold mb-6">
      Chargement du sondage...
    </h1>
    <h1 v-else class="text-2xl font-bold mb-6">
      Envoyer des clés d'accès pour {{ surveyTitle }}
    </h1>

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

      <div class="flex space-x-4 mb-4">
        <button
          @click="selectAllCollaborators"
          class="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-md hover:from-blue-500 hover:to-blue-700 transition"
        >
          Tout sélectionner
        </button>
        <button
          v-if="selectedCollaborators.length > 0"
          @click="deselectAllCollaborators"
          class="bg-gradient-to-r from-red-400 to-red-600 text-white px-4 py-2 rounded-md hover:from-red-500 hover:to-red-700 transition"
        >
          Tout désélectionner
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="collaborator in filteredCollaborators"
          :key="collaborator.id"
          :class="{
            'border-blue-500 bg-blue-50 shadow-lg':
              selectedCollaborators.includes(collaborator.id),
            'border-gray-300 bg-white': !selectedCollaborators.includes(
              collaborator.id
            ),
          }"
          class="flex items-center p-4 border rounded-md shadow hover:shadow-lg cursor-pointer transition"
          @click="toggleSelection(collaborator.id)"
        >
          <input
            type="checkbox"
            :value="collaborator.id"
            v-model="selectedCollaborators"
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
        v-if="selectedCollaborators.length === 0"
        class="text-sm text-red-500 mt-4 flex items-center"
      >
        <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-2" />
        Veuillez sélectionner au moins un collaborateur.
      </p>
      <div class="flex justify-between mt-6">
        <button
          @click="skipSending"
          class="bg-gradient-to-r from-gray-400 to-gray-600 text-white px-4 py-2 rounded-md hover:from-gray-500 hover:to-gray-700 transition"
        >
          Passer cette étape
        </button>
        <button
          @click="sendKeys"
          class="flex items-center justify-center text-white px-4 py-2 rounded-md transition"
          :class="{
            'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700':
              selectedCollaborators.length > 0 && !isSendingKeys,
            'bg-gray-400 cursor-not-allowed':
              selectedCollaborators.length === 0 || isSendingKeys,
          }"
          :disabled="selectedCollaborators.length === 0 || isSendingKeys"
        >
          <div
            v-if="isSendingKeys"
            class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
          ></div>
          <span>
            {{ isSendingKeys ? "Envoi en cours..." : "Envoyer les clés" }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useSurveyStore } from "@/stores/survey";
import { useSupabaseClient, navigateTo } from "#imports";
import { useToast } from "vue-toastification";

import sendEmail from "@/utils/emailService";

interface Collaborator {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface EmailError {
  email: string;
  reason: string;
}

const searchQuery = ref<string>("");
const collaborators = ref<Collaborator[]>([]);
const selectedCollaborators = ref<string[]>([]);
const surveyTitle = ref<string>("");
const isLoadingSurvey = ref<boolean>(true);
const isLoadingCollaborators = ref<boolean>(true);
const isSendingKeys = ref<boolean>(false);
const emailErrors = ref<EmailError[]>([]);

const route = useRoute();
const store = useSurveyStore();
const supabase = useSupabaseClient();
const toast = useToast();

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
  const surveyId = route.params.id as string;

  try {
    await store.fetchSurveyById(surveyId);
    surveyTitle.value = store.surveyTitle;
    isLoadingSurvey.value = false;

    const { data, error } = await supabase
      .from("collaborators")
      .select("*")
      .order("last_name", { ascending: true });

    if (error) throw error;

    collaborators.value = data || [];
    isLoadingCollaborators.value = false;
  } catch (err) {
    console.error("Erreur lors du chargement des données :", err);
    navigateTo("/admin/surveys");
  }
});

const clearSearch = () => {
  searchQuery.value = "";
};

const selectAllCollaborators = () => {
  selectedCollaborators.value = filteredCollaborators.value.map((c) => c.id);
};

const deselectAllCollaborators = () => {
  selectedCollaborators.value = [];
};

const toggleSelection = (id: string) => {
  if (selectedCollaborators.value.includes(id)) {
    selectedCollaborators.value = selectedCollaborators.value.filter(
      (selectedId) => selectedId !== id
    );
  } else {
    selectedCollaborators.value.push(id);
  }
};

const sendKeys = async () => {
  if (selectedCollaborators.value.length === 0) {
    console.error("Aucun collaborateur sélectionné.");
    return;
  }

  isSendingKeys.value = true;
  emailErrors.value = [];

  const emails = collaborators.value
    .filter((c) => selectedCollaborators.value.includes(c.id))
    .map((c) => c.email);

  try {
    if (emails.length === 0) {
      console.error("Aucun collaborateur sélectionné.");
      return;
    }

    const keys = await store.generateAndSendKeys(emails);

    for (const key of keys) {
      try {
        await sendEmail(key.email, store.surveyTitle, key.key);

        const { error } = await supabase
          .from("access_keys")
          .update({ is_sent: true })
          .eq("id", key.id);

        if (error) {
          console.error(
            `Échec de la mise à jour de la base pour la clé ${key.key}.`,
            error
          );
          emailErrors.value.push({
            email: key.email,
            reason: "Échec de la mise à jour de la base de données.",
          });
        }
      } catch (emailError) {
        console.error(
          `Erreur lors de l'envoi ou de la mise à jour pour ${key.email}:`,
          emailError
        );

        emailErrors.value.push({
          email: key.email,
          reason:
            emailError.message ||
            "Erreur inconnue lors de l'envoi ou de la mise à jour.",
        });
      }
    }

    if (emailErrors.value.length > 0) {
      console.warn(
        `${emailErrors.value.length} erreurs rencontrées lors de l'envoi.`
      );
      await saveErrorsToFile(emailErrors.value);
    } else {
      toast.success("Toutes les clés ont été traitées avec succès.");
    }
  } catch (err) {
    console.error("Erreur lors de l'envoi des clés :", err);

    emailErrors.value.push({
      email: "N/A",
      reason: err.message || "Erreur inconnue lors de la génération des clés.",
    });

    await saveErrorsToFile(emailErrors.value);

    toast.error("Le processus a échoué. Veuillez vérifier les erreurs.");
  } finally {
    isSendingKeys.value = false;
    navigateTo("/admin/surveys");
  }
};

const saveErrorsToFile = async (errors: EmailError[]) => {
  const blob = new Blob([JSON.stringify(errors, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "email_errors.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const skipSending = () => {
  navigateTo("/admin/surveys");
};
</script>
