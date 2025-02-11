<template>
  <div>
    <button
      @click="toggleTotals"
      class="mb-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
    >
      {{
        showTotals
          ? "Masquer les totaux globaux"
          : "Afficher les totaux globaux"
      }}
    </button>

    <div v-if="showTotals" class="bg-white p-4 rounded-md shadow mb-6">
      <h2 class="text-xl font-bold mb-4">Totaux Globaux</h2>
      <div class="overflow-x-auto">
        <table class="w-full table-auto border-collapse">
          <thead class="bg-gray-100">
            <tr>
              <th class="border border-gray-300 px-4 py-2">Question</th>
              <th class="border border-gray-300 px-4 py-2">
                Total Pondérations
              </th>
              <th class="border border-gray-300 px-4 py-2">
                Total Évaluations
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(totals, questionId) in combinedTotals"
              :key="questionId"
              class="hover:bg-gray-50 transition"
            >
              <td class="border border-gray-300 px-4 py-2">
                {{ totals.text }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ totals.totalWeights || 0 }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ totals.totalRatings || 0 }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";

const showTotals = ref(false);
interface FormattedAnswer {
  value: number;
  text: string;
}

interface Response {
  answers: {
    ratings: Record<string, FormattedAnswer>;
    weights: Record<string, FormattedAnswer>;
  };
}

interface QuestionTotals {
  text: string;
  totalRatings: number;
  totalWeights: number;
}

interface TotalsMap {
  [key: string]: QuestionTotals;
}

const props = defineProps({
  responses: {
    type: Array as PropType<Response[]>,
    required: true,
  },
});

const toggleTotals = () => {
  showTotals.value = !showTotals.value;
};

const combinedTotals = computed(() => {
  const totals: TotalsMap = {};

  props.responses.forEach((response) => {
    for (const [questionId, data] of Object.entries(
      response.answers.ratings || {}
    )) {
      if (!totals[questionId]) {
        totals[questionId] = {
          text: data.text,
          totalRatings: 0,
          totalWeights: 0,
        };
      }
      totals[questionId].totalRatings += data.value;
    }

    for (const [questionId, data] of Object.entries(
      response.answers.weights || {}
    )) {
      if (!totals[questionId]) {
        totals[questionId] = {
          text: data.text,
          totalRatings: 0,
          totalWeights: 0,
        };
      }
      totals[questionId].totalWeights += data.value;
    }
  });

  return totals;
});
</script>

<style scoped></style>
