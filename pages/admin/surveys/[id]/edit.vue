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
          class="bg-gradient-to-r from-gray-400 to-gray-600 text-white px-4 py-2 rounded-md shadow hover:from-gray-500 hover:to-gray-700 transition"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
        </button>
      </div>

      <form @submit.prevent="updateSurvey">
        <div class="mb-6">
          <label
            for="title"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
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

        <div class="mb-6">
          <label
            for="point_multiplier"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Multiplicateur de points
          </label>
          <input
            v-model="pointMultiplier"
            id="point_multiplier"
            type="text"
            placeholder="Ex : 239/20 ou 5.1234567890"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
          <p v-if="errors.pointMultiplier" class="text-red-500 text-sm mt-1">
            {{ errors.pointMultiplier }}
          </p>
        </div>

        <h2 class="text-lg font-semibold mb-4">Questions</h2>
        <div
          v-for="(question, index) in questions"
          :key="question.id || index"
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
            :disabled="isUpdating"
          >
            <div
              v-if="isUpdating"
              class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
            ></div>
            <span>
              {{
                isUpdating
                  ? "Enregistrement en cours..."
                  : "Enregistrer les modifications"
              }}
            </span>
          </button>
        </div>
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
import { Question } from "@/stores/survey";

const supabase = useSupabaseClient();
const route = useRoute();
const toast = useToast();
const id = route.params.id;

const isLoading = ref(true);
const isUpdating = ref(false);
const title = ref<string>("");
const description = ref<string>("");
const pointMultiplier = ref<string>("1");
const questions = ref<Question[]>([]);
const deletedQuestions = ref<number[]>([]);
const errors = ref<Record<string, string>>({});

onMounted(async () => {
  isLoading.value = true;
  try {
    const { data, error } = await supabase
      .from("surveys")
      .select(
        "title, description, point_multiplier, questions(id, weighting, rating, position)"
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    title.value = data.title || "";
    description.value = data.description || "";
    pointMultiplier.value = String(data.point_multiplier || "1");
    questions.value = (data.questions || []).sort(
      (a: Question, b: Question) => (a.position || 0) - (b.position || 0)
    );

    validateAndEvaluateMultiplier();
  } catch (error) {
    toast.error("Erreur lors du chargement du sondage.");
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});

const addQuestion = () => {
  if (questions.value.length < 10) {
    // Réorganiser d'abord toutes les positions pour être sûr
    questions.value = questions.value.map((q, idx) => ({
      ...q,
      position: idx + 1,
    }));

    // Ajouter la nouvelle question avec la position suivante
    const newPosition = questions.value.length + 1;
    questions.value.push({
      weighting: "",
      rating: "",
      position: newPosition,
    });
  }
};

const removeQuestion = (index: number) => {
  const question = questions.value[index];
  if (question.id) {
    deletedQuestions.value.push(question.id);
  }
  questions.value.splice(index, 1);

  // Réorganiser immédiatement toutes les positions
  questions.value = questions.value.map((q, idx) => ({
    ...q,
    position: idx + 1,
  }));
};

const validateAndEvaluateMultiplier = (): number | null => {
  try {
    const input = pointMultiplier.value.trim();

    if (!input) {
      throw new Error("Le multiplicateur est requis.");
    }

    const result = evaluate(input);

    if (!isFinite(result)) {
      throw new Error("Le résultat évalué n'est pas un nombre valide.");
    }

    errors.value.pointMultiplier = "";
    return result;
  } catch (error) {
    // Gérer les erreurs
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
      if (
        (!question.weighting || !question.weighting.trim()) &&
        (!question.rating || !question.rating.trim())
      ) {
        errors.value[`question-${index}`] =
          "Au moins une question doit être remplie.";
        valid = false;
      }
    });
  }

  return valid;
};

const updateSurvey = async () => {
  if (!validateForm()) return;
  isUpdating.value = true;

  try {
    const multiplier = validateAndEvaluateMultiplier();
    if (multiplier === null) return;

    // Réorganiser toutes les positions avant l'envoi
    questions.value = questions.value
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .map((q, idx) => ({
        ...q,
        position: idx + 1,
      }));

    await supabase
      .from("surveys")
      .update({
        title: title.value,
        description: description.value,
        point_multiplier: multiplier,
      })
      .eq("id", id);

    if (deletedQuestions.value.length > 0) {
      await supabase
        .from("questions")
        .delete()
        .in("id", deletedQuestions.value);
    }

    // Mettre à jour les questions avec leurs positions réorganisées
    for (const question of questions.value) {
      if (question.id) {
        // Mise à jour d'une question existante
        await supabase
          .from("questions")
          .update({
            weighting: question.weighting || null,
            rating: question.rating || null,
            position: question.position, // Position réorganisée
          })
          .eq("id", question.id);
      } else {
        // Création d'une nouvelle question
        await supabase.from("questions").insert({
          survey_id: id,
          weighting: question.weighting || null,
          rating: question.rating || null,
          position: question.position, // Position réorganisée
        });
      }
    }

    toast.success("Sondage modifié avec succès !");
    navigateTo("/admin/surveys");
  } catch (error) {
    console.error(error);
    toast.error("Erreur lors de la modification du sondage.");
  } finally {
    isUpdating.value = false;
  }
};

const backToSurveys = () => navigateTo("/admin/surveys");
</script>
