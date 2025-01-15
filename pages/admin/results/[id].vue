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
      <div v-if="responses && responses.length > 0">
        <ResponsesTotals :responses="responses" />
        <ResponsesChart
          :responses="responses"
          :questionLabels="questionLabels"
        />
      </div>

      <div>
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
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import ResponsesTotals from "@/components/admin/ResponsesTotals.vue";
import ResponseCard from "@/components/admin/ResponseCard.vue";
import ResponsesChart from "@/components/admin/ResponsesChart.vue";
import { useRoute } from "vue-router";

const route = useRoute();
const store = useSurveyStore();
const supabase = useSupabaseClient();

const surveyId = route.params.id;
const isLoading = ref(true);

const currentSurvey = computed(() => store.currentSurvey);
const responses = computed(() => store.currentSurvey?.responses);

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

    const globalTotals = {
      ratings: {},
      weights: {},
    };

    const questionIds = new Set();
    const questionLabels = {};
    responseData.forEach((response) => {
      const ratings = response.answers.ratings || {};
      const weights = response.answers.weights || {};

      Object.keys({ ...ratings, ...weights }).forEach((questionId) => {
        questionIds.add(questionId);
        questionLabels[questionId] =
          ratings[questionId]?.text ||
          weights[questionId]?.text ||
          "Question inconnue";

        if (!globalTotals.ratings[questionId]) {
          globalTotals.ratings[questionId] = 0;
        }
        if (!globalTotals.weights[questionId]) {
          globalTotals.weights[questionId] = 0;
        }

        globalTotals.ratings[questionId] += ratings[questionId]?.value || 0;
        globalTotals.weights[questionId] += weights[questionId]?.value || 0;
      });
    });

    const sortedQuestionIds = Array.from(questionIds).sort();

    let csvContent = `"Question"\n`;
    sortedQuestionIds.forEach((id, index) => {
      csvContent += `"${index + 1}: ${questionLabels[id]}"\n`;
    });
    csvContent += `\n`;

    csvContent += `"ID de réponse","${sortedQuestionIds
      .flatMap((_, index) => [`Pondération ${index + 1}`, `Note ${index + 1}`])
      .join('","')}"\n`;

    responseData.forEach((response) => {
      const ratings = response.answers.ratings || {};
      const weights = response.answers.weights || {};

      const values = sortedQuestionIds
        .map((id) => [
          weights[id]?.value !== undefined ? weights[id].value : 0,
          ratings[id]?.value !== undefined ? ratings[id].value : 0,
        ])
        .flat();

      csvContent += `"${response.id}","${values.join('","')}"\n`;
    });

    const totalValues = sortedQuestionIds
      .map((id) => [
        globalTotals.weights[id] || 0,
        globalTotals.ratings[id] || 0,
      ])
      .flat();

    csvContent += `"Totaux globaux","${totalValues.join('","')}"\n\n`;

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
  const responsesData = store.currentSurvey?.responses || [];
  responsesData.forEach((response) => {
    const ratings = response.answers.ratings || {};
    const weights = response.answers.weights || {};

    Object.keys({ ...ratings, ...weights }).forEach((id) => {
      labels[id] =
        ratings[id]?.text || weights[id]?.text || "Question inconnue";
    });
  });
  return labels;
});
</script>
