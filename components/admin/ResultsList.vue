<template>
  <div v-if="!isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <SurveyCard
      v-for="survey in surveys"
      :key="survey.id"
      :survey="survey"
      @click="viewResults(survey.id)"
    />
  </div>
  <div v-else class="flex justify-center items-center h-64">
    <div
      class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from "nuxt/app";
import { PropType } from "vue";

import type { Survey } from "@/stores/survey";

import SurveyCard from "./SurveyCard.vue";

const props = defineProps({
  surveys: {
    type: Array as PropType<Survey[]>,
    required: true,
  },
  isLoading: {
    type: Boolean,
    required: true,
  },
});

const viewResults = (id: string) => {
  navigateTo(`/admin/results/${id}`);
};
</script>
