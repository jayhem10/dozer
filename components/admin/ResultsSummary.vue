<template>
  <div class="overflow-x-auto">
    <table class="min-w-full bg-white">
      <thead>
        <tr class="bg-gray-50">
          <th
            class="px-6 py-3 text-center text-sm font-semibold text-gray-700 w-16"
          >
            #
          </th>
          <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">
            Question
          </th>
          <th class="px-6 py-3 text-center text-sm font-semibold text-gray-700">
            Moyenne
          </th>
          <th class="px-6 py-3 text-center text-sm font-semibold text-gray-700">
            Min
          </th>
          <th class="px-6 py-3 text-center text-sm font-semibold text-gray-700">
            Max
          </th>
          <th class="px-6 py-3 text-center text-sm font-semibold text-gray-700">
            Total
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        <!-- Section Pondérations -->
        <tr>
          <td colspan="6" class="px-6 py-4 bg-blue-50 font-medium">
            Pondérations
          </td>
        </tr>
        <tr
          v-for="(question, index) in allQuestions"
          :key="`weight-${question.id}`"
          :class="[
            'transition-colors',
            question.weighting ? 'hover:bg-gray-50' : 'bg-gray-50',
          ]"
        >
          <td class="px-6 py-4 text-center font-medium">{{ index + 1 }}</td>
          <td class="px-6 py-4">
            <span v-if="question.weighting">{{ question.weighting }}</span>
            <span v-else class="text-gray-400 italic">Pas de pondération</span>
          </td>
          <td
            class="px-6 py-4 text-center"
            :class="{ 'text-gray-400': !question.weighting }"
          >
            {{
              question.weighting
                ? getAverageWeight(question.id).toFixed(2)
                : "-"
            }}
          </td>
          <td
            class="px-6 py-4 text-center"
            :class="{ 'text-gray-400': !question.weighting }"
          >
            {{ question.weighting ? getMinWeight(question.id) : "-" }}
          </td>
          <td
            class="px-6 py-4 text-center"
            :class="{ 'text-gray-400': !question.weighting }"
          >
            {{ question.weighting ? getMaxWeight(question.id) : "-" }}
          </td>
          <td
            class="px-6 py-4 text-center"
            :class="{ 'text-gray-400': !question.weighting }"
          >
            {{ question.weighting ? getTotalWeight(question.id) : "-" }}
          </td>
        </tr>

        <!-- Espace entre les sections -->
        <tr class="h-6 bg-white">
          <td colspan="6"></td>
        </tr>

        <!-- Section Évaluations -->
        <tr>
          <td colspan="6" class="px-6 py-4 bg-green-50 font-medium">
            Évaluations
          </td>
        </tr>
        <tr
          v-for="(question, index) in allQuestions"
          :key="`rating-${question.id}`"
          :class="[
            'transition-colors',
            question.rating ? 'hover:bg-gray-50' : 'bg-gray-50',
          ]"
        >
          <td class="px-6 py-4 text-center font-medium">{{ index + 1 }}</td>
          <td class="px-6 py-4">
            <span v-if="question.rating">{{ question.rating }}</span>
            <span v-else class="text-gray-400 italic">Pas d'évaluation</span>
          </td>
          <td
            class="px-6 py-4 text-center"
            :class="{ 'text-gray-400': !question.rating }"
          >
            {{
              question.rating ? getAverageRating(question.id).toFixed(2) : "-"
            }}
          </td>
          <td
            class="px-6 py-4 text-center"
            :class="{ 'text-gray-400': !question.rating }"
          >
            {{ question.rating ? getMinRating(question.id) : "-" }}
          </td>
          <td
            class="px-6 py-4 text-center"
            :class="{ 'text-gray-400': !question.rating }"
          >
            {{ question.rating ? getMaxRating(question.id) : "-" }}
          </td>
          <td
            class="px-6 py-4 text-center"
            :class="{ 'text-gray-400': !question.rating }"
          >
            {{ question.rating ? getTotalRating(question.id) : "-" }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { Question, Response } from "@/stores/survey";
import { computed } from "vue";

const props = defineProps<{
  responses: Response[];
  weightingQuestions: Question[];
  ratingQuestions: Question[];
}>();

// Combine toutes les questions uniques
const allQuestions = computed(() => {
  const questionsMap = new Map();

  // Ajoute toutes les questions de pondération
  props.weightingQuestions.forEach((q) => {
    questionsMap.set(q.id, { ...q });
  });

  // Ajoute ou fusionne les questions d'évaluation
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

const getAverageWeight = (questionId: string) => {
  const weights = props.responses
    .map((r) => r.answers.weights[questionId]?.value)
    .filter((v): v is number => v !== undefined);
  return weights.length
    ? weights.reduce((a, b) => a + b, 0) / weights.length
    : 0;
};

const getAverageRating = (questionId: string) => {
  const ratings = props.responses
    .map((r) => r.answers.ratings[questionId]?.value)
    .filter((v): v is number => v !== undefined);
  return ratings.length
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : 0;
};

const getMinWeight = (questionId: string) => {
  const weights = props.responses
    .map((r) => r.answers.weights[questionId]?.value)
    .filter((v): v is number => v !== undefined);
  return weights.length ? Math.min(...weights) : 0;
};

const getMaxWeight = (questionId: string) => {
  const weights = props.responses
    .map((r) => r.answers.weights[questionId]?.value)
    .filter((v): v is number => v !== undefined);
  return weights.length ? Math.max(...weights) : 0;
};

const getMinRating = (questionId: string) => {
  const ratings = props.responses
    .map((r) => r.answers.ratings[questionId]?.value)
    .filter((v): v is number => v !== undefined);
  return ratings.length ? Math.min(...ratings) : 0;
};

const getMaxRating = (questionId: string) => {
  const ratings = props.responses
    .map((r) => r.answers.ratings[questionId]?.value)
    .filter((v): v is number => v !== undefined);
  return ratings.length ? Math.max(...ratings) : 0;
};

const getTotalWeight = (questionId: string) => {
  return props.responses
    .map((r) => r.answers.weights[questionId]?.value || 0)
    .reduce((a, b) => a + b, 0);
};

const getTotalRating = (questionId: string) => {
  return props.responses
    .map((r) => r.answers.ratings[questionId]?.value || 0)
    .reduce((a, b) => a + b, 0);
};
</script>
