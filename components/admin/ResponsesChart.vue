<template>
  <ClientOnly>
    <div class="h-[500px] w-full">
      <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
    </div>
  </ClientOnly>
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
  PointElement,
} from "chart.js";
import { computed } from "vue";
import { Question, Response } from "stores/survey";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const props = defineProps<{
  responses: Response[];
  weightingQuestions: Question[];
  ratingQuestions: Question[];
}>();

const questions = computed(() => {
  const allQuestions = new Map();

  props.weightingQuestions.forEach((q) => {
    allQuestions.set(q.id, { ...q });
  });

  props.ratingQuestions.forEach((q) => {
    if (allQuestions.has(q.id)) {
      allQuestions.get(q.id).rating = q.rating;
    } else {
      allQuestions.set(q.id, { ...q });
    }
  });

  return Array.from(allQuestions.values()).sort(
    (a, b) => (a.position || 0) - (b.position || 0)
  );
});

const getWeightingAverage = (questionId: string) => {
  const values = props.responses.map(
    (r) => r.answers?.weights?.[questionId]?.value || 0
  );
  return values.reduce((sum, val) => sum + val, 0) / values.length || 0;
};

const getRatingAverage = (questionId: string) => {
  const values = props.responses.map(
    (r) => r.answers?.ratings?.[questionId]?.value || 0
  );
  return values.reduce((sum, val) => sum + val, 0) / values.length || 0;
};

const getWeightingMinMax = (questionId: string): [number, number] => {
  const values = props.responses.map(
    (r) => r.answers?.weights?.[questionId]?.value || 0
  );
  return [Math.min(...values), Math.max(...values)];
};

const getRatingMinMax = (questionId: string): [number, number] => {
  const values = props.responses.map(
    (r) => r.answers?.ratings?.[questionId]?.value || 0
  );
  return [Math.min(...values), Math.max(...values)];
};

const chartData = computed(() => ({
  labels: questions.value.map((_, index) => `${index + 1}`),
  datasets: [
    // Pondérations
    {
      type: "bar",
      label: "Pondération Maximum",
      data: questions.value.map((q: Question) => {
        if (!q.weighting) return null;
        const [_, max] = getWeightingMinMax(q.id);
        return max;
      }),
      backgroundColor: "rgba(75, 192, 192, 0.9)",
      barPercentage: 0.9,
      categoryPercentage: 0.8,
      yAxisID: "y-weighting",
    },
    {
      type: "bar",
      label: "Pondération Moyenne",
      data: questions.value.map((q: Question) =>
        q.weighting ? getWeightingAverage(q.id) : null
      ),
      backgroundColor: "rgba(75, 192, 192, 0.6)",
      barPercentage: 0.9,
      categoryPercentage: 0.8,
      yAxisID: "y-weighting",
    },
    {
      type: "bar",
      label: "Pondération Minimum",
      data: questions.value.map((q: Question) => {
        if (!q.weighting) return null;
        const [min, _] = getWeightingMinMax(q.id);
        return min;
      }),
      backgroundColor: "rgba(75, 192, 192, 0.3)",
      barPercentage: 0.9,
      categoryPercentage: 0.8,
      yAxisID: "y-weighting",
    },
    // Évaluations
    {
      type: "bar",
      label: "Évaluation Maximum",
      data: questions.value.map((q: Question) => {
        if (!q.rating) return null;
        const [_, max] = getRatingMinMax(q.id);
        return max;
      }),
      backgroundColor: "rgba(153, 102, 255, 0.9)",
      barPercentage: 0.9,
      categoryPercentage: 0.8,
      yAxisID: "y-rating",
    },
    {
      type: "bar",
      label: "Évaluation Moyenne",
      data: questions.value.map((q: Question) =>
        q.rating ? getRatingAverage(q.id) : null
      ),
      backgroundColor: "rgba(153, 102, 255, 0.6)",
      barPercentage: 0.9,
      categoryPercentage: 0.8,
      yAxisID: "y-rating",
    },
    {
      type: "bar",
      label: "Évaluation Minimum",
      data: questions.value.map((q: Question) => {
        if (!q.rating) return null;
        const [min, _] = getRatingMinMax(q.id);
        return min;
      }),
      backgroundColor: "rgba(153, 102, 255, 0.3)",
      barPercentage: 0.9,
      categoryPercentage: 0.8,
      yAxisID: "y-rating",
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Résultats par question",
      font: {
        size: 16,
        weight: "bold" as const,
      },
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const datasetLabel = context.dataset.label;
          const value = context.parsed.y;
          const question = questions.value[context.dataIndex];

          const questionText = datasetLabel.includes("Pondération")
            ? question.weighting
            : question.rating;

          return [
            `${datasetLabel}: ${value.toFixed(2)}`,
            `Question: ${questionText}`,
          ];
        },
      },
    },
  },
  layout: {
    padding: {
      left: 10,
      right: 10,
      top: 0,
      bottom: 10,
    },
  },
  scales: {
    "y-weighting": {
      position: "left",
      beginAtZero: true,
      max: 10,
      ticks: {
        stepSize: 1,
      },
      title: {
        display: true,
        text: "Pondérations",
        padding: { top: 10, bottom: 10 },
      },
      grid: {
        drawOnChartArea: true,
      },
    },
    "y-rating": {
      position: "right",
      beginAtZero: true,
      max: 10,
      ticks: {
        stepSize: 1,
      },
      title: {
        display: true,
        text: "Évaluations",
        padding: { top: 10, bottom: 10 },
      },
      grid: {
        drawOnChartArea: false,
      },
    },
    x: {
      offset: true,
      title: {
        display: true,
        text: "Numéro de question",
        padding: { top: 10 },
      },
    },
  },
} as const;
</script>
