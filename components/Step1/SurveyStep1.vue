<template>
  <div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
    <SurveyRules />
    <KeyValidation :survey-key="surveyKey" />
  </div>
</template>

<script setup lang="ts">
import SurveyRules from "@/components/Step1/SurveyRules.vue";
import KeyValidation from "@/components/Step1/KeyValidation.vue";

const props = defineProps<{
  surveyKey: string;
}>();
</script>
