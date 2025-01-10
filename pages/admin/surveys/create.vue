<template>
  <div class="max-w-4xl mx-auto p-6 mt-10">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold mb-6">Créer un sondage</h1>

      <button
        v-tippy="'Retour'"
        @click="backToSurveys"
        class="bg-gradient-to-r from-gray-400 to-gray-600 text-white px-4 py-2 rounded-md shadow hover:from-gray-500 hover:to-gray-700 transition"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
      </button>
    </div>

    <form @submit.prevent="addSurvey">
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
        <label for="description" class="block text-sm font-medium text-gray-700"
          >Description</label
        >
        <textarea
          v-model="description"
          id="description"
          rows="4"
          class="mt-1 block w-full p-2 border border-gray-300 rounded"
        ></textarea>
        <p v-if="errors.description" class="text-red-500 text-sm mt-1">
          {{ errors.description }}
        </p>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700"
          >Multiplicateur de points</label
        >
        <div class="flex items-center mt-2">
          <label class="flex items-center mr-4">
            <input
              type="radio"
              v-model="useDefaultMultiplier"
              :value="true"
              class="mr-2"
            />
            Par défaut ({{ defaultMultiplier.toFixed(2) }})
          </label>
          <label class="flex items-center">
            <input
              type="radio"
              v-model="useDefaultMultiplier"
              :value="false"
              class="mr-2"
            />
            Personnalisé
          </label>
        </div>
        <div v-if="!useDefaultMultiplier" class="mt-2">
          <input
            v-model="customMultiplier"
            type="text"
            placeholder="Ex : 239/20 ou 5.25"
            class="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
          <p v-if="errors.customMultiplier" class="text-red-500 text-sm mt-1">
            {{ errors.customMultiplier }}
          </p>
        </div>
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
            type="button"
            @click="removeQuestion(index)"
            class="text-red-500 hover:underline"
            v-if="questions.length > 1"
          >
            Supprimer
          </button>
        </div>
        <input
          v-model="question.text"
          type="text"
          class="mt-1 block w-full p-2 border border-gray-300 rounded mb-2"
          placeholder="Texte de la question"
        />
        <p v-if="errors[`question-${index}`]" class="text-red-500 text-sm mt-1">
          {{ errors[`question-${index}`] }}
        </p>
        <select
          v-model="question.type"
          class="mt-1 block w-full p-2 border border-gray-300 rounded"
        >
          <option value="weighting">Pondération</option>
          <option value="rating">Évaluation</option>
        </select>
      </div>

      <div class="flex justify-between items-center mt-4">
        <button
          type="button"
          @click="addQuestion"
          :disabled="questions.length >= 10"
          class="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-md shadow hover:from-blue-500 hover:to-blue-700 transition disabled:opacity-50"
        >
          Ajouter une question
        </button>
        <button
          type="submit"
          class="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-md shadow hover:from-green-500 hover:to-green-700 transition"
        >
          Créer
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "vue-toastification";
import { evaluate } from "mathjs";
import { navigateTo } from "#imports";

import { useSurveyStore } from "@/stores/survey";
import { POINT_MULTIPLIER } from "@/constants/survey";

const toast = useToast();

const defaultMultiplier = POINT_MULTIPLIER;
const useDefaultMultiplier = ref(true);
const customMultiplier = ref("");

const title = ref("");
const description = ref("");
const questions = ref([{ text: "", type: "weighting" }]);
const errors = ref({});

const store = useSurveyStore();

const addQuestion = () => questions.value.push({ text: "", type: "weighting" });
const removeQuestion = (index: number) => questions.value.splice(index, 1);

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

  if (!useDefaultMultiplier.value) {
    try {
      if (!customMultiplier.value.trim()) {
        throw new Error();
      }
      evaluate(customMultiplier.value);
    } catch (error) {
      errors.value.customMultiplier =
        "Le multiplicateur personnalisé est invalide. Saisissez une valeur ou un calcul valide.";
      valid = false;
    }
  }

  questions.value.forEach((question, index) => {
    if (!question.text.trim()) {
      errors.value[`question-${index}`] = `Le texte de la question ${
        index + 1
      } est requis.`;
      valid = false;
    }
  });

  return valid;
};

const addSurvey = async () => {
  if (!validateForm()) return;

  try {
    const pointMultiplier = useDefaultMultiplier.value
      ? defaultMultiplier
      : evaluate(String(customMultiplier.value).trim());

    await store.createSurvey({
      title: title.value,
      description: description.value,
      questions: questions.value,
      point_multiplier: pointMultiplier,
    });
    console.log("Survey created", store.surveyId);
    navigateTo(`/admin/send-keys/${store.surveyId}`);
    toast("Sondage créé avec succès !");
  } catch (error) {
    console.error("Erreur lors de la création du sondage :", error);
    toast("Impossible de créer le sondage. Veuillez réessayer.");
  }
};

const backToSurveys = () => {
  navigateTo("/admin/surveys");
};
</script>
