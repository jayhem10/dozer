<template>
  <div class="max-w-4xl mx-auto p-6 mt-10">
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>
    <div v-else-if="currentSurvey" class="space-y-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">{{ currentSurvey.title }}</h1>
        <div class="flex space-x-4">
          <button
            @click="generateExport"
            class="bg-green-500 text-white px-4 py-2 rounded-md shadow hover:bg-green-600 transition"
          >
            <font-awesome-icon :icon="['fas', 'file-export']" />
            Exporter en CSV
          </button>
          <button
            v-tippy="'Retour'"
            @click="backToResults"
            class="bg-gray-500 text-white px-4 py-2 rounded-md shadow hover:bg-gray-600 transition"
          >
            <font-awesome-icon :icon="['fas', 'arrow-left']" />
          </button>
        </div>
      </div>
      <p class="text-gray-600 mb-10">{{ currentSurvey.description }}</p>
      <div v-if="responses && responses.length > 0" class="space-y-8">
        <button
          @click="showSummary = !showSummary"
          class="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition"
        >
          <font-awesome-icon
            :icon="['fas', showSummary ? 'chevron-up' : 'chevron-down']"
          />
          {{ showSummary ? "Masquer" : "Afficher" }} le résumé des résultats
        </button>
        <Transition name="fade">
          <div class="bg-white p-6 rounded-lg shadow" v-if="showSummary">
            <div>
              <h2 class="text-xl font-semibold mb-4">Résumé des résultats</h2>
              <ResultsSummary
                :responses="responses"
                :weightingQuestions="weightingQuestions"
                :ratingQuestions="ratingQuestions"
              />
            </div>
          </div>
        </Transition>
        <div class="bg-white p-6 rounded-lg shadow">
          <ResponsesChart
            :responses="responses"
            :weightingQuestions="weightingQuestions"
            :ratingQuestions="ratingQuestions"
            :questionLabels="questionLabels"
          />
        </div>
      </div>
      <div class="w-full h-[2px] bg-gray-200 my-8"></div>
      <div class="text-xl font-bold text-center mb-6">
        Réponses des collaborateurs
      </div>
      <div
        v-if="responses && responses.length === 0"
        class="text-gray-600 text-center"
      >
        Aucune réponse enregistrée pour cette enquête.
      </div>
      <div v-else class="space-y-6">
        <ResponseCard
          v-for="response in responses"
          :key="response.id"
          :response="response"
          :weightingQuestions="weightingQuestions"
          :ratingQuestions="ratingQuestions"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import ResponseCard from "@/components/admin/ResponseCard.vue";
import ResponsesChart from "@/components/admin/ResponsesChart.vue";
import ResultsSummary from "@/components/admin/ResultsSummary.vue";

import { useRoute } from "vue-router";
import { navigateTo } from "nuxt/app";
import { useSurveyStore } from "@/stores/survey";

const route = useRoute();
const store = useSurveyStore();
const supabase = useSupabaseClient();

const surveyId = route.params.id;
const isLoading = ref(true);
const showSummary = ref(false);

const currentSurvey = computed(() => store.currentSurvey);
const responses = computed(() => store.currentSurvey?.responses);

const weightingQuestions = computed(() => {
  if (!currentSurvey.value?.questions) return [];
  return currentSurvey.value.questions.filter((q) => q.weighting);
});

const ratingQuestions = computed(() => {
  if (!currentSurvey.value?.questions) return [];
  return currentSurvey.value.questions.filter((q) => q.rating);
});

const allQuestions = computed(() => {
  if (!currentSurvey.value?.questions) return [];
  return currentSurvey.value.questions;
});

