<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ surveyName }}</h1>
      <div class="flex space-x-4">
        <button
          @click="generateExport"
          class="bg-green-500 text-white px-4 py-2 rounded-md shadow hover:bg-green-600 transition"
        >
          <font-awesome-icon :icon="['fas', 'file-export']" />
          Exporter en CSV
        </button>
        <button
          @click="backToResults"
          class="bg-gray-500 text-white px-4 py-2 rounded-md shadow hover:bg-gray-600 transition"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
        </button>
      </div>
    </div>
    <p class="text-gray-600 mb-10">{{ surveyDescription }}</p>
    <div v-if="responses && responses.length > 0">
      <ResponsesTotals :responses="responses" />
    </div>
    <!-- List of Responses -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>
    <div v-else>
      <div v-if="responses.length === 0" class="text-gray-600 text-center">
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
</template>

<script setup>
import { ref, onMounted } from "vue";
import ResponsesTotals from "@/components/admin/ResponsesTotals.vue";
import ResponseCard from "@/components/admin/ResponseCard.vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();

const surveyId = route.params.id;
const surveyName = ref("");
const surveyDescription = ref("");
const responses = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const { data: survey, error: surveyError } = await supabase
      .from("surveys")
      .select("title, description")
      .eq("id", surveyId)
      .single();

    if (surveyError) {
      console.error(
        "Erreur lors de la récupération de l'enquête :",
        surveyError
      );
    } else {
      surveyName.value = survey.title;
      surveyDescription.value = survey.description;
    }

    const { data: responseData, error: responseError } = await supabase
      .from("responses")
      .select("*")
      .eq("survey_id", surveyId)
      .order("submitted_at", { ascending: false });

    if (responseError) {
      console.error(
        "Erreur lors de la récupération des réponses :",
        responseError
      );
    } else {
      responses.value = responseData || [];
    }
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
      .select("answers, submitted_at")
      .eq("survey_id", surveyId);

    if (responsesError) {
      console.error(
        "Erreur lors de la récupération des réponses :",
        responsesError
      );
      return;
    }

    const globalTotals = {};
    responseData.forEach((response) => {
      const ratings = response.answers.ratings || {};
      const weights = response.answers.weights || {};

      Object.keys({ ...ratings, ...weights }).forEach((questionId) => {
        const questionText =
          ratings[questionId]?.text ||
          weights[questionId]?.text ||
          "Question inconnue";

        if (!globalTotals[questionId]) {
          globalTotals[questionId] = {
            text: questionText,
            totalRating: 0,
            totalWeight: 0,
          };
        }

        if (ratings[questionId]?.value) {
          globalTotals[questionId].totalRating += ratings[questionId].value;
        }

        if (weights[questionId]?.value) {
          globalTotals[questionId].totalWeight += weights[questionId].value;
        }
      });
    });

    let csvContent = `"Titre du questionnaire","Description","Nombre de clés","Clés utilisées"\n`;
    csvContent += `"${surveyName.value}","${surveyDescription.value}",${
      keys.length
    },${keys.filter((key) => key.is_used).length}\n\n`;

    csvContent += `"Totaux globaux des questions"\n\n`;
    csvContent += `"Question","Total Rating","Total Weight"\n`;
    Object.values(globalTotals).forEach((total) => {
      csvContent += `"${total.text}","${total.totalRating}","${total.totalWeight}"\n`;
    });
    csvContent += `\n`;

    csvContent += `"Clés utilisées et leurs réponses"\n\n`;

    keys
      .filter((key) => key.is_used)
      .forEach((key) => {
        csvContent += `Clé: ${key.key}\n`;
        csvContent += `"Question","Rating","Weight"\n`;

        const responsesForKey = responseData.filter(
          (response) => response.access_key_id === key.id
        );

        if (responsesForKey.length === 0) {
          csvContent += `Aucune réponse enregistrée pour cette clé.\n\n`;
        } else {
          responsesForKey.forEach((response) => {
            const ratings = response.answers.ratings || {};
            const weights = response.answers.weights || {};
            const allQuestions = Object.keys({
              ...ratings,
              ...weights,
            });

            allQuestions.forEach((questionId) => {
              const rating = ratings[questionId]?.value || "";
              const weight = weights[questionId]?.value || "";
              const questionText =
                ratings[questionId]?.text ||
                weights[questionId]?.text ||
                "Question inconnue";

              csvContent += `"${questionText}","${rating}","${weight}"\n`;
            });
          });
        }

        csvContent += `\n`;
      });

    csvContent += `"Clés non utilisées"\n\n`;
    keys
      .filter((key) => !key.is_used)
      .forEach((key) => {
        csvContent += `Clé: ${key.key}\n`;
      });

    const dateTime = new Date().toISOString().replace(/:/g, "-");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `export_${surveyName.value.replace(/\s+/g, "_")}_${dateTime}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Erreur lors de la génération de l'export :", err);
  }
};
</script>
