<template>
  <div class="space-y-4">
    <div v-for="question in questions" :key="question.id" class="border-b pb-4">
      <h3 class="font-medium mb-2">{{ question.weighting }}</h3>
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-600">
          Moyenne: {{ calculateAverage(question.id) }}
        </div>
        <div class="text-sm text-gray-600">
          Total: {{ calculateTotal(question.id) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  responses: any[];
  questions: any[];
}>();

const calculateAverage = (questionId: string) => {
  const values = props.responses.map(
    (r) => r.answers?.weights?.[questionId]?.value || 0
  );
  const sum = values.reduce((acc, val) => acc + val, 0);
  return (sum / values.length || 0).toFixed(2);
};

const calculateTotal = (questionId: string) => {
  return props.responses.reduce(
    (acc, r) => acc + (r.answers?.weights?.[questionId]?.value || 0),
    0
  );
};
</script>
