<template>
  <article class="bg-white p-6 rounded-lg shadow overflow-x-auto">
    <!-- Header with ID and Date -->
    <header class="mb-6 flex justify-between items-center">
      <h2 class="font-semibold text-lg">Réponse détaillée</h2>
      <div class="text-sm text-gray-500">
        <span>ID: {{ response.id }}</span>
        <span class="mx-1">-</span>
        <time>{{ formatDate(response.submitted_at) }}</time>
      </div>
    </header>

    <table class="min-w-full">
      <thead>
        <tr class="bg-gray-50">
          <th
            class="px-6 py-3 text-center text-sm font-semibold text-gray-700 w-16"
          >
            #
          </th>
          <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">
            Questions (Pondération / Évaluation)
          </th>
          <th class="px-6 py-3 text-center text-sm font-semibold text-gray-700">
            Pondération
          </th>
          <th class="px-6 py-3 text-center text-sm font-semibold text-gray-700">
            Évaluation
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        <tr
          v-for="(question, index) in allQuestions"
          :key="question.id"
          class="hover:bg-gray-50"
        >
          <td class="px-6 py-4 text-center font-medium">{{ index + 1 }}</td>
          <td class="px-6 py-4">
            <div class="space-y-1">
              <div v-if="question.weighting" class="text-[#588282]">
                {{ question.weighting }}
              </div>
              <div v-if="question.rating" class="text-[#8772b2]">
                {{ question.rating }}
              </div>
              <div
                v-if="!question.weighting && !question.rating"
                class="text-gray-400 italic"
              >
                Pas de question
              </div>
            </div>
          </td>
          <td
            class="px-6 py-4 text-center space-y-1"
            :class="{
              'bg-gray-100': !question.weighting,
              'text-[#588282]': question.weighting,
              'text-gray-400':
                !question.weighting && getWeightValue(question.id) === 0,
            }"
          >
            {{ question.weighting ? getWeightValue(question.id) : "-" }}
          </td>
          <td
            class="px-6 py-4 text-center space-y-1"
            :class="{
              'bg-gray-100': !question.rating,
              'text-[#8772b2]': question.rating,
              'text-gray-400':
                !question.rating && getRatingValue(question.id) === 0,
            }"
          >
            {{ question.rating ? getRatingValue(question.id) : "-" }}
          </td>
        </tr>
      </tbody>
    </table>
  </article>
</template>

<script setup lang="ts">
import { Question, Response } from "stores/survey";
import { ref, onMounted, computed } from "vue";

interface Props {
  response: Response;
  weightingQuestions: Question[];
  ratingQuestions: Question[];
}

const props = defineProps<Props>();

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("fr-FR");
};

const getWeightValue = (questionId: string): number | string => {
  return questionId in (props.response.answers?.weights || {})
    ? props.response.answers?.weights[questionId]?.value || 0
    : "-";
};

const getRatingValue = (questionId: string): number | string => {
  return questionId in (props.response.answers?.ratings || {})
    ? props.response.answers?.ratings[questionId]?.value || 0
    : "-";
};

const allQuestions = computed(() => {
  const questionsMap = new Map();

  props.weightingQuestions.forEach((q) => {
    questionsMap.set(q.id, { ...q });
  });

  props.ratingQuestions.forEach((q) => {
    if (questionsMap.has(q.id)) {
      questionsMap.get(q.id).rating = q.rating;
    } else {
      questionsMap.set(q.id, { ...q });
    }
  });

  return Array.from(questionsMap.values()).sort(
    (a, b) => a.position - b.position
  );
});
</script>
