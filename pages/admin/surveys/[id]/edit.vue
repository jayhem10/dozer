<template>
  <div class="max-w-4xl mx-auto p-6 mt-10">
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>
    <div v-else>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Modifier le sondage</h1>
        <button
          @click="backToSurveys"
          v-tippy="'Retour'"
          class="bg-gray-500 text-white px-4 py-2 rounded-md shadow hover:bg-gray-600 transition"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
        </button>
      </div>
      <form @submit.prevent="updateSurvey">
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
        <div class="mb-4">
          <label
            for="point_multiplier"
            class="block text-sm font-medium text-gray-700"
          >
            Multiplier de points
          </label>
          <input
            v-model="pointMultiplier"
            id="point_multiplier"
            type="text"
            placeholder="Ex : 239/20 ou 5.1234567890"
            class="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
          <p v-if="errors.pointMultiplier" class="text-red-500 text-sm mt-1">
            {{ errors.pointMultiplier }}
          </p>
        </div>
        <h2 class="text-lg font-semibold mb-4">Questions</h2>
        <div
          v-for="(question, index) in questions"
          :key="question.id || index"
          class="mb-4 p-4 border border-gray-200 rounded"
        >
          <div class="flex justify-between items-center mb-2">
            <span class="font-medium">Question {{ index + 1 }}</span>
            <button
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
          Modifier
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useSupabaseClient, useRoute } from "#imports";
import { navigateTo } from "nuxt/app";
import { evaluate } from "mathjs";
import { useToast } from "vue-toastification";

const supabase = useSupabaseClient();
const route = useRoute();
const toast = useToast();
const id = route.params.id;

const isLoading = ref(true);
const title = ref("");
const description = ref("");
const pointMultiplier = ref<string>("1");
const questions = ref([]);
const deletedQuestions = ref([]);
const errors = ref({});

onMounted(async () => {
  await fetchSurvey();
  isLoading.value = false;
});

const fetchSurvey = async () => {
  try {
    const { data: survey, error: surveyError } = await supabase
      .from("surveys")
      .select("*")
      .eq("id", id)
      .single();
    if (surveyError) {
      console.error("Erreur lors de la récupération du sondage :", surveyError);
      return;
    }

    title.value = survey.title;
    description.value = survey.description;
    pointMultiplier.value = survey.point_multiplier?.toString() || "1";

    const { data: questionsData, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .eq("survey_id", id);
    if (questionsError) {
      console.error(
        "Erreur lors de la récupération des questions :",
        questionsError
      );
    } else {
      questions.value = questionsData || [];
    }
  } catch (err) {
    console.error(err);
  }
};

const addQuestion = () => {
  if (questions.value.length < 10) {
    questions.value.push({ text: "", type: "weighting" });
  }
};

const removeQuestion = (index: number) => {
  const question = questions.value[index];
  if (question.id) {
    deletedQuestions.value.push(question.id);
  }
  questions.value.splice(index, 1);
};

const validateAndEvaluateMultiplier = (): number | null => {
  try {
    const result = evaluate(pointMultiplier.value.trim());
    if (isNaN(result)) {
      throw new Error("La valeur évaluée n'est pas un nombre.");
    }
    return parseFloat(result.toFixed(10));
  } catch (error) {
    errors.value.pointMultiplier =
      "Le multiplicateur doit être un nombre ou une expression valide (ex : 200/90, 5.12345).";
    return null;
  }
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

  const multiplier = validateAndEvaluateMultiplier();
  if (multiplier === null) {
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

const updateSurvey = async () => {
  if (!validateForm()) return;

  try {
    const multiplier = validateAndEvaluateMultiplier();
    if (multiplier === null) return;

    const { error: surveyError } = await supabase
      .from("surveys")
      .update({
        title: title.value,
        description: description.value,
        point_multiplier: multiplier,
      })
      .eq("id", id);

    if (surveyError) {
      console.error("Erreur lors de la mise à jour du sondage :", surveyError);
      return;
    }

    if (deletedQuestions.value.length > 0) {
      const { error: deleteError } = await supabase
        .from("questions")
        .delete()
        .in("id", deletedQuestions.value);
      if (deleteError) {
        console.error(
          "Erreur lors de la suppression des questions :",
          deleteError
        );
      }
    }

    for (const question of questions.value) {
      if (question.id) {
        const { error: updateError } = await supabase
          .from("questions")
          .update({ text: question.text, type: question.type })
          .eq("id", question.id);
        if (updateError) {
          console.error(
            "Erreur lors de la mise à jour de la question :",
            updateError
          );
        }
      } else {
        const { error: insertError } = await supabase
          .from("questions")
          .insert({ survey_id: id, text: question.text, type: question.type });
        if (insertError) {
          console.error("Erreur lors de l'ajout de la question :", insertError);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
  navigateTo("/admin/surveys");
  toast.success("Sondage modifié avec succès !");
};

const backToSurveys = () => {
  navigateTo("/admin/surveys");
};
</script>
