<template>
  <div>
    <h1 class="text-3xl font-bold text-center my-8">Enquête de satisfaction</h1>
    <SurveyStep1 v-if="store.currentStep === 1" />
    <SurveyStep2 v-else-if="store.currentStep === 2" />
    <SurveyStep3 v-else-if="store.currentStep === 3" />
    <SurveyStep4 v-else-if="store.currentStep === 4" />
  </div>
</template>

<script setup lang="ts">
const store = useSurveyStore();
</script>
