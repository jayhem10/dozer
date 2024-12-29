<template>
  <div class="bg-white p-6 shadow-md rounded-lg">
    <!-- Header: Response ID and Date -->
    <h3 class="text-xl font-semibold mb-4">
      Réponse #{{ response.id }} - {{ formatDate(response.submitted_at) }}
    </h3>

    <!-- Table for Weights and Ratings -->
    <div class="overflow-x-auto">
      <table
        class="min-w-full table-auto border-collapse border border-gray-200"
      >
        <thead class="bg-gray-100">
          <tr>
            <th
              class="border border-gray-200 px-4 py-2 text-left text-gray-700"
            >
              Question
            </th>
            <th
              class="border border-gray-200 px-4 py-2 text-left text-gray-700"
            >
              Pondérations
            </th>
            <th
              class="border border-gray-200 px-4 py-2 text-left text-gray-700"
            >
              Évaluations
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(data, questionId) in response.answers.weights"
            :key="questionId"
          >
            <td class="border border-gray-200 px-4 py-2 text-gray-800">
              {{ data.text }}
            </td>
            <td class="border border-gray-200 px-4 py-2 text-gray-600">
              {{ data.value }}
            </td>
            <td class="border border-gray-200 px-4 py-2 text-gray-600">
              {{ response.answers.ratings[questionId]?.value || "N/A" }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps(["response"]);

// Format the date into a readable French format
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
</script>

<style scoped>
/* Custom table styling can be added if needed */
</style>
