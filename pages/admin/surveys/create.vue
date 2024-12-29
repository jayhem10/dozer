<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Créer un sondage</h1>
      <button
        @click="backToSurveys"
        class="bg-gray-500 text-white px-4 py-2 rounded-md shadow hover:bg-gray-600 transition"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
      </button>
    </div>
    <form @submit.prevent="createSurvey">
      <div class="mb-4">
        <label for="title" class="block text-sm font-medium text-gray-700"
          >Titre</label
        >
        <input
          v-model="title"
          id="title"
          type="text"
          class="mt-1 block w-full p-2 border border-gray-300 rounded"
        />
        <p v-if="errors.title" class="text-red-500 text-sm mt-1">
          {{ errors.title }}
        </p>
      </div>
      <div class="mb-4">
        <label
          for="description"
          class="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          v-model="description"
          id="description"
          class="mt-1 block w-full p-2 border border-gray-300 rounded"
          rows="4"
        ></textarea>
        <p v-if="errors.description" class="text-red-500 text-sm mt-1">
          {{ errors.description }}
        </p>
      </div>
      <h2 class="text-lg font-semibold mb-4">Questions</h2>
      <div
        v-for="(question, index) in questions"
        :key="index"
        class="mb-4 p-4 border border-gray-200 rounded"
      >
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium">Question {{ index + 1 }}</span>
          <button
            v-if="questions.length > 1"
            type="button"
            @click="removeQuestion(index)"
            class="text-red-500 hover:underline"
          >
            Supprimer
          </button>
        </div>
        <div class="mb-2">
          <label class="block text-sm font-medium text-gray-700"
            >Texte de la question</label
          >
          <input
            v-model="question.text"
            type="text"
            class="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
          <p
            v-if="errors[`question-${index}`]"
            class="text-red-500 text-sm mt-1"
          >
            {{ errors[`question-${index}`] }}
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Type</label>
          <select
            v-model="question.type"
            class="mt-1 block w-full p-2 border border-gray-300 rounded"
          >
            <option value="weighting">Weighting</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>
      <div class="flex justify-end mb-4">
        <button
          type="button"
          @click="addQuestion"
          :disabled="questions.length >= 10"
          class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ajouter une question
        </button>
      </div>
      <button
        type="submit"
        class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
      >
        Créer
      </button>
    </form>

    <!-- Collaborator Selection Modal -->
    <CollaboratorSelectionModal
      v-if="!isCollaboratorsLoading && collaborators.length"
      :isOpen="showModal"
      :collaborators="collaborators"
      :surveyId="newSurveyId"
      @close="handleCloseModal"
      @keysGenerated="handleKeysGenerated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import CollaboratorSelectionModal from "@/components/admin/CollaboratorSelectionModal.vue";

import { useSupabaseClient, navigateTo } from "#imports";

const supabase = useSupabaseClient();

const title = ref("");
const description = ref("");
const questions = ref([{ text: "", type: "weighting" }]);
const errors = ref({});
const showModal = ref(false);
const collaborators = ref([]);
const newSurveyId = ref(null);

onMounted(() => {
  console.log("Fetching collaborators...");

  fetchCollaborators();
});

const isCollaboratorsLoading = ref(true);

const fetchCollaborators = async () => {
  try {
    console.log("Fetching collaborators...");
    const { data, error } = await supabase
      .from("collaborators")
      .select("*")
      .order("last_name", { ascending: true });

    if (error) throw error;

    collaborators.value = data || [];
    console.log("Collaborators fetched:", collaborators.value);
  } catch (err) {
    console.error("Error fetching collaborators:", err);
  } finally {
    isCollaboratorsLoading.value = false;
  }
};

console.log(collaborators.value);
const addQuestion = () => {
  if (questions.value.length < 20) {
    questions.value.push({ text: "", type: "weighting" });
  }
};

const removeQuestion = (index) => {
  questions.value.splice(index, 1);
};

const validateForm = () => {
  errors.value = {};
  let valid = true;

  if (!title.value.trim()) {
    errors.value.title = "Le titre est requis.";
    valid = false;
  }
  if (!description.value.trim()) {
    errors.value.description = "La description est requise.";
    valid = false;
  }
  if (questions.value.length === 0) {
    errors.value.questions = "Au moins une question est requise.";
    valid = false;
  } else {
    questions.value.forEach((question, index) => {
      if (!question.text.trim()) {
        errors.value[`question-${index}`] =
          "Le texte de la question est requis.";
        valid = false;
      }
    });
  }

  return valid;
};

const createSurvey = async () => {
  if (!validateForm()) return;

  try {
    const { data: survey, error: surveyError } = await supabase
      .from("surveys")
      .insert([{ title: title.value, description: description.value }])
      .select()
      .single();

    if (surveyError) {
      console.error("Erreur lors de la création du sondage :", surveyError);
      return;
    }

    // Add questions
    const formattedQuestions = questions.value.map((question) => ({
      survey_id: survey.id,
      text: question.text,
      type: question.type,
    }));

    const { error: questionsError } = await supabase
      .from("questions")
      .insert(formattedQuestions);

    if (questionsError) {
      console.error("Erreur lors de l'ajout des questions :", questionsError);
    } else {
      // Fetch collaborators before opening modal
      await fetchCollaborators();
      newSurveyId.value = survey.id;
      showModal.value = true;
    }
  } catch (err) {
    console.error(err);
  }
};

const backToSurveys = () => {
  navigateTo("/admin/surveys");
};

const handleCloseModal = () => {
  showModal.value = false;
  navigateTo("/admin/surveys");
};

const handleKeysGenerated = (keys) => {
  console.log("Clés générées :", keys);
};
fetchCollaborators();
</script>
