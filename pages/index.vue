<template>
  <div>
    <h1 class="text-3xl font-bold text-center mb-8">Enquête de satisfaction</h1>
    <SurveyStep1 v-if="store.currentStep === 1" />
    <SurveyStep2 v-else-if="store.currentStep === 2" />
    <SurveyStep3 v-else-if="store.currentStep === 3" />
    <SurveyStep4 v-else-if="store.currentStep === 4" />
  </div>
</template>

<script setup lang="ts">
import SurveyStep1 from "@/components/SurveyStep1.vue";
import SurveyStep2 from "@/components/SurveyStep2.vue";
import SurveyStep3 from "@/components/SurveyStep3.vue";
import SurveyStep4 from "@/components/SurveyStep4.vue";
import { useSurveyStore } from "@/stores/survey";
const store = useSurveyStore();
</script>
