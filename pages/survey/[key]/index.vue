<template>
  <div>
    <h1 class="text-3xl font-bold text-center my-8">
      {{ store.surveyTitle || "Partagez votre avis" }}
    </h1>
    <SurveyStep1 v-if="store.currentStep === 1" :survey-key="surveyKey" />
    <SurveyStep2 v-else-if="store.currentStep === 2" :survey-key="surveyKey" />
    <SurveyStep3 v-else-if="store.currentStep === 3" :survey-key="surveyKey" />
    <SurveyStep4 v-else-if="store.currentStep === 4" :survey-key="surveyKey" />
  </div>
</template>

<script setup lang="ts">
import SurveyStep1 from "@/components/Step1/SurveyStep1.vue";
import SurveyStep2 from "@/components/SurveyStep2.vue";
import SurveyStep3 from "@/components/SurveyStep3.vue";
import SurveyStep4 from "@/components/SurveyStep4.vue";
import { useRoute } from "nuxt/app";
import { useSurveyStore } from "~/stores/survey";
import { onMounted } from "vue";

const route = useRoute();
const store = useSurveyStore();
const surveyKey = route.params.key as string;

onMounted(async () => {
  await store.fetchSurveyById(surveyKey);
});
</script>
