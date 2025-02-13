<template>
  <div class="max-w-4xl mx-auto p-6 mt-10">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Créer un sondage</h1>
      <button
        v-tippy="'Retour'"
        @click="backToSurveys"
        class="bg-gradient-to-r from-gray-400 to-gray-600 text-white px-4 py-2 rounded-md shadow hover:from-gray-500 hover:to-gray-700 transition"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
      </button>
    </div>

    <form @submit.prevent="addSurvey">
      <!-- Title and Description fields remain unchanged -->
      <div class="mb-6">
        <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
          Titre
        </label>
        <input
          v-model="title"
          id="title"
          type="text"
          placeholder="Entrez le titre du sondage"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
        />
        <p v-if="errors.title" class="text-red-500 text-sm mt-1">
          {{ errors.title }}
        </p>
      </div>

      <div class="mb-6">
        <label
          for="description"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Description
        </label>
        <textarea
          v-model="description"
          id="description"
          rows="4"
          placeholder="Ajoutez une description du sondage"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
        ></textarea>
        <p v-if="errors.description" class="text-red-500 text-sm mt-1">
          {{ errors.description }}
        </p>
      </div>

      <!-- Multiplier section remains unchanged -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Multiplicateur de points
        </label>
        <div class="flex items-center space-x-4">
          <label class="flex items-center">
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
        <div v-if="!useDefaultMultiplier" class="mt-4">
          <input
            v-model="customMultiplier"
            type="text"
            placeholder="Ex : 239/20 ou 5.25"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
          <p v-if="errors.customMultiplier" class="text-red-500 text-sm mt-1">
            {{ errors.customMultiplier }}
          </p>
        </div>
      </div>

      <!-- Updated Questions Section -->
      <h2 class="text-lg font-semibold mb-4">Questions</h2>
      <div
        v-for="(question, index) in questions"
        :key="index"
        class="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50"
      >
        <div class="flex justify-between items-center mb-4">
          <span class="font-medium">Question {{ index + 1 }}</span>
          <button
            @click="removeQuestion(index)"
            v-if="questions.length > 1"
            v-tippy="'Supprimer'"
            class="bg-gradient-to-r from-red-400 to-red-600 text-white px-3 py-1 rounded-md shadow hover:from-red-500 hover:to-red-700 transition"
          >
            <font-awesome-icon :icon="['fas', 'trash']" />
          </button>
        </div>

        <!-- Weighting Question -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Question pour la pondération
          </label>
          <input
            v-model="question.weighting"
            type="text"
            placeholder="Question pour la pondération"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <!-- Rating Question -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Question pour l'évaluation
          </label>
          <input
            v-model="question.rating"
            type="text"
            placeholder="Question pour l'évaluation"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <p v-if="errors[`question-${index}`]" class="text-red-500 text-sm">
          {{ errors[`question-${index}`] }}
        </p>
      </div>

      <div class="flex justify-between items-center mt-6">
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
          class="flex items-center justify-center bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-md hover:from-green-500 hover:to-green-700 transition"
          :disabled="isCreatingSurvey"
        >
          <div
            v-if="isCreatingSurvey"
            class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
          ></div>
          <span>
            {{ isCreatingSurvey ? "Création en cours..." : "Créer le sondage" }}
          </span>
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
import { Question, FormattedQuestion } from "@/stores/survey";

const toast = useToast();

const defaultMultiplier = POINT_MULTIPLIER;
const useDefaultMultiplier = ref(true);
const customMultiplier = ref("");

const title = ref("");
const isCreatingSurvey = ref(false);
const description = ref("");
const questions = ref<Question[]>([{ weighting: "", rating: "", position: 1 }]);
const errors = ref<Record<string, string>>({});

const store = useSurveyStore();

const addQuestion = () => {
  questions.value.push({
    weighting: "",
    rating: "",
    position: questions.value.length + 1,
  });
};

const removeQuestion = (index: number) => {
  questions.value.splice(index, 1);
  // Réorganiser les positions après suppression
  questions.value.forEach((q, idx) => {
    q.position = idx + 1;
  });
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
    if (!question.weighting?.trim() && !question.rating?.trim()) {
      errors.value[`question-${index}`] = `La question ${
        index + 1
      } doit avoir au moins un texte rempli (pondération ou évaluation).`;
      valid = false;
    }
  });

  return valid;
};

const addSurvey = async () => {
  if (!validateForm()) return;
  isCreatingSurvey.value = true;

  try {
    const pointMultiplier = useDefaultMultiplier.value
      ? defaultMultiplier
      : evaluate(String(customMultiplier.value).trim());

    const formattedQuestions = questions.value.map((q) => ({
      weighting: q.weighting?.trim() || null,
      rating: q.rating?.trim() || null,
      position: q.position,
    }));

    await store.createSurvey({
      title: title.value,
      description: description.value,
      questions: formattedQuestions,
      point_multiplier: pointMultiplier,
    });

    navigateTo(`/admin/send-keys/${store.surveyId}`);
    toast("Sondage créé avec succès !");
  } catch (error) {
    console.error("Erreur lors de la création du sondage :", error);
    toast("Impossible de créer le sondage. Veuillez réessayer.");
  } finally {
    isCreatingSurvey.value = false;
  }
};

const backToSurveys = () => {
  navigateTo("/admin/surveys");
};
</script>