onMounted(async () => {
  try {
    store.currentSurvey = null;
    isLoading.value = true;

    await store.fetchSurveyById(surveyId, true);
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});

const backToResults = () => {
  navigateTo("/admin/results");
};

const generateExport = async () => {
  try {
    const { data: keys, error: keysError } = await supabase
      .from("access_keys")
      .select("id, key, is_used")
      .eq("survey_id", surveyId);

    if (keysError) {
      console.error("Erreur lors de la récupération des clés :", keysError);
      return;
    }

    const { data: responseData, error: responsesError } = await supabase
      .from("responses")
      .select("id, answers, submitted_at")
      .eq("survey_id", surveyId);

    if (responsesError) {
      console.error(
        "Erreur lors de la récupération des réponses :",
        responsesError
      );
      return;
    }

    // Créer un mapping des questions trié par position
    const sortedQuestions = currentSurvey.value.questions
      .sort((a, b) => a.position - b.position)
      .reduce((acc, question) => {
        acc[question.id] = {
          position: question.position,
          rating: question.rating,
          weight: question.weighting,
        };
        return acc;
      }, {});

    // Création de l'en-tête du CSV avec la liste des questions triées
    let csvContent = '"Questions"\n';

    // Créer les lignes d'en-tête pour chaque question
    Object.entries(sortedQuestions)
      .sort((a, b) => a[1].position - b[1].position)
      .forEach(([id, data], index) => {
        csvContent += `"${index + 1}","${data.weight || "N"}","${
          data.rating || "N"
        }"\n`;
      });

    csvContent += '\n"Résultats"\n';

    // En-têtes des colonnes pour les résultats
    const headers = ["ID"];
    Object.entries(sortedQuestions)
      .sort((a, b) => a[1].position - b[1].position)
      .forEach((_, index) => {
        headers.push(`Pondération ${index + 1}`, `Évaluation ${index + 1}`);
      });
    csvContent += `"${headers.join('","')}"\n`;

    // Ajouter les données pour chaque réponse
    responseData.forEach((response) => {
      const row = [response.id];
      const { ratings = {}, weights = {} } = response.answers;

      Object.entries(sortedQuestions)
        .sort((a, b) => a[1].position - b[1].position)
        .forEach(([questionId]) => {
          row.push(
            weights[questionId]?.value !== undefined
              ? weights[questionId].value
              : "N",
            ratings[questionId]?.value !== undefined
              ? ratings[questionId].value
              : "N"
          );
        });

      csvContent += `"${row.join('","')}"\n`;
    });

    // Calcul et ajout des totaux
    const totals = ["Totaux"];
    Object.entries(sortedQuestions)
      .sort((a, b) => a[1].position - b[1].position)
      .forEach(([questionId]) => {
        let weightTotal = 0;
        let ratingTotal = 0;
        let weightCount = 0;
        let ratingCount = 0;

        responseData.forEach((response) => {
          if (response.answers.weights?.[questionId]?.value !== undefined) {
            weightTotal += response.answers.weights[questionId].value;
            weightCount++;
          }
          if (response.answers.ratings?.[questionId]?.value !== undefined) {
            ratingTotal += response.answers.ratings[questionId].value;
            ratingCount++;
          }
        });

        totals.push(weightCount > 0 ? weightTotal : "N");
        totals.push(ratingCount > 0 ? ratingTotal : "N");
      });

    csvContent += `"${totals.join('","')}"\n\n`;

    // Ajouter les informations sur les clés
    csvContent += `"Clés non utilisées"\n`;
    keys
      .filter((key) => !key.is_used)
      .forEach((key) => {
        csvContent += `"${key.key}"\n`;
      });

    csvContent += `\n"Nombre total de clés: ${keys.length}"\n`;
    csvContent += `"Nombre de clés non utilisées: ${
      keys.filter((key) => !key.is_used).length
    }"\n`;

    // Téléchargement du fichier
    const dateTime = new Date().toISOString().replace(/:/g, "-");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `export_${store.currentSurvey.title.replace(/\s+/g, "_")}_${dateTime}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Erreur lors de la génération de l'export :", err);
  }
};

const questionLabels = computed(() => {
  const labels: Record<string, string> = {};

  weightingQuestions.value.forEach((q) => {
    if (q.id) labels[q.id] = q.weighting || "";
  });

  ratingQuestions.value.forEach((q) => {
    if (q.id) labels[q.id] = q.rating || "";
  });

  return labels;
});
</script>

<style scoped></style>
