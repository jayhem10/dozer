<template>
  <div class="max-w-2xl mx-auto p-6">
    <SurveyRules />
    <KeyValidation />
  </div>
</template>

<script setup lang="ts">
import KeyValidation from "./Step1/KeyValidation.vue";
import SurveyRules from "./Step1/SurveyRules.vue";
</script>
