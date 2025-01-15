<template>
  <div class="space-y-6">
    <h2 class="text-lg font-bold text-center">Analyse des Réponses</h2>
    <ClientOnly>
      <div class="relative bg-white p-6 rounded-lg shadow max-w-5xl mx-auto">
        <div class="relative h-[500px] w-full">
          <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
        </div>
      </div>
    </ClientOnly>

    <div class="mt-4 bg-white p-4 rounded-lg shadow max-w-5xl mx-auto">
      <h3 class="text-md font-bold text-gray-800 mb-4">
        Détails des Questions
      </h3>
      <table
        class="w-full border-collapse border border-gray-300 text-gray-700"
      >
        <thead>
          <tr>
            <th class="border border-gray-300 px-4 py-2 bg-gray-200 text-left">
              #
            </th>
            <th class="border border-gray-300 px-4 py-2 bg-gray-200 text-left">
              Question
            </th>
            <th
              class="border border-gray-300 px-4 py-2 bg-gray-200 text-center"
            >
              Moyenne des Ratings
            </th>
            <th
              class="border border-gray-300 px-4 py-2 bg-gray-200 text-center"
            >
              Moyenne des Weights
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(label, index) in numberedQuestionLabels"
            :key="index"
            class="odd:bg-white even:bg-gray-50"
          >
            <td class="border border-gray-300 px-4 py-2 text-center font-bold">
              {{ index + 1 }}
            </td>
            <td class="border border-gray-300 px-4 py-2">{{ label }}</td>
            <td class="border border-gray-300 px-4 py-2 text-center">
              {{
                averageRatings[index] !== undefined
                  ? averageRatings[index]
                  : "N/A"
              }}
            </td>
            <td class="border border-gray-300 px-4 py-2 text-center">
              {{
                averageWeights[index] !== undefined
                  ? averageWeights[index]
                  : "N/A"
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const props = defineProps({
  responses: {
    type: Array,
    required: true,
  },
  questionLabels: {
    type: Object,
    required: true,
  },
});

// Extract question labels for displaying questions and legends
const numberedQuestionLabels = computed(() =>
  Object.values(props.questionLabels)
);

// Prepare data for the chart
const chartData = computed(() => {
  const questionIds = Object.keys(props.questionLabels);
  const averageRatings = [];
  const minRatings = [];
  const maxRatings = [];
  const averageWeights = [];
  const minWeights = [];
  const maxWeights = [];

  questionIds.forEach((id) => {
    const allRatings = props.responses.map(
      (response) => response.answers.ratings[id]?.value || 0
    );
    const allWeights = props.responses.map(
      (response) => response.answers.weights[id]?.value || 0
    );

    // Ratings
    const averageRating =
      allRatings.reduce((sum, value) => sum + value, 0) / allRatings.length ||
      0;
    const minRating = Math.min(...allRatings);
    const maxRating = Math.max(...allRatings);

    // Weights
    const averageWeight =
      allWeights.reduce((sum, value) => sum + value, 0) / allWeights.length ||
      0;
    const minWeight = Math.min(...allWeights);
    const maxWeight = Math.max(...allWeights);

    averageRatings.push(parseFloat(averageRating.toFixed(2)));
    minRatings.push(minRating);
    maxRatings.push(maxRating);

    averageWeights.push(parseFloat(averageWeight.toFixed(2)));
    minWeights.push(minWeight);
    maxWeights.push(maxWeight);
  });

  return {
    labels: questionIds.map((_, index) => `${index + 1}`), // Display only numbers
    datasets: [
      {
        label: "Moyenne des Ratings",
        data: averageRatings,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Valeur la plus basse des Ratings",
        data: minRatings,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
      {
        label: "Valeur la plus haute des Ratings",
        data: maxRatings,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
      {
        label: "Moyenne des Weights",
        data: averageWeights,
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
      {
        label: "Valeur la plus basse des Weights",
        data: minWeights,
        backgroundColor: "rgba(255, 206, 86, 0.6)",
      },
      {
        label: "Valeur la plus haute des Weights",
        data: maxWeights,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };
});

// Calculate averages for the table
const averageRatings = computed(() => {
  const questionIds = Object.keys(props.questionLabels);
  return questionIds.map((id) => {
    const allRatings = props.responses.map(
      (response) => response.answers.ratings[id]?.value || 0
    );
    if (allRatings.length === 0) return undefined;
    const average =
      allRatings.reduce((sum, value) => sum + value, 0) / allRatings.length;
    return parseFloat(average.toFixed(2));
  });
});

const averageWeights = computed(() => {
  const questionIds = Object.keys(props.questionLabels);
  return questionIds.map((id) => {
    const allWeights = props.responses.map(
      (response) => response.answers.weights[id]?.value || 0
    );
    if (allWeights.length === 0) return undefined;
    const average =
      allWeights.reduce((sum, value) => sum + value, 0) / allWeights.length;
    return parseFloat(average.toFixed(2));
  });
});

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Analyse des Réponses par Question",
    },
  },
  scales: {
    x: {
      ticks: {
        callback: function (value, index) {
          return `${index + 1}`;
        },
        font: {
          size: 12,
        },
      },
      title: {
        display: true,
        text: "Numéro des Questions",
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Valeurs",
      },
    },
  },
};
</script>

<style scoped>
/* Style for the container to center and adapt to all devices */
.relative {
  width: 100%;
}
</style>
